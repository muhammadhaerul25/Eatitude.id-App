from ai_core.Prompt import PromptTemplates
from ai_core.models.BytePlusProcessor import BytePlusProcessor

class LabelInformasiGiziScanner:
    @staticmethod
    def generate_label_informasi_gizi_nutrition_estimation(image_path: str) -> dict:
        prompt = PromptTemplates.get_prompt_for_label_informasi_gizi_scanner()
        processor = BytePlusProcessor()
        response = processor.generate_text_with_image_understanding(prompt, image_path)

        try:
            import re, json
            # Extract JSON inside ```json ... ```
            match = re.search(r"```json\s*(\{.*?\})\s*```", response, re.DOTALL)
            if match:
                cleaned_response = match.group(1)
                response_json = json.loads(cleaned_response)
            else:
                # fallback: try parsing whole response
                response_json = json.loads(response)
        except json.JSONDecodeError:
            response_json = {"raw_response": response}

        return response_json