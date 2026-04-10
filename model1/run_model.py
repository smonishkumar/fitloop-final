import sys
import os
import json
from collections import Counter

# Add current directory to path
sys.path.append(os.getcwd())

from wardrobe_intelligence.main import WardrobeIntelligence

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_model.py <path_to_image>")
        return

    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return

    print(f"\n" + "="*80)
    print(f" WARDROBE INTELLIGENCE REPORT ".center(80, "="))
    print(f"="*80)
    print(f"Source: {image_path}")
    
    engine = WardrobeIntelligence(device="cpu")
    results = engine.wardrobe_scan(image_path)
    
    if not results:
        print("\n[!] No items detected in the image.")
        return

    # 1) CLOTHING DETECTION (Summary by Type)
    print("\n[ 1. CLOTHING DETECTION SUMMARY ]")
    summary = Counter()
    for item in results:
        if "error" in item: continue
        summary[item['type']] += 1
    
    print(f" - {len(results)} items detected")
    for ctype, count in summary.items():
        print(f"   - {count} {ctype}(s)")

    # 2) CLOTHING ATTRIBUTE DETECTION
    print("\n[ 2. CLOTHING ATTRIBUTE DETECTION ]")
    print(f"{'TYPE':<14} | {'COLOR':<14} | {'CONFIDENCE':<10} | {'LOCATION (BOX)':<20}")
    print("-" * 70)
    for item in results:
        if "error" in item: continue
        box = item.get('box', [])
        box_str = f"({box[0]}, {box[1]}, {box[2]}, {box[3]})" if box else "Full Image"
        print(f"{item['type']:<14} | {item['color']:<14} | {item['confidence']:<10.2f} | {box_str:<20}")

    # 3) WARDROBE INVENTORY BUILDER
    print("\n[ 3. WARDROBE INVENTORY BUILDER ]")
    print(f"{'ITEM ID':<10} | {'CATEGORY':<14} | {'COLOR':<14} | {'IMAGE HASH':<20}")
    print("-" * 70)
    for item in results:
        if "error" in item: continue
        item_id = item.get("item_id", "EXISTING")
        print(f"{item_id:<10} | {item['type']:<14} | {item['color']:<14} | {item['image_hash']:<20}")

    # 4) DUPLICATE DETECTION
    print("\n[ 4. DUPLICATE DETECTION ]")
    duplicates = [item for item in results if item.get('is_duplicate')]
    if duplicates:
        print(f"⚠️  {len(duplicates)} duplicate items were found in this scan.")
        for d in duplicates:
            print(f" - Duplicate {d['type']} ({d['color']}) with existing hash: {d['image_hash']}")
    else:
        print("✅ No duplicate items detected. All items added to inventory.")

    print("\n" + "="*80)
    print(f" SCAN COMPLETE | Total Items: {len(results)} ".center(80, "="))
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
