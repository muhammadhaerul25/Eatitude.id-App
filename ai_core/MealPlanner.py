from ai_core.models.BytePlusProcessor import BytePlusProcessor
from ai_core.Prompt import PromptTemplates

class MealPlanner:
    @staticmethod
    def generate_meal_plan_per_day(user_data: dict, user_personal_plan: dict) -> dict:
        prompt = PromptTemplates.get_prompt_for_meal_plan_per_day(user_data, user_personal_plan)
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