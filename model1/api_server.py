"""
api_server.py  ─  Flask API Bridge for Wardrobe Intelligence
─────────────────────────────────────────────────────────────
Connects the FitLoop React Dashboard to the Python AI model.

Usage:
    ./venv/bin/python3 model1/api_server.py

Endpoints:
    POST /api/scan     — Upload an image, get AI scan results
    GET  /api/health   — Health check
"""

import sys
import os
import json
import tempfile
import logging

# Add model1 directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS

# Load .env
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
except ImportError:
    pass

from wardrobe_intelligence.main import WardrobeIntelligence

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the AI engine once at startup
logger.info("🚀 Starting Wardrobe Intelligence API Server...")
gemini_key = os.environ.get("GEMINI_API_KEY", "")
engine = WardrobeIntelligence(
    device="cpu",
    gemini_api_key=gemini_key or None,
)
logger.info("✅ AI Engine ready. Listening for scan requests.")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "engine": "Wardrobe Intelligence Deep Scan",
        "gemini_available": engine.gemini.is_available,
        "model": engine.gemini.model_name if engine.gemini.is_available else None,
    })


@app.route("/api/scan", methods=["POST"])
def scan():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send as 'image' field."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save to temp file
    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        logger.info(f"📸 Received scan request: {file.filename}")
        results = engine.wardrobe_scan(tmp_path)

        # Separate by zone
        hanging = []
        shelf = []
        for item in results:
            clean_item = {
                "type": item.get("type", "unknown"),
                "color": item.get("color", "unknown"),
                "pattern": item.get("pattern", "unknown"),
                "material": item.get("material", "unknown"),
                "style": item.get("style", "unknown"),
                "confidence": item.get("confidence", 0),
                "gemini_label": item.get("gemini_label", ""),
                "zone": item.get("zone", "hanging"),
                "is_duplicate": item.get("is_duplicate", False),
            }
            if clean_item["zone"] == "shelf":
                shelf.append(clean_item)
            else:
                hanging.append(clean_item)

        response = {
            "success": True,
            "total_items": len(results),
            "hanging_count": len(hanging),
            "shelf_count": len(shelf),
            "hanging": hanging,
            "shelf": shelf,
            "all_items": hanging + shelf,
            "duplicates": [i for i in (hanging + shelf) if i.get("is_duplicate")],
        }

        logger.info(f"✅ Scan complete: {len(results)} items ({len(hanging)} hanging, {len(shelf)} shelf)")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Scan error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  🧠 Wardrobe Intelligence API Server")
    print("  📡 http://localhost:5001")
    print("  📋 POST /api/scan   — Upload image for AI scan")
    print("  💚 GET  /api/health — Health check")
    print("=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
