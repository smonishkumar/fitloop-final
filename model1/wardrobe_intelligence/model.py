import torch
import clip
import cv2
import numpy as np
from PIL import Image
import os
from ultralytics import YOLO
from sklearn.cluster import KMeans
import math
import warnings

class ObjectDetector:
    def __init__(self, model_name="yolov8x-seg.pt"):
        self.model = YOLO(model_name)
        
    @staticmethod
    def calculate_iou(box1, box2):
        """Calculates Intersection Over Union (IOU) between two boxes."""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        inter_area = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        return inter_area / float(area1 + area2 - inter_area + 1e-6)

    def detect_all_zones(self, image_path, conf=0.15, iou=0.45):
        img = cv2.imread(image_path)
        if img is None:
            return []
            
        h, w = img.shape[:2]
        
        # Determine if this is a Wardrobe or a Pile
        is_pile = self.detect_is_pile(img)
        
        all_boxes = []
        
        # Panoramic Wardrobe: Use 6-8 tiles for maximum resolution
        if not is_pile and not h > w:
            num_tiles = 8
            tile_w = int(w * 0.3) # Narrower tiles = more resolution
            step = int((w - tile_w) / (num_tiles - 1)) if num_tiles > 1 else 0
            for i in range(num_tiles):
                x1 = i * step
                tile_img = img[:, x1:x1+tile_w]
                results = self.model(tile_img, conf=conf, iou=0.25, verbose=False)
                all_boxes.extend(self._extract_yolo_data(results, x1, 0))
        else:
            # Pile or Portrait: Single pass is usually enough and faster
            results = self.model(img, conf=conf, iou=iou, verbose=False)
            all_boxes.extend(self._extract_yolo_data(results, 0, 0))

        # Only run heuristics if it's a Wardrobe and YOLO found very little
        if not is_pile and len(all_boxes) < 10:
            y_a = int(h * 0.5)
            all_boxes.extend(self.extract_hanger_crops(img[0:y_a, :], 0, "A"))
        
        return {"items": all_boxes, "is_pile": is_pile}

    def detect_is_pile(self, img):
        """Heuristically detect if it's a messy pile (random orientations) or a wardrobe."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Look for the horizontal clothes rail (Hough Lines)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=int(img.shape[1]*0.3), maxLineGap=10)
        
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                # Horizontal line near the top 30% of image?
                if abs(y1 - y2) < 20 and y1 < img.shape[0] * 0.4:
                    return False # Likely a wardrobe rail found
        
        # If no rail, check for highly vertical edges (hangers)
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=5)
        if np.mean(np.abs(sobel_x)) > 50: # Arbitrary threshold for dense vertical edges
             return False
             
        return True # Default to pile if no structure found

    def _extract_yolo_data(self, results, offset_x, offset_y):
        pts = []
        for r in results:
            if r.boxes is not None:
                for i, b in enumerate(r.boxes):
                    coords = b.xyxy[0].cpu().numpy().tolist()
                    box = [int(coords[0] + offset_x), int(coords[1] + offset_y), int(coords[2] + offset_x), int(coords[3] + offset_y)]
                    
                    data = {
                        "box": box,
                        "is_yolo": True,
                        "conf": float(b.conf[0])
                    }
                    
                    # Extract native mask if available
                    if r.masks is not None:
                        # Rescale mask to original tile/image size
                        m = r.masks.data[i].cpu().numpy()
                        data["mask"] = m
                        
                    pts.append(data)
        return pts

    def refine_with_sam(self, image_path, box):
        # SAM removed for speed as per unified plan. 
        # We now use the 'mask' field from _extract_yolo_data.
        return None
        
    def extract_hanger_crops(self, zone_img, offset_y, zone_label):
        h, w = zone_img.shape[:2]
        gray = cv2.cvtColor(zone_img, cv2.COLOR_BGR2GRAY)
        
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=5)
        sobel_x = np.absolute(sobel_x)
        sobel_x = np.uint8(255 * sobel_x / np.max(sobel_x))
        
        rail_offset = int(h * 0.2)
        lower_area = sobel_x[rail_offset:, :]
        
        col_sums = np.sum(lower_area, axis=0)
        
        # Adaptive threshold for peaks: must be significantly higher than local mean
        mean_v = np.mean(col_sums)
        std_v = np.std(col_sums)
        peak_thresh = mean_v + 1.2 * std_v
        
        # Find boundaries by looking for valleys between peaks
        boundaries = [0]
        in_peak = False
        for x in range(1, w - 1):
            if col_sums[x] > peak_thresh and not in_peak:
                in_peak = True
                if x - boundaries[-1] > 15: # Min width
                    boundaries.append(x)
            elif col_sums[x] < peak_thresh and in_peak:
                in_peak = False
                
        boundaries.append(w)
        
        boxes = []
        for i in range(len(boundaries) - 1):
            x1 = int(boundaries[i])
            x2 = int(boundaries[i+1])
            if x2 - x1 >= 25: 
                # Basic content check: must have sufficient edge density
                crop = zone_img[:, x1:x2]
                if self._has_sufficient_content(crop):
                    boxes.append({
                        "box": [x1, offset_y, x2, h + offset_y],
                        "zone": zone_label
                    })
        return boxes

    def _has_sufficient_content(self, crop, brightness_thresh=20, var_thresh=12):
        """Checks if a crop is likely a shadow or empty space. Slightly more sensitive now."""
        if len(crop.shape) == 3 and crop.shape[2] == 3:
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        else:
            gray = crop
        
        mean_brightness = np.mean(gray)
        # Shadows are usually very dark
        if mean_brightness < brightness_thresh:
            return False
            
        # Shadows/empty spaces have low variance (flat)
        _, std_dev = cv2.meanStdDev(gray)
        if std_dev[0][0] < var_thresh:
            return False
            
        return True

    def extract_folded_crops(self, zone_img, offset_y, zone_label):
        h, w = zone_img.shape[:2]
        gray = cv2.cvtColor(zone_img, cv2.COLOR_BGR2GRAY)
        
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=5)
        sobel_y = np.absolute(sobel_y)
        sobel_y = np.uint8(255 * sobel_y / np.max(sobel_y))
        
        cols = 3
        col_w = w // cols
        boxes = []
        
        for c in range(cols):
            roi = sobel_y[:, c*col_w : (c+1)*col_w]
            row_sums = np.sum(roi, axis=1)
            
            threshold = np.mean(row_sums) + 0.5 * np.std(row_sums)
            fold_lines = np.where(row_sums > threshold)[0]
            
            boundaries = [0]
            for i in range(1, len(fold_lines)):
                if fold_lines[i] - fold_lines[i-1] > 20: 
                    boundaries.append(int(fold_lines[i]))
            boundaries.append(h)
            
            x1 = int(c * col_w)
            x2 = int((c+1) * col_w)
            for i in range(len(boundaries) - 1):
                y1 = boundaries[i]
                y2 = boundaries[i+1]
                if y2 - y1 >= 35:
                    # Pass the original BGR zone crop for accurate content check
                    bgr_crop = zone_img[y1:y2, c*col_w : (c+1)*col_w]
                    if self._has_sufficient_content(bgr_crop):
                        boxes.append({
                            "box": [x1, y1 + offset_y, x2, y2 + offset_y],
                            "zone": zone_label
                        })
        return boxes

class ClothingClassifier:
    def __init__(self, model_name="ViT-B/32", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model, self.preprocess = clip.load(model_name, device=self.device)
        
        self.zone_labels = {
            "A": ["shirt", "t-shirt", "blouse", "jacket", "dress", "striped shirt", "floral shirt", "blazer", "hoodie", "coat"],
            "B": ["folded jeans", "folded trousers", "folded t-shirt", "folded sweater", "folded shorts", "t-shirt", "shirt"],
            "C": ["sneakers", "boots", "shoes", "bag", "accessory", "folded jeans", "folded sweater"]
        }
        
        self.templates = [
            "a photo of a {}",
            "a {} hanging on a hook",
            "a {} in a wardrobe",
            "a folded {}"
        ]
        
        self.precomputed_features = {"A": [], "B": [], "C": []}
        
        with torch.no_grad():
            for zone, labels in self.zone_labels.items():
                for template in self.templates:
                    prompts = [template.format(label) for label in labels]
                    tokens = clip.tokenize(prompts).to(self.device)
                    feats = self.model.encode_text(tokens)
                    feats /= feats.norm(dim=-1, keepdim=True)
                    self.precomputed_features[zone].append(feats)

    def classify(self, image_source, zone="A"):
        """
        Modified to return the high-dimensional AI vector space features.
        Used for mathematically accurate duplicate checks downstream.
        """
        if isinstance(image_source, str):
            image = Image.open(image_source)
        else:
            image = image_source
            
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        
        target_labels = self.zone_labels.get(zone, self.zone_labels["A"])
        target_feats = self.precomputed_features.get(zone, self.precomputed_features["A"])
        
        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            
            # Export raw AI features for Inventory Duplicate Check
            raw_features = image_features[0].cpu().numpy().tolist()
            
            total_probs = np.zeros(len(target_labels))
            for feats in target_feats:
                sim = (100.0 * image_features @ feats.T).softmax(dim=-1)
                total_probs += sim[0].cpu().numpy()
                
            total_probs /= len(self.templates)
        
        best_idx = np.argmax(total_probs)
        conf = float(total_probs[best_idx])
        
        return target_labels[best_idx], conf, raw_features

class ColorDetector:
    def __init__(self):
        pass

    def get_closest_color_name(self, hsv):
        H, S, V = hsv
        # Hue is scaled 0-180 in OpenCV, Saturation 0-255, Value 0-255
        
        # Grayscale detection
        if S < 30:
            if V > 210: return "white"
            if V < 60: return "black"
            return "gray"
            
        # Basic Hue mapping
        if H < 10 or H > 170: return "red"
        if 10 <= H < 25: return "orange_brown"
        if 25 <= H < 35: return "yellow"
        if 35 <= H < 85: return "green"
        if 85 <= H < 100: return "cyan"
        if 100 <= H < 130: 
            if S > 100 and V < 100: return "navy_blue"
            if S < 100: return "light_blue"
            return "blue"
        if 130 <= H < 155: return "purple"
        if 155 <= H < 170: return "pink"
        
        return "unknown"

    def detect_dominant_color(self, image_source, k=3, mask=None):
        if isinstance(image_source, str):
            image = cv2.imread(image_source)
        else:
            image = image_source
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            
            image_hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            if mask is not None:
                # Use mask to extract only the pixels of the garment
                pixels = image_hsv[mask > 0].reshape((-1, 3))
            else:
                image_res = cv2.resize(image_hsv, (50, 50), interpolation=cv2.INTER_AREA)
                pixels = image_res.reshape((-1, 3))
                # Fallback filter for black background if no mask but image is dark
                pixels = pixels[pixels[:, 2] > 20]

            if len(pixels) < 3:
                return {"hsv": [0,0,0], "name": "black" if not ignore_background else "unknown"}
            
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=1, max_iter=20)
            kmeans.fit(pixels)
            
            counts = np.bincount(kmeans.labels_)
            dom_idx = np.argmax(counts)
            dom_hsv = kmeans.cluster_centers_[dom_idx]
            
            return {"hsv": dom_hsv.tolist(), "name": self.get_closest_color_name(dom_hsv)}
