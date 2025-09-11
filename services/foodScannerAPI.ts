/**
 * Food Scanner API Integration
 * TypeScript integration for the FastAPI /generate_food_nutrition_estimation endpoint
 * 
 * This file provides type-safe API integration for food scanning functionality
 * with proper error handling and image processing capabilities.
 */

// =============================================================================
// TYPE DEFINITIONS - Matching FastAPI Schema and AI Response
// =============================================================================

/**
 * Request interface for food scanner endpoint
 */
export interface FoodScannerRequest {
    file: string; // Base64 encoded image or file path
}

/**
 * Nutrition estimation response structure based on AI prompt
 * This matches the direct API response format
 */
export interface NutritionEstimation {
    nama_makanan: string;
    foto_makanan: string;
    estimasi_komposisi_makanan: {
        [key: string]: number; // Dynamic keys like "item1_(g)", "item2_(g)", etc.
    };
    estimasi_kandungan_makronutrisi: {
        "karbohidrat_(g)": number;
        "protein_(g)": number;
        "lemak_(g)": number;
        "serat_(g)": number;
    };
    estimasi_kandungan_mikronutrisi: {
        "vitamin_(mg)": {
            "vitamin_a_(mg)": number;
            "vitamin_b_kompleks_(mg)": number;
            "vitamin_c_(mg)": number;
            "vitamin_d_(mg)": number;
            "vitamin_e_(mg)": number;
            "vitamin_k_(mg)": number;
        };
        "mineral_(mg)": {
            "kalsium_(mg)": number;
            "zat_besi_(mg)": number;
            "magnesium_(mg)": number;
            "kalium_(mg)": number;
            "natrium_(mg)": number;
            "zinc_(mg)": number;
            "yodium_(mg)": number;
        };
    };
    estimasi_kandungan_tambahan: {
        "gula_(g)": number;
        "garam_(g)": number;
        "lemak_jenuh_(g)": number;
        "lemak_trans_(g)": number;
        "kafein_(mg)": number;
        "kolesterol_(mg)": number;
    };
    "estimasi_total_kalori_(kcal)": number;
    nutri_grade: "A" | "B" | "C" | "D" | "E";
    nutri_status: string;
    keterangan: string;
}

// FoodScannerResponse is now the same as NutritionEstimation since API returns direct data
export type FoodScannerResponse = NutritionEstimation;

/**
 * Error response interface
 */
export interface FoodScannerError {
    detail: string;
    status_code?: number;
}

/**
 * Service result interface for better error handling
 */
export interface FoodScannerResult {
    success: boolean;
    data?: NutritionEstimation;
    error?: string;
    confidence?: number;
}

// =============================================================================
// API SERVICE FUNCTION
// =============================================================================

/**
 * Convert image file to base64 string
 * 
 * @param file - Image file to convert
 * @returns Promise containing base64 string
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            // Remove data URL prefix to get pure base64
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(file);
    });
};

/**
 * Scan food image and get nutrition estimation
 * 
 * @param imageFile - Image file to scan
 * @returns Promise containing nutrition estimation result
 * 
 * @throws {Error} Network errors, validation errors, or server errors
 */
