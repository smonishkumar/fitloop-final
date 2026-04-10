import sys
from ml_pipeline import process_frame

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_local.py <front_image_path>")
        return

    front_img_path = sys.argv[1]
    
    print(f"Testing with front image: {front_img_path}")
    with open(front_img_path, "rb") as f:
        front_bytes = f.read()

    print("Running process_frame()...")
    result = process_frame(front_bytes, 175)
    print("Measurement Results:")
    for key, value in result.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
