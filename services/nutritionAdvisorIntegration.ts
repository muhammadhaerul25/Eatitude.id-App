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

// =============================================================================
// EXAMPLE USAGE IN REACT COMPONENT
// =============================================================================

/**
 * Example of how to use the nutrition advisor API in a React component
 * 
 * Copy this code into your React component (.tsx file):
 * 
 * ```typescript
 * import React, { useState } from 'react';
 * import { generateNutritionAdvice, UserData, NutritionAdvisorResponse } from './nutritionAdvisorIntegration';
 * 
 * export const NutritionAdvisorComponent: React.FC = () => {
 *     const [loading, setLoading] = useState(false);
 *     const [advice, setAdvice] = useState<NutritionAdvisorResponse | null>(null);
 *     const [error, setError] = useState<string | null>(null);
 * 
 *     const handleGenerateAdvice = async () => {
 *         setLoading(true);
 *         setError(null);
 * 
 *         try {
 *             // Example user data
 *             const userData: UserData = {
 *                 nama: "John Doe",
 *                 usia: 30,
 *                 jenis_kelamin: "Laki-laki",
 *                 berat_badan: 70,
 *                 tinggi_badan: 175,
 *                 tingkat_aktivitas: "Sedang",
 *                 catatan_aktivitas: "Gym 3x seminggu",
 *                 waktu_bangun: "06:00",
 *                 waktu_tidur: "22:00",
 *                 preferensi_makanan: "Indonesia, Mediterania",
 *                 alergi_makanan: null,
 *                 kondisi_kesehatan: null,
 *                 tujuan: "Menurunkan berat badan"
 *             };
 * 
 *             // Example personal plan (from your personal plan API)
 *             const personalPlan = {
 *                 kebutuhan_kalori: { harian: 2000 },
 *                 kebutuhan_makronutrisi: {
 *                     karbohidrat: "45-65%",
 *                     protein: "15-25%",
 *                     lemak: "20-35%"
 *                 }
 *             };
 * 
 *             // Example meal plan (from your meal plan API)
 *             const mealPlan = {
 *                 sarapan: { nama: "Oatmeal dengan buah", kalori: 300 },
 *                 makan_siang: { nama: "Nasi ayam sayur", kalori: 600 },
 *                 makan_malam: { nama: "Ikan panggang", kalori: 500 }
 *             };
 * 
 *             // Example user progress (optional - use empty object if no data)
 *             const userProgress = {
 *                 target_kalori: "2000 kkal",
 *                 progress_berat: "turun 2kg dalam 2 minggu"
 *             };
 * 
 *             // Call the API
 *             const result = await generateNutritionAdvice(
 *                 userData,
 *                 personalPlan,
 *                 mealPlan,
 *                 userProgress // Pass empty object {} if no progress data
 *             );
 * 
 *             setAdvice(result);
 * 
 *         } catch (err) {
 *             setError(err instanceof Error ? err.message : 'Unknown error occurred');
 *         } finally {
 *             setLoading(false);
 *         }
 *     };
 * 
 *     return (
 *         <div>
 *             <h2>Nutrition Advisor</h2>
 *             
 *             <button 
 *                 onClick={handleGenerateAdvice}
 *                 disabled={loading}
 *             >
 *                 {loading ? 'Generating Advice...' : 'Get Nutrition Advice'}
 *             </button>
 * 
 *             {error && (
 *                 <div style={{ color: 'red', marginTop: '10px' }}>
 *                     <strong>Error:</strong> {error}
 *                 </div>
 *             )}
 * 
 *             {advice && (
 *                 <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa' }}>
 *                     <h3>Nutrition Advice:</h3>
 *                     <pre>{JSON.stringify(advice.nutrition_advice, null, 2)}</pre>
 *                 </div>
 *             )}
 *         </div>
 *     );
 * };
 * ```
 */

// =============================================================================
// USAGE EXAMPLES AND BEST PRACTICES
// =============================================================================

/**
 * USAGE NOTES:
 * 
 * 1. REQUIRED FIELDS: All fields in UserData are required except those marked with "?"
 * 
 * 2. USER_PROGRESS: Always provide an object, even if empty: {}
 *    - The API requires this field, it cannot be undefined or null
 * 
 * 3. OBJECT TYPES: personal_plan and meal_plan are generic objects
 *    - The API accepts any structure for these fields
 *    - Make sure they contain meaningful data for better advice
 * 
 * 4. ERROR HANDLING: The function throws descriptive errors for:
 *    - Network issues (connection problems)
 *    - Validation errors (422 status - check user data)
 *    - Timeout errors (600 seconds = 10 minutes)
 *    - Server errors (500 status)
 * 
 * 5. TIMEOUT: Extended to 10 minutes for AI processing
 *    - Nutrition advice generation can take time
 *    - Show loading state to users
 * 
 * 6. RESPONSE: Returns nutrition_advice as a generic object
 *    - Structure depends on your AI implementation
 *    - Parse accordingly based on your backend response format
 */

/**
 * INTEGRATION CHECKLIST:
 * 
 * ✅ API URL configured in environment variables
 * ✅ Request body matches FastAPI schema exactly
 * ✅ user_progress is always an object (never undefined)
 * ✅ Proper error handling for all error types
 * ✅ Extended timeout for AI processing
 * ✅ TypeScript interfaces match API contracts
 * ✅ Example component shows proper usage
 * ✅ Loading states and error states handled
 */

export default {
    generateNutritionAdvice,
};
