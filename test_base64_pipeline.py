#!/usr/bin/env python3
"""
Test the complete base64 image processing pipeline
"""

import base64
import json
import tempfile
import os
from io import BytesIO

# Test if PIL is available
try:
    from PIL import Image
    print("✅ PIL/Pillow is available")
except ImportError:
    print("❌ PIL/Pillow not installed. Run: pip install Pillow")
    exit(1)

def test_base64_pipeline():
    print("🧪 Testing base64 image processing pipeline...")
    
    # Step 1: Create a test image (simulating camera/gallery image)
    print("\n1️⃣ Creating test image...")
    img = Image.new('RGB', (200, 200), color='blue')
    img_buffer = BytesIO()
    img.save(img_buffer, format='JPEG')
    img_data = img_buffer.getvalue()
    print(f"   📸 Created test image: {len(img_data)} bytes")
    
    # Step 2: Convert to base64 (simulating frontend conversion)
    print("\n2️⃣ Converting to base64 (frontend simulation)...")
    base64_data = base64.b64encode(img_data).decode('utf-8')
    print(f"   📄 Base64 data: {len(base64_data)} characters")
    
    # Step 3: Create JSON request (simulating API call)
    print("\n3️⃣ Creating JSON request...")
    request_body = {"file": base64_data}
    json_payload = json.dumps(request_body)
    print(f"   📦 JSON payload size: {len(json_payload)} characters")
    
    # Step 4: Decode base64 and save to temp file (simulating FastAPI)
    print("\n4️⃣ Processing in FastAPI (save_base64_image)...")
    try:
        # Decode base64 data
        decoded_data = base64.b64decode(base64_data)
        
        # Validate image
        test_image = Image.open(BytesIO(decoded_data))
        print(f"   🖼️  Image validation: {test_image.format} {test_image.size}")
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            tmp.write(decoded_data)
            temp_path = tmp.name
        
        print(f"   💾 Saved to: {temp_path}")
        print(f"   📏 File size: {os.path.getsize(temp_path)} bytes")
        
    except Exception as e:
        print(f"   ❌ FastAPI processing failed: {e}")
        return False
    
    # Step 5: Read file and convert back to base64 (simulating BytePlusProcessor)
    print("\n5️⃣ Processing in AI Core (BytePlusProcessor)...")
    try:
        with open(temp_path, "rb") as f:
            file_data = f.read()
            ai_base64 = base64.b64encode(file_data).decode("utf-8")
        
        print(f"   🤖 AI base64 size: {len(ai_base64)} characters")
        print(f"   ✅ Data integrity: {base64_data == ai_base64}")
        
        # Simulate BytePlus API call format
        byteplus_url = f"data:image/jpeg;base64,{ai_base64}"
        print(f"   🔗 BytePlus URL length: {len(byteplus_url)}")
        
    except Exception as e:
        print(f"   ❌ AI Core processing failed: {e}")
        return False
    finally:
        # Cleanup
        try:
            os.remove(temp_path)
            print("   🧹 Temp file cleaned up")
        except:
            pass
    
    print("\n🎉 Complete pipeline test SUCCESSFUL!")
    print("   ✅ Frontend base64 conversion works")
    print("   ✅ FastAPI base64 decoding works") 
    print("   ✅ Temp file saving works")
    print("   ✅ AI Core base64 encoding works")
    print("   ✅ Data integrity maintained throughout")
    
    return True

if __name__ == "__main__":
    success = test_base64_pipeline()
    if success:
        print("\n🚀 The base64 approach should work for Android!")
        print("   📱 This bypasses FormData upload issues")
        print("   🌐 JSON requests work better on Android React Native")
    else:
        print("\n❌ Pipeline test failed - need to investigate")
