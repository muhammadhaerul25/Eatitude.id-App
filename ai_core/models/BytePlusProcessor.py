import os
import base64
from dotenv import load_dotenv
from byteplussdkarkruntime import Ark


class BytePlusProcessor:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        self.api_key = os.getenv("ARK_API_KEY")
        if not self.api_key:
            raise ValueError("ARK_API_KEY not found in environment variables")

        # Initialize Ark client
        self.client = Ark(api_key=self.api_key)

        # Default models
        self.default_model = "ep-20250830093230-swczp"  # Default model
        self.text_model = "deepseek-r1-250528"  # Best for text generation
        self.image_model = "seed-1-6-250615"  # Vision-capable model

    def generate_text(self, prompt):
        """
        Generate text using the BytePlus Ark API (text only)
        """
        response = self.client.chat.completions.create(
            model=self.text_model,
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        )
        return response.choices[0].message.content

    def generate_text_with_image_understanding(self, prompt, image_path):
        """
        Generate text using a local image + prompt (multimodal)
        """
        # Encode local image to base64
        with open(image_path, "rb") as f:
            image_base64 = base64.b64encode(f.read()).decode("utf-8")

        return self._generate_text_with_base64_image(prompt, image_base64)

    def generate_text_with_base64_image(self, prompt, base64_image):
        """
        Generate text using base64 image data + prompt (multimodal)
        Optimized for Android builds - avoids file system operations
        """
        return self._generate_text_with_base64_image(prompt, base64_image)

    def _generate_text_with_base64_image(self, prompt, image_base64):
        """
        Internal method to generate text with base64 image
        """
        # Create request using Ark SDK
        response = self.client.chat.completions.create(
            model=self.image_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "high",
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )
        return response.choices[0].message.content
