"""
gemini_classifier.py
────────────────────
High-accuracy Gemini Vision classifier for wardrobe items.

SELF-HEALING MODE (Batching + Rotation + Fallback + Deep Scan):
- Spatial Batching: Analyzes YOLO-detected items in ONE request.
- Deep Scan: Full-image discovery to find items YOLO missed (heels, pillows, etc.).
- Key Rotation: Cycles through multiple API keys on 429.
- Model Fallback: If 2.5 is exhausted, SILENTLY switches to 2.0 or 1.5.
"""

import os
import io
import json
import re
import logging
import time
from typing import Optional, Dict, Any, List
from PIL import Image

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────────────────
# Canonical maps
# ────────────────────────────────────────────────────────────────────────────
CANONICAL_TYPES = {
    "t-shirt": "t-shirt", "tee": "t-shirt", "shirt": "shirt", "blouse": "blouse",
    "hoodie": "hoodie", "sweatshirt": "sweatshirt", "sweater": "sweater",
    "tank top": "tank_top", "vest": "tank_top", "polo": "polo_shirt",
    "jacket": "jacket", "coat": "coat", "blazer": "blazer", "cardigan": "cardigan",
    "jeans": "jeans", "trousers": "trousers", "pants": "trousers", "shorts": "shorts",
    "skirt": "skirt", "leggings": "leggings", "dress": "dress", "jumpsuit": "jumpsuit",
    "suit": "suit", "sneakers": "sneakers", "boots": "boots", "shoes": "shoes",
    "sandals": "sandals", "heels": "heels", "bag": "bag", "cap": "cap",
    "belt": "belt", "scarf": "scarf", "tie": "tie", "watch": "watch",
    "pillow": "pillow", "cushion": "pillow",
}

CANONICAL_COLORS = {
    "red": "red", "orange": "orange", "yellow": "yellow", "green": "green",
    "blue": "blue", "navy": "navy_blue", "navy blue": "navy_blue",
    "light blue": "light_blue", "purple": "purple", "pink": "pink",
    "white": "white", "black": "black", "gray": "gray", "grey": "gray",
    "brown": "brown", "beige": "beige", "tan": "tan", "khaki": "khaki",
    "cream": "cream", "lavender": "lavender", "lilac": "lavender",
    "multicolor": "multicolor", "denim": "denim_blue",
}

def _normalise_type(raw: str) -> str:
    key = str(raw or "").lower().strip()
    for k, v in CANONICAL_TYPES.items():
        if k in key: return v
    return key

def _normalise_color(raw: str) -> str:
    key = str(raw or "").lower().strip()
    for k, v in CANONICAL_COLORS.items():
        if k in key: return v
    return key

def _pil_to_bytes(image: Image.Image, quality: int = 85) -> bytes:
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=quality)
    return buf.getvalue()

def _extract_json_list(text: str) -> List[Dict[str, Any]]:
    if not text: return []
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    try:
        data = json.loads(text)
        if isinstance(data, list): return data
        if isinstance(data, dict):
            if "items" in data: return data["items"]
            return [data]
    except:
        match = re.search(r'(\[.*\])', text, re.DOTALL)
        if match:
            try: return json.loads(match.group(1))
            except: pass
    return []

# ────────────────────────────────────────────────────────────────────────────
# Prompts
# ────────────────────────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION_BATCH = """You are a fashion expert. I will provide an image and a list of object locations. 
For each location, identify the clothing item. 
Return ONLY a JSON list of objects.

Each object MUST include:
{
  "box_id": int,
  "type": "string",
  "color": "string",
  "pattern": "plain|striped|checked|plaid|floral|graphic|camo|abstract|textured",
  "material": "string",
  "style": "casual|formal|sporty|streetwear|workwear|unknown",
  "confidence": float,
  "gemini_label": "descriptive name"
}"""

SYSTEM_INSTRUCTION_DEEP_SCAN = """You are a world-class fashion inventory expert with perfect attention to detail.
Analyze the ENTIRE wardrobe image and list EVERY single item you can see.

Look carefully for:
- All hanging garments (shirts, sweaters, jackets, dresses, etc.)
- All shelf items (shoes, heels, boots, bags, accessories)
- All non-clothing items on shelves (pillows, cushions, decorative items)
- Items partially hidden behind other items

For EACH item, classify its zone:
- "hanging" = items on hangers/hooks/rail
- "shelf" = items on a shelf, floor, or bottom area

Return ONLY a JSON list. Each object MUST include:
{
  "item_number": int (sequential, starting from 1),
  "zone": "hanging" or "shelf",
  "type": "string (e.g. cardigan, shirt, heels, boots, pillow)",
  "color": "string",
  "pattern": "plain|striped|checked|plaid|floral|graphic|camo|abstract|textured|speckled",
  "material": "string",
  "style": "casual|formal|sporty|streetwear|workwear|decorative|unknown",
  "confidence": float between 0 and 1,
  "gemini_label": "detailed descriptive name (e.g. 'speckled dark cardigan', 'white pointed-toe heels')"
}

