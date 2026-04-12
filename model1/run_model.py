"""
run_model.py  ─  CLI entry point for Wardrobe Intelligence
──────────────────────────────────────────────────────────
Usage:
    python3 run_model.py <path_to_image>

Output format:
    Hanging Items (N) — garments on hangers/rail
    Shelf Items (M)   — shoes, boots, heels, accessories, pillows
    Duplicate Summary
"""

import sys
import os
import json
from collections import Counter

# Load .env if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Add model1 directory to path
sys.path.append(os.path.join(os.getcwd(), 'model1'))

from wardrobe_intelligence.main import WardrobeIntelligence


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_model.py <path_to_image>")
        print("       Set GEMINI_API_KEY env var for high-accuracy Gemini Vision mode.")
        return

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return

    # ── Check if Gemini key is set ──────────────────────────────────────────
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    full_gemini = "--full-gemini" in sys.argv

    print(f"\n{'='*80}")
    print(f" WARDROBE INTELLIGENCE REPORT ".center(80, "="))
    print(f"{'='*80}")
    print(f" Source : {image_path}")
    print(f" Mode   : {'🔍 Gemini Deep Scan + YOLO (maximum accuracy)' if gemini_key else '🧠 CLIP + YOLO (set GEMINI_API_KEY for better accuracy)'}")
    print(f"{'='*80}")

    engine  = WardrobeIntelligence(
        device="cpu",
        gemini_api_key=gemini_key or None,
        use_full_wardrobe_gemini=full_gemini,
    )
    results = engine.wardrobe_scan(image_path)

    if not results:
        print("\n[!] No items detected in the image.")
        return

    # ── Separate by zone ────────────────────────────────────────────────────
    hanging = [r for r in results if r.get("zone", "hanging") == "hanging"]
    shelf   = [r for r in results if r.get("zone", "hanging") == "shelf"]
    total   = len(results)

    # ── 1. HANGING ITEMS ────────────────────────────────────────────────────
    print(f"\n{'─'*60}")
    print(f" 👔 Hanging Items ({len(hanging)})")
    print(f"{'─'*60}")
    for i, item in enumerate(hanging, 1):
        label = item.get("gemini_label", f"{item['color']} {item['type']}")
        conf  = item.get("confidence", 0)
        mat   = item.get("material", "")
        pat   = item.get("pattern", "")
        extra = []
        if mat and mat != "unknown": extra.append(mat)
        if pat and pat not in ("unknown", "plain"): extra.append(pat)
        detail = f" ({', '.join(extra)})" if extra else ""
        print(f"  {i:>2}. 1x {label}{detail}  [{conf:.0%}]")

    # ── 2. SHELF ITEMS ──────────────────────────────────────────────────────
    if shelf:
        print(f"\n{'─'*60}")
        print(f" 👟 Shelf Items ({len(shelf)})")
        print(f"{'─'*60}")
        for i, item in enumerate(shelf, 1):
            label = item.get("gemini_label", f"{item['color']} {item['type']}")
            conf  = item.get("confidence", 0)
            mat   = item.get("material", "")
            pat   = item.get("pattern", "")
            extra = []
            if mat and mat != "unknown": extra.append(mat)
            if pat and pat not in ("unknown", "plain"): extra.append(pat)
            detail = f" ({', '.join(extra)})" if extra else ""
            print(f"  {i:>2}. 1x {label}{detail}  [{conf:.0%}]")

    # ── 3. DETAILED ATTRIBUTE TABLE ─────────────────────────────────────────
    print(f"\n{'─'*60}")
    print(f" 📊 Detailed Attribute Table")
    print(f"{'─'*60}")
    header = f"{'#':<3} {'ZONE':<8} {'TYPE':<14} {'COLOR':<12} {'PATTERN':<10} {'MATERIAL':<10} {'CONF':<5}"
    print(header)
    print("─" * len(header))
    for i, item in enumerate(results, 1):
        print(
            f"{i:<3} "
            f"{item.get('zone','?'):<8} "
            f"{item['type']:<14} "
            f"{item['color']:<12} "
            f"{item.get('pattern','?'):<10} "
            f"{item.get('material','?'):<10} "
            f"{item['confidence']:<5.0%}"
        )

    # ── 4. DUPLICATE DETECTION ──────────────────────────────────────────────
    print(f"\n{'─'*60}")
    print(f" 🔍 Duplicate Detection")
    print(f"{'─'*60}")
    duplicates = [i for i in results if i.get("is_duplicate")]
    if duplicates:
        print(f"  ⚠️  {len(duplicates)} duplicate item(s) found:")
        for d in duplicates:
            print(f"     • {d.get('gemini_label', d['type'])} ({d['color']})")
    else:
        print("  ✅ No duplicates detected. All items are unique.")

    # ── FOOTER ──────────────────────────────────────────────────────────────
    print(f"\n{'='*80}")
    print(f" SCAN COMPLETE  |  {total} total items  |  {len(hanging)} hanging  |  {len(shelf)} shelf ".center(80, "="))
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
