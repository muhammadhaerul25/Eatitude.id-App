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
    // Legacy/alternate property names for backwards compatibility
    hidrasi?: {
        liter?: number;
        gelas?: number;
    };
    kalori?: number;
    // Status and metadata properties for UI components
    status?: 'waiting' | 'approved' | 'adjusted' | string;
    dibuatOleh?: string;
    divalidasiOleh?: string;
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

export interface NutritionLabelResponse {
    nama_produk: string;
    berat_per_sajian: number;
    informasi_gizi: {
        energi_total: number;
        lemak_total: number;
        lemak_jenuh: number;
        protein: number;
        karbohidrat_total: number;
        gula: number;
        serat_pangan: number;
        natrium: number;
    };
    catatan?: string;
}

// Nutrition Advisor Interfaces
export interface UserProgress {
    target_kalori: string;
    target_makronutrisi: {
        karbohidrat: string;
        protein: string;
        lemak: string;
        serat: string;
    };
    status_mikronutrisi: {
        vitamin: {
            vitamin_a: string;
            vitamin_b: string;
            vitamin_c: string;
            vitamin_d: string;
            vitamin_e: string;
            vitamin_k: string;
        };
        mineral: {
            kalsium: string;
            zat_besi: string;
            magnesium: string;
            kalium: string;
            natrium: string;
            zinc: string;
            yodium: string;
        };
    };
    batas_konsumsi: {
        gula: string;
        garam: string;
        lemak_jenuh: string;
        lemak_trans: string;
        kafein: string;
        kolestrol: string;
    };
    asupan_cairan: {
        air: string;
    };
}

export interface NutritionAdvisorRequest {
    user_data: UserData;
    personal_plan: PersonalPlan;
    meal_plan: MealPlan;
    user_progress: UserProgress | Record<string, any>;
}

export interface NutritionAdvice {
    nutrition_advice: {
        greeting?: string;
        analysis?: {
            calorie_status?: string;
            macronutrient_balance?: string;
            micronutrient_status?: string;
            hydration_status?: string;
            consumption_warnings?: string[];
        };
        recommendations?: {
            immediate_actions?: string[];
            meal_suggestions?: string[];
            lifestyle_tips?: string[];
            supplement_advice?: string[];
        };
        encouragement?: string;
        next_steps?: string[];
        disclaimer?: string;
    };
}

export interface NutritionAdvisorResponse {
    insight: string;
    recommendation: string;
    reminder: string;
    alert: string;
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        timeout: number = 300000
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
                    console.log(`📋 JSON parse error:`, e);
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
        console.log('⏱️ Using extended timeout for personal plan generation (300 seconds)');

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
        console.log('🍽️ Generating meal plan with extended timeout (300 seconds)');
        return this.request('/generate_meal_plan', {
            method: 'POST',
            body: JSON.stringify({
                user_data: userData,
                personal_plan: personalPlan,
            }),
        }, 300000); // 300 seconds timeout for AI processing
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
    async scanNutritionLabel(imageFile: File): Promise<NutritionLabelResponse> {
        const formData = new FormData();
        formData.append('file', imageFile);

        return this.request('/generate_label_informasi_gizi_nutrition_estimation', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    // Helper method to convert React Native image URI to File for API calls
    async uriToFile(uri: string, fileName: string = 'image.jpg'): Promise<File> {
        try {
            console.log(`📷 Converting image URI to File: ${uri}`);

            // Fetch the image data from the URI
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a File object from the blob
            const file = new File([blob], fileName, {
                type: blob.type || 'image/jpeg'
            });

            console.log(`✅ Image converted - Size: ${file.size} bytes, Type: ${file.type}`);
            return file;

        } catch (error) {
            console.error('❌ Failed to convert URI to File:', error);
            throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Convenience method for scanning food from React Native image URI
    async scanFoodFromUri(imageUri: string): Promise<NutritionEstimation> {
        console.log(`🍎 Scanning food from URI: ${imageUri}`);
        const file = await this.uriToFile(imageUri, 'food_image.jpg');
        return this.scanFoodImage(file);
    }

    // Convenience method for scanning nutrition label from React Native image URI  
    async scanNutritionLabelFromUri(imageUri: string): Promise<NutritionLabelResponse> {
        console.log(`🏷️ Scanning nutrition label from URI: ${imageUri}`);
        const file = await this.uriToFile(imageUri, 'nutrition_label.jpg');
        return this.scanNutritionLabel(file);
    }

    // Generate nutrition advice with enhanced type safety and error handling
    async generateNutritionAdvice(
        userData: UserData,
        personalPlan: PersonalPlan,
        mealPlan: MealPlan,
        userProgress?: UserProgress
    ): Promise<NutritionAdvisorResponse> {
        console.log('🤖 Generating nutrition advice...');
        console.log('📊 Request data:', {
            userData: userData.nama,
            hasPersonalPlan: !!personalPlan,
            hasMealPlan: !!mealPlan,
            hasUserProgress: !!userProgress
        });

        const requestBody: NutritionAdvisorRequest = {
            user_data: userData,
            personal_plan: personalPlan,
            meal_plan: mealPlan,
            user_progress: userProgress || {},
        };

        console.log('⏱️ Using extended timeout for nutrition advice generation (10 minutes)');

        const response = await this.request<NutritionAdvisorResponse>('/generate_nutrition_advisor', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }, 600000); // 10 minutes timeout for very slow AI processing

        console.log('✅ Nutrition advice generated successfully');
        return response;
    }
}

export const apiService = new ApiService();