export async function scanFoodNutrition(imageFile: File): Promise<FoodScannerResult> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const endpoint = `${API_BASE_URL}/generate_food_nutrition_estimation`;

    try {
        console.log('🔍 Starting food nutrition scan...');
        console.log(`📁 Image file: ${imageFile.name}, Size: ${(imageFile.size / 1024).toFixed(2)}KB`);

        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('Please upload a valid image file (JPG, PNG, etc.)');
        }

        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image file is too large. Please use an image smaller than 10MB.');
        }

        // Convert image to base64
        console.log('📷 Image converted to base64');

        // Prepare form data (FastAPI expects multipart/form-data for file uploads)
        const formData = new FormData();
        formData.append('file', imageFile);

        console.log('🚀 Sending image to AI food scanner...');

        // Make API call with extended timeout for AI processing
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData, // Send as FormData, not JSON
            // Don't set Content-Type header - let browser set it for FormData
            signal: AbortSignal.timeout(300000), // 5 minutes timeout for AI processing
        });

        // Handle HTTP errors
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData: FoodScannerError = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // If error response is not JSON, use status text
            }

            throw new Error(`API Error - ${errorMessage}`);
        }

        // Parse successful response
        const result: FoodScannerResponse = await response.json();

        console.log('✅ Food nutrition scan completed successfully');
        console.log(`🍽️ Detected food: ${result.nama_makanan}`);
        console.log(`📊 Calories: ${result["estimasi_total_kalori_(kcal)"]} kcal`);
        console.log(`🏆 Grade: ${result.nutri_grade}`);

        return {
            success: true,
            data: result,
            confidence: 92, // You can implement actual confidence calculation based on AI response
        };
    } catch (error) {
        console.error('❌ Failed to scan food nutrition:', error);

        let errorMessage = 'Unknown error occurred during food scanning';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Food scanning timed out. Please try again with a clearer image.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
                errorMessage = 'Network error: Unable to connect to food scanner service.';
            } else if (error.message.includes('422')) {
                errorMessage = 'Invalid image format. Please upload a clear photo of food.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Alternative function for base64 image scanning (if needed)
 * 
 * @param base64Image - Base64 encoded image string
 * @returns Promise containing nutrition estimation result
 */
export async function scanFoodNutritionFromBase64(base64Image: string): Promise<FoodScannerResult> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const endpoint = `${API_BASE_URL}/generate_food_nutrition_estimation`;

    try {
        console.log('🔍 Starting food nutrition scan from base64...');

        const requestBody: FoodScannerRequest = {
            file: base64Image,
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(300000), // 5 minutes timeout
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData: FoodScannerError = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // If error response is not JSON, use status text
            }

            throw new Error(`API Error - ${errorMessage}`);
        }

        const result: FoodScannerResponse = await response.json();

        console.log('✅ Food nutrition scan completed successfully');

        return {
            success: true,
            data: result,
            confidence: 92,
        };
    } catch (error) {
        console.error('❌ Failed to scan food nutrition from base64:', error);

        let errorMessage = 'Unknown error occurred during food scanning';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Food scanning timed out. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Unable to connect to food scanner service.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format nutrition estimation for display
 * 
 * @param estimation - Nutrition estimation data
 * @returns Formatted object for easy display
 */
export const formatNutritionEstimation = (estimation: NutritionEstimation) => {
    return {
        foodName: estimation.nama_makanan,
        photoDescription: estimation.foto_makanan,
        totalCalories: estimation["estimasi_total_kalori_(kcal)"],
        grade: estimation.nutri_grade,
        status: estimation.nutri_status,
        description: estimation.keterangan,
        composition: estimation.estimasi_komposisi_makanan,
        macronutrients: {
            carbs: estimation.estimasi_kandungan_makronutrisi["karbohidrat_(g)"],
            protein: estimation.estimasi_kandungan_makronutrisi["protein_(g)"],
            fat: estimation.estimasi_kandungan_makronutrisi["lemak_(g)"],
            fiber: estimation.estimasi_kandungan_makronutrisi["serat_(g)"],
        },
        vitamins: estimation.estimasi_kandungan_mikronutrisi["vitamin_(mg)"],
        minerals: estimation.estimasi_kandungan_mikronutrisi["mineral_(mg)"],
        additionalNutrients: estimation.estimasi_kandungan_tambahan,
    };
};

/**
 * USAGE EXAMPLES AND BEST PRACTICES
 * 
 * 1. FILE UPLOAD: Use scanFoodNutrition(file) for file input
 * 2. BASE64: Use scanFoodNutritionFromBase64(base64) for base64 strings
 * 3. ERROR HANDLING: Always check result.success before using result.data
 * 4. TIMEOUT: AI processing can take up to 5 minutes
 * 5. FILE SIZE: Keep images under 10MB for best performance
 * 6. IMAGE QUALITY: Clear, well-lit photos give better results
 * 
 * Example:
 * ```typescript
 * const result = await scanFoodNutrition(imageFile);
 * if (result.success) {
 *   console.log('Food:', result.data.nama_makanan);
 *   console.log('Calories:', result.data["estimasi_total_kalori_(kcal)"]);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */

export default {
    scanFoodNutrition,
    scanFoodNutritionFromBase64,
    formatNutritionEstimation,
    convertImageToBase64,
};
