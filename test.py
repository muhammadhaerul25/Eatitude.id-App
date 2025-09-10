import json
from ai_core.Prompt import PromptTemplates
from ai_core.PersonalPlanner import PersonalPlanner
from ai_core.MealPlanner import MealPlanner
from ai_core.FoodScanner import FoodScanner
from ai_core.LabelInformasiGiziScanner import LabelInformasiGiziScanner
from ai_core.NutritionAdvisor import NutritionAdvisor
from ai_core.models.BytePlusProcessor import BytePlusProcessor

user_data = {
    "nama": "Muhammad Haerul",
    "usia": 22,
    "jenis_kelamin": "Laki-laki",

    "berat_badan": 62,
    "tinggi_badan": 167,
    "imt": PersonalPlanner.calculate_imt(62, 167),

    "tingkat_aktivitas": "Ringan",
    "catatan_aktivitas": "Olahraga ringan 3x seminggu",
    "waktu_bangun": "07.00",
    "waktu_tidur": "22.00",

    "preferensi_makanan": "Makanan sehat",
    "alergi_makanan": "Tidak ada alergi",
    "kondisi_kesehatan": "Sehat",

    "tujuan": "Meningkatkan kesehatan",
}

user_data_1 = {
    "nama": "Muhammad Haerul",
    "usia": 10,
    "jenis_kelamin": "Laki-laki",

    "berat_badan": 62,
    "tinggi_badan": 167,
    "imt": PersonalPlanner.calculate_imt(62, 167),

    "tingkat_aktivitas": "Ringan",
    "catatan_aktivitas": "Olahraga ringan 3x seminggu",
    "waktu_bangun": "07.00",
    "waktu_tidur": "22.00",

    "preferensi_makanan": "Makanan sehat",
    "alergi_makanan": "Tidak ada alergi",
    "kondisi_kesehatan": "Sehat",

    "tujuan": "Meningkatkan kesehatan",
}


user_personal_plan = {
    "kebutuhan_kalori": {
        "total_kalori_per_hari_(kcal)": 2150
    },
    "kebutuhan_makronutrisi": {
        "karbohidrat_per_hari_(g)": 295,
        "protein_per_hari_(g)": 107,
        "lemak_per_hari_(g)": 60,
        "serat_per_hari_(g)": 30
    },
    "kebutuhan_mikronutrisi": {
        "vitamin_a_per_hari_(mg)": 0.9,
        "vitamin_b_kompleks_per_hari_(mg)": 2.5,
        "vitamin_c_per_hari_(mg)": 90,
        "vitamin_d_per_hari_(mg)": 0.015,
        "vitamin_e_per_hari_(mg)": 15,
        "vitamin_k_per_hari_(mg)": 0.12,
        "kalsium_per_hari_(mg)": 1000,
        "zat_besi_per_hari_(mg)": 8,
        "magnesium_per_hari_(mg)": 400,
        "kalium_per_hari_(mg)": 3400,
        "natrium_per_hari_(mg)": 1500,
        "zinc_per_hari_(mg)": 11,
        "yodium_per_hari_(mg)": 0.15
    },
    "batasi_konsumsi": {
        "gula_per_hari_(sdm)": 4,
        "garam_per_hari_(sdt)": 1,
        "kafein_per_hari_(cangkir)": 4
    },
    "kebutuhan_cairan": {
        "air_per_hari_(liter)": 2.2,
        "air_per_hari_(gelas)": 9
    },
    "catatan": "Plan makan disusun untuk meningkatkan kesehatan dengan total kalori 2150 kkal. Fokus pada makanan sehat seperti sayuran, buah, biji-bijian utuh, protein tanpa lemak, dan lemak sehat. Batasi gula tambahan dan garam sesuai anjuran. Pastikan hidrasi cukup dengan minum minimal 2.2 liter air per hari."
}

