import hashlib
from PIL import Image
import numpy as np
import uuid

def generate_image_hash(image_path):
    """
    (Legacy) Generate a Difference Hash (dHash) for the image from a file path.
    """
    image = Image.open(image_path)
    return generate_image_hash_from_pil(image)

def generate_image_hash_from_pil(image):
    """
    Generate a Difference Hash (dHash) for the image from a PIL object.
    Used purely as a readable visual ID for users now, NOT for actual duplicate matching.
    """
    img = image.convert('L').resize((9, 8), Image.Resampling.LANCZOS)
    pixels = np.array(img)
    diff = pixels[:, 1:] > pixels[:, :-1]
    
    decimal_value = 0
    for idx, value in enumerate(diff.flatten()):
        if value:
            decimal_value += 2**idx
    return hex(decimal_value)

class InventoryManager:
    def __init__(self, similarity_threshold=0.92):
        self.inventory = []
        # How mathematically "close" two crops have to be in the CLIP AI space to be a duplicate
        self.similarity_threshold = similarity_threshold
        
    def is_duplicate(self, image_features):
        """
        Uses mathematical Cosine Similarity against deep AI feature embeddings
        to intelligently figure out if it's the exact same clothing item,
        even if cropped or folded slightly differently.
        """
        if not image_features:
            return False
            
        feat_arr = np.array(image_features)
        
        for item in self.inventory:
            inv_feat = np.array(item.get("image_features", []))
            if len(inv_feat) > 0:
                # Cosine similarity (Vectors are already normalized during CLIP encode)
                sim = np.dot(feat_arr, inv_feat)
                if sim >= self.similarity_threshold:
                    return True
        return False

    def add_to_inventory(self, item_data):
        item_id = str(uuid.uuid4())[:8]
        new_item = {
            "id": item_id,
            "type": item_data["type"],
            "color": item_data["color"],
            "confidence": round(item_data["confidence"], 2),
            "image_features": item_data.get("image_features", []),  # Hidden deeply for internal math matching
            "image_hash": item_data.get("image_hash", "0x000")       # UI display hash
        }
        self.inventory.append(new_item)
        return new_item

    def get_inventory(self):
        # We strip out the heavy raw math features when returning standard JSON so we don't crash standard UI's
        out = []
        for i in self.inventory:
            c = i.copy()
            c.pop("image_features", None)
            out.append(c)
        return out
