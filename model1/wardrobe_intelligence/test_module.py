import sys
import os
import json

# Add the parent directory to sys.path to import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from lib.wardrobe_intelligence import WardrobeIntelligence

def run_test():
    # Use the generated image path
    image_path = "/Users/kunalkakkar/.gemini/antigravity/brain/f207902f-7842-41f6-80de-ca9ff9c5b9db/test_tshirt_black_1775811207108.png"
    
    if not os.path.exists(image_path):
        print(f"Error: Test image not found at {image_path}")
        return

    # Initialize engine
    # Setting device to 'cpu' for stability in this environment
    engine = WardrobeIntelligence(device="cpu")
    
    print("\n--- Test 1: First Scan (New Item) ---")
    result1 = engine.wardrobe_scan(image_path)
    print(json.dumps(result1, indent=2))
    
    print("\n--- Test 2: Second Scan (Duplicate Check) ---")
    result2 = engine.wardrobe_scan(image_path)
    print(json.dumps(result2, indent=2))
    
    print("\n--- Final Inventory ---")
    print(json.dumps(engine.get_inventory(), indent=2))

if __name__ == "__main__":
    run_test()
