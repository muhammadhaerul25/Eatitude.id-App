/**
 * Nutrition Advisor API Integration
 * TypeScript integration for the FastAPI /generate_nutrition_advisor endpoint
 * 
 * This file provides type-safe API integration with proper error handling
 * and follows the exact API specification from the backend.
 */

// =============================================================================
// TYPE DEFINITIONS - Matching FastAPI Schema Exactly
// =============================================================================

/**
 * User data interface matching the FastAPI UserData model
 */
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

/**
 * Request body interface for the nutrition advisor endpoint
 * Matches the FastAPI NutritionAdvisorRequest model exactly
 */
export interface NutritionAdvisorRequest {
    user_data: UserData;
    personal_plan: object; // Generic object as per API spec
    meal_plan: object;     // Generic object as per API spec
    user_progress: object; // Required field, not optional - use {} if no data
}

/**
 * Response interface for the nutrition advisor endpoint
 * Based on actual API response format
 */
export interface NutritionAdvisorResponse {
    insight: string;
    recommendation: string;
    reminder: string;
    alert: string;
}

/**
 * Error response interface for API errors
 */
export interface ApiError {
    detail: string;
    status_code?: number;
}

// =============================================================================
// API FUNCTION - Reusable with Proper Error Handling
// =============================================================================

/**
 * Call the nutrition advisor API endpoint
 * 
 * @param userData - User's personal information and preferences
 * @param personalPlan - User's personal nutrition plan (as object)
 * @param mealPlan - User's meal plan (as object)
 * @param userProgress - User's progress data (optional, defaults to empty object)
 * @returns Promise containing nutrition advice
 * 
 * @throws {Error} Network errors, validation errors, or server errors
 */
export async function generateNutritionAdvice(
    userData: UserData,
    personalPlan: object,
    mealPlan: object,
    userProgress: object = {}
): Promise<NutritionAdvisorResponse> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const endpoint = `${API_BASE_URL}/generate_nutrition_advisor`;

    try {
        // Prepare request body matching exact API specification
        const requestBody: NutritionAdvisorRequest = {
            user_data: userData,
            personal_plan: personalPlan,
            meal_plan: mealPlan,
            user_progress: userProgress, // Always provide an object (empty if no data)
        };

        console.log('🤖 Calling nutrition advisor API...');
        console.log(`📍 Endpoint: ${endpoint}`);
        console.log(`👤 User: ${userData.nama}`);

        // Make the API call with proper headers and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            // Extended timeout for AI processing (10 minutes)
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData: ApiError = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // If error response is not JSON, use status text
            }

            throw new Error(`API Error - ${errorMessage}`);
        }

        // Parse and return successful response
        const result: NutritionAdvisorResponse = await response.json();

        console.log('✅ Nutrition advice generated successfully');
        return result;

    } catch (error) {
        console.error('❌ Failed to generate nutrition advice:', error);

        // Re-throw with more context for different error types
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout: Nutrition advice generation took too long');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
                throw new Error('Network error: Unable to connect to nutrition advisor service');
            }
            if (error.message.includes('422')) {
                throw new Error('Validation error: Please check that all required user data is provided');
            }
        }

        // Re-throw the original error if it's already properly formatted
        throw error;
    }
}

export default {
    generateNutritionAdvice,
};
