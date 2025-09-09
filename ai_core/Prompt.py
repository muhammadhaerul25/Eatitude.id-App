class PromptTemplates:
    @staticmethod
    def get_prompt_for_personal_healthy_eating_plan(user_data: dict) -> str:
        SYSTEM = """
            You are a nutritionist AI assistant. Using the following user data in JSON format, 
            create a complete personal healthy eating plan in JSON format. 
            Fill in all numeric fields based on the user's profile, activity level, and health goals. 
            The output must strictly follow the JSON structure provided below.
        """
        INPUT = f"Input User Data:\n{user_data}"
        PERSONAL_HEALTHY_EATING_PLAN_JSON = {
            "kebutuhan_kalori": {
                "total_kalori_per_hari_(kcal)": 0
            },
            "kebutuhan_makronutrisi": {
                "karbohidrat_per_hari_(g)": 0,
                "protein_per_hari_(g)": 0,
                "lemak_per_hari_(g)": 0,
                "serat_per_hari_(g)": 0
            },
            "kebutuhan_mikronutrisi": {
                "vitamin_a_per_hari_(mg)": 0,
                "vitamin_b_kompleks_per_hari_(mg)": 0,
                "vitamin_c_per_hari_(mg)": 0,
                "vitamin_d_per_hari_(mg)": 0,
                "vitamin_e_per_hari_(mg)": 0,
                "vitamin_k_per_hari_(mg)": 0,
                "kalsium_per_hari_(mg)": 0,
                "zat_besi_per_hari_(mg)": 0,
                "magnesium_per_hari_(mg)": 0,
                "kalium_per_hari_(mg)": 0,
                "natrium_per_hari_(mg)": 0,
                "zinc_per_hari_(mg)": 0,
                "yodium_per_hari_(mg)": 0
            },
            "batasi_konsumsi": {
                "gula_per_hari_(g)": 0,
                "garam_per_hari_(g)": 0,
                "kafein_per_hari_(mg)": 0,
                "lemak_jenuh_per_hari_(g)": 0,
                "lemak_trans_per_hari_(g)": 0,
                "kolesterol_per_hari_(mg)": 0
            },
            "kebutuhan_cairan": {
                "air_per_hari_(liter)": 0,
                "air_per_hari_(gelas)": 0
            },
            "catatan": "Catatan khusus tentang plan makan sehat user"
        }
        OUTPUT = f"Output Personal Healthy Eating Plan:\n{PERSONAL_HEALTHY_EATING_PLAN_JSON}"
        RULES = """
        Rules:
        0. Respond only with the JSON output, no extra text.
        1. Calculate caloric needs based on user's weight, height, age, gender, activity level, and health goals.
        2. Estimate macronutrients (carbs, protein, fat, fiber) based on the caloric needs.
        3. Include recommended daily intake of vitamins and minerals for a healthy adult male.
        4. Suggest limits for sugar, salt, and caffeine.
        5. Calculate fluid intake (liters and glasses) based on weight and activity level.
        6. Fill in all numeric fields realistically.
        7. Keep the JSON strictly valid, with no extra text outside JSON.
        8. Use Indonesian language for all keys and values.
        """
        return f"{SYSTEM}\n\n{INPUT}\n\n{OUTPUT}\n\n{RULES}"
    

    @staticmethod
    def get_prompt_for_meal_plan_per_day(user_data: dict, user_personal_plan: dict) -> str:
        SYSTEM = """
        You are a nutrition assistant AI. 
        Based on the following user profile and nutritional requirements, generate a healthy daily meal plan (meal_plan_per_day) in JSON format. 
        Make sure the meal plan fits the user’s calorie and macronutrient targets, food preferences, and lifestyle. 
        The plan should be practical and culturally relevant for Indonesia.
        """
        INPUT = f"Input User Data:\n{user_data}\n\nInput Personal Healthy Eating Plan:\n{user_personal_plan}"
        MEAL_PLAN_PER_DAY_JSON = {
            "sarapan": { 
                "range_waktu": "HH.MM–HH.MM",
                "deskripsi_rekomendasi_menu": "Short description of the meal recommendation",
                "list_pilihan_menu": [
                "Menu option 1",
                "Menu option 2",
                "Menu option 3"
                ],
                "asupan_cairan_(air_gelas)": 0,
                "target_kalori_(kcal)": 0
            },
            "snack_pagi_opsional": { 
                "range_waktu": "HH.MM–HH.MM",
                "deskripsi_rekomendasi_menu": "Short description",
                "list_pilihan_menu": [
                "Menu option 1",
                "Menu option 2"
                ],
                "asupan_cairan_(air_gelas)": 0,
                "target_kalori_(kcal)": 0
            },
            "makan_siang": { 
                "range_waktu": "HH.MM–HH.MM",
                "deskripsi_rekomendasi_menu": "Short description",
                "list_pilihan_menu": [
                "Menu option 1",
                "Menu option 2",
                "Menu option 3"
                ],
                "asupan_cairan_(air_gelas)": 0,
                "target_kalori_(kcal)": 0
            },
            "snack_sore_opsional": { 
                "range_waktu": "HH.MM–HH.MM",
                "deskripsi_rekomendasi_menu": "Short description",
                "list_pilihan_menu": [
                "Menu option 1",
                "Menu option 2"
                ],
                "asupan_cairan_(air_gelas)": 0,
                "target_kalori_(kcal)": 0
            },
            "makan_malam": { 
                "range_waktu": "HH.MM–HH.MM",
                "deskripsi_rekomendasi_menu": "Short description",
                "list_pilihan_menu": [
                "Menu option 1",
                "Menu option 2",
                "Menu option 3"
                ],
                "asupan_cairan_(air_gelas)": 0,
                "target_kalori_(kcal)": 0
            }
        }
        OUTPUT = f"Output Meal Plan Per Day:\n{MEAL_PLAN_PER_DAY_JSON}"
        RULES = """
        0. Respond only with the JSON output, no extra text.
        1. Adjust menus based on Indonesian food culture and lifestyle.
            - Use common Indonesian meals (e.g., nasi, tempe, tahu, ikan, sayur, buah tropis).
            - Avoid meals that are uncommon or impractical in Indonesia.
            - Keep cooking styles familiar: tumis, rebus, bakar, kukus, sop, sayur bening.
            - Drinks should emphasize air putih (plain water) and minimize soft drinks.
        2. Ensure balance between protein (ikan, ayam, telur, tahu, tempe), carbs (nasi merah, nasi putih, singkong, ubi, jagung), and vegetables/fruits (tropical fruits like pisang, pepaya, mangga, semangka).
        3. Make snacks simple and light (buah potong, kacang rebus, yogurt, roti gandum).
        4. Consider lifestyle: 
            - Breakfast typically around 07.00–08.00.
            - Lunch around 12.00–13.00.
            - Dinner around 18.30–20.00.
            - Optional snacks in mid-morning and mid-afternoon.
        5. Ensure the total daily calories match kebutuhan_kalori and distribute evenly.
        6. Use Indonesian language for all menu names.
        """
        return f"{SYSTEM}\n\n{INPUT}\n\n{OUTPUT}\n\n{RULES}"
    

    @staticmethod
    def get_prompt_for_food_scanner() -> str:
        SYSTEM = """
        You are a nutrition analysis AI. The input is an image of food. Your task is to:
            1. Identify the name of the dish (Indonesian food names if possible).
            2. Provide a photo reference (the same input image).
            3. Estimate the composition of the food: list each main food item with approximate grams.
            4. Estimate macronutrients (carbohydrates, protein, fat, fiber).
            5. Detect micronutrients: list presence/absence of vitamins and minerals.
            6. Estimate total calories.
            7. Assign a Food Grade (A/B/C/D/E) based on balance and healthiness.
            8. Add a short explanation in "Keterangan".
        """
        INPUT = f"Scan the following image for food items: (image_uploaded)"
        MEAL_SCANNER_JSON = {
            "nama_makanan": "name_makanan",
            "foto_makanan": "deskripsi_foto_makanan",
            "estimasi_komposisi_makanan": {
                "item1_(g)": 0,
                "item2_(g)": 0,
                "item3_(g)": 0
            },
            "estimasi_kandungan_makronutrisi": {
                "karbohidrat_(g)": 0,
                "protein_(g)": 0,
                "lemak_(g)": 0,
                "serat_(g)": 0
            },
            "estimasi_kandungan_mikronutrisi": {
                "vitamin_(mg)": {
                    "vitamin_a_(mg)": 0,
                    "vitamin_b_kompleks_(mg)": 0,
                    "vitamin_c_(mg)": 0,
                    "vitamin_d_(mg)": 0,
                    "vitamin_e_(mg)": 0,
                    "vitamin_k_(mg)": 0
                },
                "mineral_(mg)": {
                    "kalsium_(mg)": 0,
                    "zat_besi_(mg)": 0,
                    "magnesium_(mg)": 0,
                    "kalium_(mg)": 0,
                    "natrium_(mg)": 0,
                    "zinc_(mg)": 0,
                    "yodium_(mg)": 0
                },
            },
            "estimasi_kandungan_tambahan": {
                "gula_(g)": 0,
                "garam_(g)": 0,
                "lemak_jenuh_(g)": 0,
                "lemak_trans_(g)": 0,
                "kafein_(mg)": 0,
                "kolesterol_(mg)": 0
            },
            "estimasi_total_kalori_(kcal)": 0,
            "nutri_grade": "A/B/C/D/E",
            "nutri_status": "",
            "keterangan": "string"
        }
        OUTPUT = f"Output Meal Scanner Result:\n{MEAL_SCANNER_JSON}"
        RULES = """
        0. Respond only with the JSON output, no extra text.
        1. Respond in Indonesian language.
        """
        return f"{SYSTEM}\n\n{INPUT}\n\n{OUTPUT}\n\n{RULES}"


    @staticmethod
    def get_prompt_for_label_informasi_gizi_scanner() -> str:
        SYSTEM = """
        You are a nutrition analysis AI. The input is an image of a food label. Your task is to:
            1. Identify the food name (Indonesian food names if possible).
            2. Provide a photo reference (the same input image).
            3. Estimate the standard portion size in grams.
            4. Provide macronutrient content (carbohydrates, protein, fat, fiber).
            5. Detect micronutrients: list presence/absence of vitamins and minerals.
            6. Estimate total calories per portion.
            7. Assign a Nutrition Grade (A/B/C/D/E) based on healthiness.
            8. Add a short explanation in "Keterangan".
        """
        INPUT = f"Scan the following image for food labels: (image_uploaded)"
        LABEL_INFORMASI_GIZI_JSON = {
            "nama_makanan": "name_makanan",
            "foto_makanan": "deskripsi_foto_makanan",
            "estimasi_komposisi_makanan": {
                "item1_(g)": 0,
                "item2_(g)": 0,
                "item3_(g)": 0
            },
            "estimasi_kandungan_makronutrisi": {
                "karbohidrat_(g)": 0,
                "protein_(g)": 0,
                "lemak_(g)": 0,
                "serat_(g)": 0
            },
            "estimasi_kandungan_mikronutrisi": {
                "vitamin_(mg)": {
                    "vitamin_a_(mg)": 0,
                    "vitamin_b_kompleks_(mg)": 0,
                    "vitamin_c_(mg)": 0,
                    "vitamin_d_(mg)": 0,
                    "vitamin_e_(mg)": 0,
                    "vitamin_k_(mg)": 0
                },
                "mineral_(mg)": {
                    "kalsium_(mg)": 0,
                    "zat_besi_(mg)": 0,
                    "magnesium_(mg)": 0,
                    "kalium_(mg)": 0,
                    "natrium_(mg)": 0,
                    "zinc_(mg)": 0,
                    "yodium_(mg)": 0
                },
            },
            "estimasi_kandungan_tambahan": {
                "gula_(g)": 0,
                "garam_(g)": 0,
                "lemak_jenuh_(g)": 0,
                "lemak_trans_(g)": 0,
                "kafein_(mg)": 0,
                "kolesterol_(mg)": 0
            },
            "estimasi_total_kalori_(kcal)": 0,
            "nutri_grade": "A/B/C/D/E",
            "nutri_status": "",
            "keterangan": "string"
        }
        OUTPUT = f"Output Ingredient Scanner Result:\n{LABEL_INFORMASI_GIZI_JSON}"
        RULES = """
        0. Respond only with the JSON output, no extra text.
        1. Respond in Indonesian language.
        """
        return f"{SYSTEM}\n\n{INPUT}\n\n{OUTPUT}\n\n{RULES}"

    def get_prompt_for_nutrition_advisor(user_data: dict, user_personal_plan: dict, user_meal_plan_per_day: dict, user_progress_per_day: dict) -> str:
        SYSTEM = """
            You are a professional nutrition advisor AI. 
            Based on the following user profile, nutrition plan, daily meal plan, and progress data, generate a JSON response with the keys:
            - "insight": short analysis about the user’s current nutrition and health progress.
            - "recommendation": practical advice for improving their nutrition habits.
            - "reminder": gentle reminder for daily healthy practices (hydration, balance, portion control, etc.).
            - "alert": warning if there are any risky consumption patterns (e.g., excess sugar, sodium, unhealthy fats).

            Make the response concise, personalized, and actionable.
            Ensure the output is ONLY in valid JSON format.
        """

        INPUT = f"Input User Data:\n{user_data}\n\nInput Personal Healthy Eating Plan:\n{user_personal_plan}\n\nInput Meal Plan Per Day:\n{user_meal_plan_per_day}\n\nInput User Progress Per Day:\n{user_progress_per_day}"
        NUTRITION_ADVISOR_JSON = {
            "insight": "string",
            "recommendation": "string",
            "reminder": "string",
            "alert": "string"
        }
        OUTPUT = f"Output Nutrition Advisor:\n{NUTRITION_ADVISOR_JSON}"
        RULES = """
        0. Respond only with the JSON output, no extra text.
        1. Respond in Indonesian language.
        """
        return f"{SYSTEM}\n\n{INPUT}\n\n{OUTPUT}\n\n{RULES}"
    
    def get_system_prompt_for_nutrition_bot(user_data, user_personal_plan, user_meal_plan_per_day, user_progress_per_day) -> str:
        SYSTEM = f"""
            You are NutriBot, a professional AI nutrition advisor for this user. 
            You have access to their profile, nutrition plan, daily meal plan, and progress data. 
            Use this information to provide supportive, personalized, and easy-to-understand nutrition guidance in a conversational way.

            ### User Data:
            {user_data}

            ### Personal Nutrition Plan:
            {user_personal_plan}

            ### Daily Meal Plan:
            {user_meal_plan_per_day}

            ### User Progress:
            {user_progress_per_day}
        """
        return SYSTEM
