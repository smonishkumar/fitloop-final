import logging
import json
import cv2
import numpy as np
from .model import ClothingClassifier, ColorDetector, ObjectDetector
from .inventory import generate_image_hash, InventoryManager
from PIL import Image

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WardrobeIntelligence:
    def __init__(self, device=None):
        logger.info("Initializing High-Performance Wardrobe Intelligence Model...")
        self.classifier = ClothingClassifier(device=device)
        self.color_detector = ColorDetector()
        self.object_detector = ObjectDetector() # Uses yolov8x-seg.pt (Fast Native Segmentation)
        self.inventory_manager = InventoryManager()
        logger.info("Model initialized successfully.")

    def wardrobe_scan(self, image_path):
        logger.info(f"Scanning image: {image_path}")
        
        detection_data = self.object_detector.detect_all_zones(image_path)
        all_boxes = detection_data["items"]
        is_pile = detection_data["is_pile"]
        
        full_image_cv = cv2.imread(image_path)
        full_image_pil = Image.open(image_path).convert("RGB")
        
        results = []
        if not all_boxes:
            logger.info("No items detected. Returning empty.")
            return results
            
        # Global NMS: Prefer YOLO and large items
        all_boxes.sort(key=lambda b: (b.get("is_yolo", False), (b["box"][2]-b["box"][0])*(b["box"][3]-b["box"][1])), reverse=True)
        
        filtered_boxes = []
        for b_info in all_boxes:
            overlap = False
            b1 = b_info["box"]
            for f_info in filtered_boxes:
                b2 = f_info["box"]
                # Horizontal Overlap for hanging garments, IOU for others
                is_thin = (b1[3]-b1[1]) > (b1[2]-b1[0]) * 2
                h_overlap = max(0, min(b1[2], b2[2]) - max(b1[0], b2[0])) / float(min(b1[2]-b1[0], b2[2]-b2[0]) + 1e-6)
                
                if not is_pile and is_thin and h_overlap > 0.8:
                    overlap = True
                    break
                elif self.object_detector.calculate_iou(b1, b2) > 0.5:
                    overlap = True
                    break
            if not overlap:
                filtered_boxes.append(b_info)
        
        all_boxes = filtered_boxes
        logger.info(f"Processing {len(all_boxes)} items (Structure: {'Pile' if is_pile else 'Wardrobe'})...")
        
        for i, box_info in enumerate(all_boxes):
            box = box_info["box"]
            x1, y1, x2, y2 = box
            h, w = full_image_cv.shape[:2]
            
            crop_cv = full_image_cv[y1:y2, x1:x2]
            crop_pil = full_image_pil.crop((x1, y1, x2, y2))
            
            # Use native YOLO mask if available for background removal
            if "mask" in box_info:
                mask = box_info["mask"]
                # Resize mask to crop size
                m_crop = cv2.resize(mask, (x2-x1, y2-y1), interpolation=cv2.INTER_LINEAR)
                _, m_bin = cv2.threshold(m_crop, 0.5, 1, cv2.THRESH_BINARY)
                
                # Perform color detection with mask
                if np.sum(m_bin) > 0:
                    m_uint8 = (m_bin * 255).astype(np.uint8)
                    color_info = self.color_detector.detect_dominant_color(crop_cv, mask=m_uint8)
                else:
                    color_info = self.color_detector.detect_dominant_color(crop_cv)
            else:
                color_info = self.color_detector.detect_dominant_color(crop_cv)

            # Determine zone
            zone = "A"
            mid_y = (y1 + y2) / 2
            if not is_pile:
                if mid_y > h * 0.75: zone = "C"
                elif mid_y > h * 0.5: zone = "B"

            item_result = self._process_crop(crop_cv, crop_pil, f"crop_{i}", box=box, zone=zone, is_yolo=True)
            
            # Inject the accurately detected color
            if "error" not in item_result:
                item_result["color"] = color_info["name"]
                item_result["box"] = box
                item_result["zone"] = zone
                results.append(item_result)

        return results

    def _process_crop(self, crop_cv, crop_pil, label, box=None, zone="A", is_yolo=False):
        try:
            # Skip extremely small crops that might be noise
            if crop_cv.shape[0] < 30 or crop_cv.shape[1] < 20:
                return {"error": "Crop too small to be a valid item"}

            clothing_type, confidence, img_features = self.classifier.classify(crop_pil, zone=zone)
            
            # Filter low-confidence detections (adaptive threshold)
            # YOLO is high-precision, Heuristics are speculative
            min_thresh = 0.25 if is_yolo else 0.35
            if confidence < min_thresh:
                logger.debug(f"Rejecting {clothing_type} due to low confidence: {confidence:.2f} (is_yolo={is_yolo})")
                return {"error": f"Low confidence ({confidence:.2f})"}

            color_info = self.color_detector.detect_dominant_color(crop_cv)
            
            # Wardrobe/Hanger Suppression: Reject wood-colored items if they are heuristic and low confidence
            if not is_yolo and color_info["name"] == "orange_brown" and confidence < 0.55:
                # Most hangers/wardrobe wood falls into orange_brown
                logger.debug(f"Rejecting {clothing_type} as suspected wardrobe background (wood-colored).")
                return {"error": "Suspected background/hanger artifact"}

            from .inventory import generate_image_hash_from_pil
            image_hash = generate_image_hash_from_pil(crop_pil)
            is_dup = self.inventory_manager.is_duplicate(img_features)
            
            result = {
                "type": clothing_type,
                "color": color_info["name"],
                "confidence": round(confidence, 2),
                "is_duplicate": is_dup,
                "image_hash": image_hash,
                "image_features": img_features
            }
            
            if not is_dup:
                added_item = self.inventory_manager.add_to_inventory(result)
                result["item_id"] = added_item["id"]
                
            return result
        except Exception as e:
            logger.error(f"Error processing item {label}: {str(e)}")
            return {"error": str(e)}

    def get_inventory(self):
        return self.inventory_manager.get_inventory()

_engine = None
def wardrobe_scan(image_path):
    global _engine
    if _engine is None:
        _engine = WardrobeIntelligence()
    return _engine.wardrobe_scan(image_path)