Be thorough. Do NOT miss small items like shoes on shelves or decorative pillows. Count carefully."""

MODEL_FALLBACK_LIST = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

class GeminiClothingClassifier:
    def __init__(self, api_keys: str = None, model_name: str = None):
        self._keys = []
        self._current_key_idx = 0
        self._models = MODEL_FALLBACK_LIST.copy()
        if model_name:
            if model_name in self._models:
                self._models.remove(model_name)
            self._models.insert(0, model_name)
            
        self._current_model_idx = 0
        self._client = None
        self._available = False

        raw_keys = api_keys or os.environ.get("GEMINI_API_KEY", "")
        if raw_keys:
            self._keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
            if self._keys:
                self._init_current_client()

    def _init_current_client(self):
        if not self._keys: return
        try:
            from google import genai
            key = self._keys[self._current_key_idx]
            self._client = genai.Client(api_key=key)
            self._available = True
            logger.info(f"✅ Gemini self-healing engine ready (Key {self._current_key_idx + 1}, Model: {self.model_name})")
        except Exception as e:
            logger.error(f"Gemini init error: {e}")

    @property
    def model_name(self) -> str:
        return self._models[self._current_model_idx]

    def _rotate_key(self) -> bool:
        if len(self._keys) <= 1: return False
        self._current_key_idx = (self._current_key_idx + 1) % len(self._keys)
        self._init_current_client()
        return True

    def _fallback_model(self) -> bool:
        if self._current_model_idx + 1 < len(self._models):
            self._current_model_idx += 1
            logger.warning(f"🔄 RELOADING with fallback model: {self.model_name}...")
            return True
        return False

    def _reset_model_index(self):
        """Reset model index so next call starts from the primary model again."""
        self._current_model_idx = 0

    @property
    def is_available(self) -> bool: 
        return self._available and self._client is not None

    def _call_gemini(self, img_bytes: bytes, prompt: str, system_instruction: str) -> str:
        """Core Gemini caller with self-healing retry (key rotation + model fallback)."""
        max_attempts = (len(self._keys) * len(self._models)) + 2
        for attempt in range(max_attempts):
            try:
                from google.genai import types
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.1,
                    max_output_tokens=4096,
                    response_mime_type="application/json"
                )
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=[types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"), prompt],
                    config=config
                )
                # Robust text extraction (handles Chain of Thought models)
                full_text = ""
                if hasattr(response, 'candidates') and response.candidates:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'text') and part.text:
                            full_text += part.text
                elif hasattr(response, 'text'):
                    full_text = response.text
                if full_text:
                    return full_text
                logger.warning("Empty Gemini response. Retrying...")
            except Exception as e:
                err_str = str(e).lower()
                if any(x in err_str for x in ["429", "quota", "limit", "404", "not_found"]):
                    logger.warning(f"Issue with {self.model_name}: {e}")
                    if "429" in err_str and self._rotate_key(): continue
                    if self._fallback_model():
                        self._current_key_idx = 0
                        self._init_current_client()
                        continue
                    return ""
                else:
                    logger.warning(f"Gemini error: {e}")
                    time.sleep(2)
        return ""

    def classify_batch(self, pil_image: Image.Image, boxes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self.is_available or not boxes: return []
        
        w, h = pil_image.size
        gemini_boxes_str = []
        for b in boxes:
            x1, y1, x2, y2 = b['box']
            ymin, xmin, ymax, xmax = int(y1/h*1000), int(x1/w*1000), int(y2/h*1000), int(x2/w*1000)
            gemini_boxes_str.append({"box_id": b['id'], "coordinates": [ymin, xmin, ymax, xmax]})

        prompt = f"Identify the clothing at these normalized coordinates: {json.dumps(gemini_boxes_str)}"
        img_bytes = _pil_to_bytes(pil_image, quality=92)

        raw = self._call_gemini(img_bytes, prompt, SYSTEM_INSTRUCTION_BATCH)
        if not raw: return []

        batch_data = _extract_json_list(raw)
        results = []
        for item in batch_data:
            results.append({
                "box_id": item.get("box_id"),
                "type": _normalise_type(item.get("type", "clothing")),
                "color": _normalise_color(item.get("color", "unknown")),
                "pattern": item.get("pattern", "unknown"),
                "material": item.get("material", "unknown"),
                "style": item.get("style", "unknown"),
                "confidence": float(item.get("confidence", 0.8)),
                "gemini_label": item.get("gemini_label", ""),
            })
        return results

    def deep_scan_full_image(self, pil_image: Image.Image) -> List[Dict[str, Any]]:
        """
        Full-image Deep Scan: Sends the entire wardrobe photo to Gemini
        to discover ALL items (including shelf items YOLO may have missed).
        """
        if not self.is_available: return []

        img_bytes = _pil_to_bytes(pil_image, quality=95)
        prompt = (
            "Scan this wardrobe image thoroughly. "
            "List every single item you can see, including hanging clothes, "
            "shoes on shelves, boots, heels, accessories, pillows, and any partially hidden items. "
            "Be extremely thorough — do not miss anything."
        )

        raw = self._call_gemini(img_bytes, prompt, SYSTEM_INSTRUCTION_DEEP_SCAN)
        if not raw: return []

        items = _extract_json_list(raw)
        results = []
        for item in items:
            results.append({
                "item_number": item.get("item_number", 0),
                "zone": item.get("zone", "hanging"),
                "type": _normalise_type(item.get("type", "clothing")),
                "color": _normalise_color(item.get("color", "unknown")),
                "pattern": item.get("pattern", "unknown"),
                "material": item.get("material", "unknown"),
                "style": item.get("style", "unknown"),
                "confidence": float(item.get("confidence", 0.8)),
                "gemini_label": item.get("gemini_label", ""),
            })
        return results

    def classify_crop(self, pil_image: Image.Image, retries: int = 1) -> Optional[Dict[str, Any]]:
        return None
