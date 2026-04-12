"""
main.py  ─  WardrobeIntelligence pipeline
────────────────────────────────────────
Architecture (Deep Scan Mode):
  1.  Gemini Deep Scan  → Full-image discovery (finds ALL items including shelf)
  2.  YOLOv8-seg        → Bounding box detection for crop-level hashing
  3.  Merge & Dedupe    → Reconcile both sources for complete inventory
"""

import logging
import os
import json
import cv2
import numpy as np
from .model import ClothingClassifier, ColorDetector, ObjectDetector
from .inventory import generate_image_hash, InventoryManager, generate_image_hash_from_pil
from .gemini_classifier import GeminiClothingClassifier
from PIL import Image

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WardrobeIntelligence:
    def __init__(self, device=None, gemini_api_key: str = None,
                 use_full_wardrobe_gemini: bool = False):
        logger.info("Initializing Wardrobe Intelligence (Deep Scan Mode)...")
        self.object_detector = ObjectDetector()
        self.color_detector  = ColorDetector()
        self.clip_classifier = ClothingClassifier(device=device)
        self.inventory_manager = InventoryManager()

        self.gemini = GeminiClothingClassifier(
            api_keys=gemini_api_key,
            model_name="gemini-2.5-flash",
        )
        self.use_full_wardrobe_gemini = use_full_wardrobe_gemini
        logger.info(f"✅ Model initialized | Mode: Gemini Deep Scan + YOLO")

    def wardrobe_scan(self, image_path: str) -> list:
        logger.info(f"Scanning image: {image_path}")
        
        full_image_pil = Image.open(image_path).convert("RGB")
        full_image_cv  = cv2.imread(image_path)
        h_full, w_full = full_image_cv.shape[:2]

        # ── Step 1: Gemini Deep Scan (Full-Image Discovery) ───────────────
        deep_scan_results = []
        if self.gemini.is_available:
            logger.info("🔍 Running Gemini Deep Scan (full-image discovery)...")
            deep_scan_results = self.gemini.deep_scan_full_image(full_image_pil)
            logger.info(f"   Deep Scan found {len(deep_scan_results)} items.")

        if not deep_scan_results:
            logger.warning("Deep Scan returned no items. Falling back to YOLO-only mode.")
            return self._yolo_only_scan(image_path, full_image_cv, full_image_pil)

        # ── Step 2: Build final results from Deep Scan ────────────────────
        results = []
        for item in deep_scan_results:
            result = {
                "type":          item["type"],
                "color":         item["color"],
                "pattern":       item.get("pattern", "unknown"),
                "material":      item.get("material", "unknown"),
                "style":         item.get("style", "unknown"),
                "confidence":    round(item["confidence"], 2),
                "gemini_label":  item.get("gemini_label", ""),
                "classified_by": "gemini_deep",
                "zone":          item.get("zone", "hanging"),
                "item_number":   item.get("item_number", 0),
                "image_hash":    hex(hash(item.get("gemini_label", "") + item.get("color", ""))),
                "box":           [],
                "is_duplicate":  False,
            }
            results.append(result)

        logger.info(f"Scan complete. {len(results)} items classified.")
        return results

    def _yolo_only_scan(self, image_path, full_image_cv, full_image_pil):
        """Fallback: YOLO-only detection if Gemini Deep Scan fails."""
        detection_data = self.object_detector.detect_all_zones(image_path)
        all_boxes      = detection_data["items"]
        if not all_boxes: return []

        h_full, w_full = full_image_cv.shape[:2]
        
        # Try batched Gemini classification
        gemini_batch_results = []
        if self.gemini.is_available:
            logger.info(f"Executing Spatial Batching for {len(all_boxes)} items...")
            batch_input = [{"id": i, "box": b["box"]} for i, b in enumerate(all_boxes)]
            gemini_batch_results = self.gemini.classify_batch(full_image_pil, batch_input)

        batch_map = {res["box_id"]: res for res in gemini_batch_results if res.get("box_id") is not None}

        results = []
        for i, box_info in enumerate(all_boxes):
            box = box_info["box"]
            x1, y1, x2, y2 = box
            crop_cv  = full_image_cv[y1:y2, x1:x2]
            crop_pil = full_image_pil.crop((x1, y1, x2, y2))

            color_info = self.color_detector.detect_dominant_color(crop_cv)
            
            zone = "hanging"
            mid_y = (y1 + y2) / 2
            if mid_y > h_full * 0.70:
                zone = "shelf"

            gemini_data = batch_map.get(i)
            item_result = self._process_crop_optimized(
                crop_pil, gemini_data=gemini_data, zone=zone, cv_color=color_info["name"]
            )
            if "error" not in item_result:
                item_result["box"] = box
                item_result["zone"] = zone
                results.append(item_result)

        logger.info(f"Scan complete. {len(results)} items classified.")
        return results

    def _process_crop_optimized(self, crop_pil, gemini_data=None, zone="hanging", cv_color=None) -> dict:
        try:
            if not gemini_data:
                logger.warning("No Gemini data for item. Skipping (CLIP fallback is disabled).")
                return {"error": "No Gemini data"}

            _, _, img_features = self.clip_classifier.classify(crop_pil, zone=zone)
            image_hash = generate_image_hash_from_pil(crop_pil)
            
            result = {
                "type":            gemini_data["type"],
                "color":           gemini_data["color"] if gemini_data["color"] != "unknown" else cv_color,
                "pattern":         gemini_data.get("pattern", "unknown"),
                "material":        gemini_data.get("material", "unknown"),
                "style":           gemini_data.get("style", "unknown"),
                "confidence":      round(gemini_data["confidence"], 2),
                "gemini_label":    gemini_data.get("gemini_label", ""),
                "classified_by":   "gemini_batch",
                "image_hash":      image_hash,
                "image_features":  img_features,
            }

            is_dup = self.inventory_manager.is_duplicate(img_features)
            result["is_duplicate"] = is_dup
            if not is_dup:
                added = self.inventory_manager.add_to_inventory(result)
                result["item_id"] = added["id"]

            return result
        except Exception as e:
            return {"error": str(e)}

    def get_inventory(self) -> list:
        return self.inventory_manager.get_inventory()

_engine = None
def wardrobe_scan(image_path: str) -> list:
    global _engine
    if _engine is None:
        _engine = WardrobeIntelligence()
    return _engine.wardrobe_scan(image_path)
