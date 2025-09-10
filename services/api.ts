// API Service for Eatitude Nutrition API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserData {
    nama: string;
    usia: number;
    jenis_kelamin: string;
    berat_badan: number;
    tinggi_badan: number;
    tingkat_aktivitas: string;
    catatan_aktivitas?: string | null;
    waktu_bangun: string;
    waktu_tidur: string;
    preferensi_makanan?: string | null;
    alergi_makanan?: string | null;
    kondisi_kesehatan?: string | null;
    tujuan: string;
}

// Note: The FastAPI endpoint expects UserData directly in the request body
// and returns PersonalPlan directly (not wrapped in response objects)

export interface PersonalPlan {
    kebutuhan_kalori: any;
    kebutuhan_makronutrisi: any;
    kebutuhan_mikronutrisi: any;
    batasi_konsumsi: any;
    kebutuhan_cairan: any;
    catatan: string;
}

export interface MealPlan {
    sarapan: any;
    snack_pagi?: any;
    makan_siang: any;
    snack_sore?: any;
    makan_malam: any;
}

export interface NutritionEstimation {
    makanan_teridentifikasi: string;
    estimasi_berat: string;
    informasi_nutrisi: {
        kalori: number;
        karbohidrat: number;
        protein: number;
        lemak: number;
        serat: number;
        gula: number;
        natrium: number;
    };
    vitamin_mineral: any;
    catatan: string;
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        timeout: number = 60000
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            console.log(`🚀 Making API request to: ${url}`);
            console.log(`📊 Request config:`, config);

            // Log the request body if it exists
            if (config.body) {
                console.log(`📋 Request body:`, config.body);
                try {
                    const parsedBody = JSON.parse(config.body as string);
                    console.log(`📋 Parsed request body:`, JSON.stringify(parsedBody, null, 2));
                } catch (e) {
                    console.log(`📋 Request body (non-JSON):`, config.body);
                }
            }

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            // Race between fetch and timeout
            const response = await Promise.race([
                fetch(url, config),
                timeoutPromise
            ]);

            console.log(`📡 Response status: ${response.status}`);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.error('❌ Failed to parse error response as JSON:', jsonError);
                    errorData = {};
                }

                console.log('🔍 Full error response:', errorData);

                let errorMessage = `HTTP error! status: ${response.status}`;

                // Handle different FastAPI error formats
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        // FastAPI validation errors
                        const validationErrors = errorData.detail.map((err: any) => {
                            const location = Array.isArray(err.loc) ? err.loc.join('.') : 'unknown field';
                            return `${location}: ${err.msg || err.message || 'validation error'}`;
                        });
                        errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
                    } else if (typeof errorData.detail === 'string') {
                        // Simple string error
                        errorMessage = errorData.detail;
                    } else if (typeof errorData.detail === 'object') {
                        // Object error - try to extract meaningful info
                        errorMessage = JSON.stringify(errorData.detail);
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }

                console.error(`❌ API Error: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log(`✅ API Success:`, data);
            return data;
        } catch (error) {
            console.error(`❌ API request failed for ${endpoint}:`, error);

            // Provide more specific error messages
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Please check your internet connection and ensure the API server is running.');
            }

            throw error;
        }
    }

    // Check API health
    async checkHealth(): Promise<{ status: string; message: string }> {
        try {
            console.log('🏥 Checking API health...');
            const response = await this.request<{ status: string; message: string }>('/');
            console.log('✅ API health check successful:', response);
            return response;
        } catch (error) {
            console.error('❌ API health check failed:', error);
            throw error;
        }
    }

    // Test API connectivity with simple endpoint
    async testConnection(): Promise<boolean> {
        try {
            console.log(`🔗 Testing connection to: ${API_BASE_URL}`);
            const response = await fetch(API_BASE_URL);
            console.log(`📡 Connection test response status: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }

    // Generate personal plan with correct request structure for FastAPI
    async generatePersonalPlan(userData: UserData): Promise<PersonalPlan> {
        console.log('📋 Sending user data directly to FastAPI:', userData);
        console.log('⏱️ Using extended timeout for personal plan generation (120 seconds)');

        // FastAPI expects UserData directly in the request body, not wrapped
        // Use longer timeout for personal plan generation as it involves AI processing
        const response = await this.request<PersonalPlan>('/generate_personal_plan', {
            method: 'POST',
            body: JSON.stringify(userData),
        }, 300000); // 300 seconds timeout for AI processing

        return response;
    }

    // Generate meal plan
    async generateMealPlan(
        userData: any,
        personalPlan: any
    ): Promise<MealPlan> {
        return this.request('/generate_meal_plan', {
            method: 'POST',
            body: JSON.stringify({
                user_data: userData,
                personal_plan: personalPlan,
            }),
        });
    }

    // Scan food image for nutrition estimation
    async scanFoodImage(imageFile: File): Promise<NutritionEstimation> {
        const formData = new FormData();
        formData.append('file', imageFile);

        return this.request('/generate_food_nutrition_estimation', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    // Scan nutrition label image
    async scanNutritionLabel(imageFile: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', imageFile);

        return this.request('/generate_label_informasi_gizi_nutrition_estimation', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    // Generate nutrition advice
    async generateNutritionAdvice(
        userData: any,
        personalPlan: any,
        mealPlan: any,
        userProgress: any
    ): Promise<any> {
        return this.request('/generate_nutrition_advisor', {
            method: 'POST',
            body: JSON.stringify({
                user_data: userData,
                personal_plan: personalPlan,
                meal_plan: mealPlan,
                user_progress: userProgress,
            }),
        });
    }
}

export const apiService = new ApiService();
