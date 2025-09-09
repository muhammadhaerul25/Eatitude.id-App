import json
from ai_core.Prompt import PromptTemplates
from ai_core.models.BytePlusProcessor import BytePlusProcessor

class PersonalPlanner:
    @staticmethod
    def calculate_imt(berat_badan_kg, tinggi_badan_cm):
        tinggi_badan_m = tinggi_badan_cm / 100
        imt_score = berat_badan_kg / (tinggi_badan_m ** 2)
        imt_score = round(imt_score, 2)

        # IMT Status
        if imt_score < 18.5:
            imt_status = "Kurus"
        elif 18.5 <= imt_score < 25:
            imt_status = "Normal"
        elif 25 <= imt_score < 30:
            imt_status = "Gemuk"
        else:
            imt_status = "Obesitas"

        return imt_score, imt_status
    
    @staticmethod
    def generate_personal_healthy_eating_plan(user_data: dict) -> dict:
        prompt = PromptTemplates.get_prompt_for_personal_healthy_eating_plan(user_data)
        processor = BytePlusProcessor()
        response = processor.generate_text(prompt)

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

