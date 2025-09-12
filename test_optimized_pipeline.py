"""
Test the optimized base64 pipeline without redundant conversions
"""

import os
import base64
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_core.FoodScanner import FoodScanner
from ai_core.models.BytePlusProcessor import BytePlusProcessor


def test_optimized_base64_processing():
    print("🧪 Testing OPTIMIZED base64 image processing pipeline...")

    # Test image path
    test_image = "ai_core/images/nasi_ayam.jpg"

    if not os.path.exists(test_image):
        print(f"❌ Test image not found: {test_image}")
        return

    print(f"✅ Using test image: {test_image}")

    # Step 1: Read image and convert to base64 (simulating frontend)
    print("\n1️⃣ Converting image to base64 (frontend simulation)...")
    with open(test_image, "rb") as f:
        img_data = f.read()

    base64_data = base64.b64encode(img_data).decode("utf-8")
    print(f"   📄 Base64 data: {len(base64_data)} characters")

    # Step 2: Process using OPTIMIZED method (no file conversion)
    print("\n2️⃣ Processing with OPTIMIZED method (direct base64)...")
    try:
        # This method processes base64 directly without any file system operations
        result = FoodScanner.generate_food_nutrition_estimation_from_base64(base64_data)
        print("   ✅ OPTIMIZED processing successful!")
        print(f"   📊 Result keys: {list(result.keys())}")

        # Check if we got nutritional data
        if "nutrition" in str(result).lower() or "calories" in str(result).lower():
            print("   🎯 Nutritional analysis detected in response")

    except Exception as e:
        print(f"   ❌ OPTIMIZED processing failed: {e}")

    # Step 3: Compare with old method (for verification)
    print("\n3️⃣ Comparing with OLD method (file-based)...")
    try:
        # This is the old method that uses file path
        result_old = FoodScanner.generate_food_nutrition_estimation(test_image)
        print("   ✅ OLD method also works")
        print(f"   📊 Result keys: {list(result_old.keys())}")
    except Exception as e:
        print(f"   ❌ OLD method failed: {e}")

    print("\n🏁 Test completed!")
    print("📈 Benefits of optimized approach:")
    print("   - No temporary file creation")
    print("   - No base64 → file → base64 conversion")
    print("   - Better Android compatibility")
    print("   - Reduced I/O operations")


if __name__ == "__main__":
    test_optimized_base64_processing()