user_meal_plan_per_day = {
    "sarapan": {
        "range_waktu": "07.00–08.00",
        "deskripsi_rekomendasi_menu": "Sarapan bergizi seimbang untuk memulai hari",
        "list_pilihan_menu": [
            "Nasi merah 100g + Telur dadar 2 butir + Tumis buncis wortel + Pisang 1 buah",
            "Oatmeal susu rendah lemak dengan potongan pepaya dan taburan biji chia",
            "Roti gandum panggang 2 lembar dengan selai kacang dan irisan pisang"
        ],
        "asupan_cairan_(air_gelas)": 1,
        "target_kalori_(kcal)": 430
    },
    "snack_pagi_opsional": {
        "range_waktu": "10.00–10.30",
        "deskripsi_rekomendasi_menu": "Camilan ringan kaya serat",
        "list_pilihan_menu": [
            "Yogurt plain dengan potongan melon",
            "Jagung rebus ukuran sedang",
            "Kacang rebus campur (kacang merah, edamame)"
        ],
        "asupan_cairan_(air_gelas)": 1,
        "target_kalori_(kcal)": 150
    },
    "makan_siang": {
        "range_waktu": "12.00–13.00",
        "deskripsi_rekomendasi_menu": "Makanan utama dengan protein lengkap dan sayuran",
        "list_pilihan_menu": [
            "Nasi merah 100g + Ikan bakar bumbu kunyit + Cah kangkung + Lalapan timun",
            "Nasi liwet dengan tempe bacem, pepes tahu, dan sayur asem",
            "Sop ayam kampung dengan kentang, wortel, jagung + Nasi putih 100g"
        ],
        "asupan_cairan_(air_gelas)": 2,
        "target_kalori_(kcal)": 650
    },
    "snack_sore_opsional": {
        "range_waktu": "16.00–16.30",
        "deskripsi_rekomendasi_menu": "Snack sore rendah gula",
        "list_pilihan_menu": [
            "Buah pepaya potong 200g",
            "Puding buah tanpa gula",
            "Kacang almond panggang 25g"
        ],
        "asupan_cairan_(air_gelas)": 1,
        "target_kalori_(kcal)": 150
    },
    "makan_malam": {
        "range_waktu": "18.30–19.30",
        "deskripsi_rekomendasi_menu": "Makanan ringan dengan karbohidrat kompleks",
        "list_pilihan_menu": [
            "Nasi merah 100g + Ayam panggang bumbu rujak + Capcay sayuran",
            "Pepes ikan mas dengan nasi jagung + Tumis tauge",
            "Tahu/tempe goreng tepung sehat + Ubi rebus + Salad sayur dressing jeruk"
        ],
        "asupan_cairan_(air_gelas)": 1,
        "target_kalori_(kcal)": 600
    }
}

user_progress_per_day = {
  "target_kalori": "1520 kcal / 2000 kcal",
  "target_makronutrisi": {
    "karbohidrat": "220 g / 275 g",
    "protein": "95 g / 120 g",
    "lemak": "60 g / 70 g",
    "serat": "24 g / 30 g"
  },
  "status_mikronutrisi": {
    "vitamin": {
      "vitamin_a": "Cukup",
      "vitamin_b": "Kurang",
      "vitamin_c": "Berlebih",
      "vitamin_d": "Kurang",
      "vitamin_e": "Cukup",
      "vitamin_k": "Cukup"
    },
    "mineral": {
      "kalsium": "Cukup",
      "zat_besi": "Kurang",
      "magnesium": "Cukup",
      "kalium": "Kurang",
      "natrium": "Berlebih",
      "zinc": "Cukup",
      "yodium": "Cukup"
    }
  },
  "batas_konsumsi": {
    "gula": "Waspada",
    "garam": "Berlebih",
    "lemak_jenuh": "Bahaya",
    "lemak_trans": "Aman",
    "kafein": "Aman",
    "kolestrol": "Cukup"
  },
  "asupan_cairan": {
    "air": "7 gelas / 10 gelas"
  }
}



# test prompt
# prompt = PromptTemplates.get_prompt_for_nutrition_advisor(user_data, user_personal_plan, user_meal_plan_per_day, user_progress_per_day)
# print(prompt)

# create personal plan
personal_plan = PersonalPlanner.generate_personal_healthy_eating_plan(user_data)
print(json.dumps(personal_plan, indent=4, ensure_ascii=False))
print(type(personal_plan))

# test image understanding
# byteplus_processor = BytePlusProcessor()
# result = byteplus_processor.generate_text_with_image_understanding("What is in this image?", r"D:\Eatitude.id\Eatitude.id\ai-core\images\nasi_ayam.jpg")
# print(result)

# create meal plan per day
# byteplus_processor = BytePlusProcessor()
# meal_plan_per_day = MealPlanner.generate_meal_plan_per_day(user_data, user_personal_plan)
# print(json.dumps(meal_plan_per_day, indent=4, ensure_ascii=False))
# print(type(meal_plan_per_day))

# scan meal
# byteplus_processor = BytePlusProcessor()
# meal_info = FoodScanner.generate_food_nutrition_estimation(r"D:\Eatitude.id\Eatitude.id\ai-core\images\susu.jpg")
# print(json.dumps(meal_info, indent=4, ensure_ascii=False))
# print(type(meal_info))

# scan ingredient
# byteplus_processor = BytePlusProcessor()
# ingredient_info = LabelInformasiGiziScanner.generate_label_informasi_gizi_nutrition_estimation(r"D:\Eatitude.id\Eatitude.id\ai-core\images\label_gizi1.jpg")
# print(json.dumps(ingredient_info, indent=4, ensure_ascii=False))
# print(type(ingredient_info))

# create nutrition advisor
# nutrition_advisor = NutritionAdvisor.generate_nutrition_advisor(user_data, user_personal_plan, user_meal_plan_per_day, user_progress_per_day, r"D:\Eatitude.id\Eatitude.id\ai-core\images\nasi_ayam.jpg")
# print(json.dumps(nutrition_advisor, indent=4, ensure_ascii=False))
# print(type(nutrition_advisor))

# get system prompt for nutribot
# prompt = PromptTemplates.get_system_prompt_for_nutrition_bot(user_data, user_personal_plan, user_meal_plan_per_day, user_progress_per_day)
# print(prompt)