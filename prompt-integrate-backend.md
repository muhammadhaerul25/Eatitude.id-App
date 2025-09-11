Perfect! I’ve crafted a **ready-to-use prompt for each of your six FastAPI endpoints**. You can paste these directly into GPT (or any AI assistant) to generate the TypeScript + React integration with full type safety. Each prompt is tailored to the specific endpoint, method, and expected request/response.

-
<!-- ---

## **2️⃣ Personal Plan — POST /generate\_personal\_plan**

```
You are a senior full-stack developer. Generate a TypeScript API integration for a React app using fetch or axios for the following FastAPI endpoint.

Endpoint details:
- URL: /generate_personal_plan
- HTTP Method: POST
- Request body schema: { user_data: { nama: string; usia: number; jenis_kelamin: string; berat_badan: number; tinggi_badan: number; tingkat_aktivitas: string; catatan_aktivitas?: string | null; waktu_bangun: string; waktu_tidur: string; preferensi_makanan?: string | null; alergi_makanan?: string | null; kondisi_kesehatan?: string | null; tujuan: string } }
- Response schema: { personal_plan: object }

The output should include:
1. TypeScript interfaces for request and response.
2. A reusable function to call the API with proper error handling.
3. An example React component demonstrating usage (e.g., onClick handler).
4. Comments explaining the usage and types.

Constraints:
- Use async/await syntax.
- Include try/catch error handling.
- Maintain clean, readable, and type-safe code.
``` -->

---

## **3️⃣ Meal Plan — POST /generate\_meal\_plan**

```
You are a senior full-stack developer. Generate a TypeScript API integration for a React app using fetch or axios for the following FastAPI endpoint.

Endpoint details:
- URL: /generate_meal_plan
- HTTP Method: POST
- Request body schema: { personal_plan: object; user_data: { nama: string; usia: number; jenis_kelamin: string; berat_badan: number; tinggi_badan: number; tingkat_aktivitas: string; catatan_aktivitas?: string | null; waktu_bangun: string; waktu_tidur: string; preferensi_makanan?: string | null; alergi_makanan?: string | null; kondisi_kesehatan?: string | null; tujuan: string } }
- Response schema: { meal_plan: object }

The output should include:
1. TypeScript interfaces for request and response.
2. A reusable function to call the API with proper error handling.
3. An example React component demonstrating usage.
4. Comments explaining the usage and types.

Constraints:
- Use async/await syntax.
- Include try/catch error handling.
- Maintain clean, readable, and type-safe code.
```

---

<!-- ## **4️⃣ Food Scanner — POST /generate\_food\_nutrition\_estimation**

```
You are a senior full-stack developer. Generate a TypeScript API integration for a React app using fetch or axios for the following FastAPI endpoint.

Endpoint details:
- URL: /generate_food_nutrition_estimation
- HTTP Method: POST
- Request body schema: { file: string }  // Base64 or file path
- Response schema: { nutrition_estimation: object }

The output should include:
1. TypeScript interfaces for request and response.
2. A reusable function to call the API with proper error handling.
3. An example React component demonstrating usage.
4. Comments explaining the usage and types.

Constraints:
- Use async/await syntax.
- Include try/catch error handling.
- Maintain clean, readable, and type-safe code. -->
```

---

<!-- ## **5️⃣ Food Scanner (Label) — POST /generate\_label\_informasi\_gizi\_nutrition\_estimation**

```
You are a senior full-stack developer. Generate a TypeScript API integration for a React app using fetch or axios for the following FastAPI endpoint.

Endpoint details:
- URL: /generate_label_informasi_gizi_nutrition_estimation
- HTTP Method: POST
- Request body schema: { file: string }  // Base64 or file path
- Response schema: { nutrition_estimation: object }

The output should include:
1. TypeScript interfaces for request and response.
2. A reusable function to call the API with proper error handling.
3. An example React component demonstrating usage.
4. Comments explaining the usage and types.

Constraints:
- Use async/await syntax.
- Include try/catch error handling.
- Maintain clean, readable, and type-safe code.
```

---

## **6️⃣ Nutrition Advisor — POST /generate\_nutrition\_advisor**

```
You are a senior full-stack developer. Generate a TypeScript API integration for a React app using fetch or axios for the following FastAPI endpoint.

Endpoint details:
- URL: /generate_nutrition_advisor
- HTTP Method: POST
- Request body schema: { user_data: { nama: string; usia: number; jenis_kelamin: string; berat_badan: number; tinggi_badan: number; tingkat_aktivitas: string; catatan_aktivitas?: string | null; waktu_bangun: string; waktu_tidur: string; preferensi_makanan?: string | null; alergi_makanan?: string | null; kondisi_kesehatan?: string | null; tujuan: string }; personal_plan: object; meal_plan: object; user_progress?: object }
- Response schema: { nutrition_advice: object }

The output should include:
1. TypeScript interfaces for request and response.
2. A reusable function to call the API with proper error handling.
3. An example React component demonstrating usage.
4. Comments explaining the usage and types.

Constraints:
- Use async/await syntax.
- Include try/catch error handling.
- Maintain clean, readable, and type-safe code. -->
```

---

If you want, I can **actually generate the full TypeScript + React code for all six endpoints** in one shot, fully typed and ready to drop into your project. That way you don’t need to run these prompts manually.

Do you want me to do that next?
