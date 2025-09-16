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
    confidence_score: number;
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
        console.log('🔄 Starting base64 conversion for:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const base64String = reader.result as string;
                console.log('📄 FileReader result details:', {
                    totalLength: base64String.length,
                    hasDataPrefix: base64String.startsWith('data:'),
                    dataPrefix: base64String.split(',')[0],
                    firstCharsAfterComma: base64String.split(',')[1]?.substring(0, 50)
                });

                // Remove data URL prefix to get pure base64
                const base64Data = base64String.split(',')[1];

                if (!base64Data || base64Data.length === 0) {
                    console.error('🚨 Base64 conversion failed - no data after comma');
                    reject(new Error('Failed to extract base64 data from FileReader result'));
                    return;
                }

                console.log('✅ Base64 conversion successful:', {
                    pureBase64Length: base64Data.length,
                    estimatedSizeKB: Math.round(base64Data.length * 0.75 / 1024),
                    firstChars: base64Data.substring(0, 50),
                    lastChars: base64Data.substring(base64Data.length - 20)
                });

                resolve(base64Data);
            } catch (error) {
                console.error('🚨 Error processing FileReader result:', error);
                reject(new Error('Failed to process base64 conversion result'));
            }
        };
        reader.onerror = (error) => {
            console.error('🚨 FileReader error:', error);
            reject(new Error('Failed to convert image to base64'));
        };
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
    const endpoint = `${API_BASE_URL}/generate_food_nutrition_estimation_base64`;

    try {
        console.log('🔍 Starting food nutrition scan...');
        console.log(`📁 Image file: ${imageFile.name}, Size: ${(imageFile.size / 1024).toFixed(2)}KB`);
        console.log(`🌐 API Endpoint: ${endpoint}`);

        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('Please upload a valid image file (JPG, PNG, etc.)');
        }

        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image file is too large. Please use an image smaller than 10MB.');
        }

        // Convert image to base64
        console.log('📷 Converting image to base64...');
        const base64Image = await convertImageToBase64(imageFile);
        console.log('✅ Image converted to base64');

        // For Android compatibility, try base64 approach instead of FormData
        const requestBody = {
            file: base64Image
        };

        console.log('🚀 Sending image to AI food scanner...');

        // Make API call with extended timeout for AI processing
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout for AI processing

        // Enhanced headers for better Android compatibility
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // For base64 JSON approach
        };

        // Add User-Agent for Android compatibility
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
            (headers as any)['User-Agent'] = navigator.userAgent;
        }

        console.log('🔧 Request details:', {
            endpoint,
            method: 'POST',
            headers: JSON.stringify(headers),
            bodySize: base64Image.length,
            imageFileSize: imageFile ? imageFile.size : 'unknown',
            fileName: imageFile ? imageFile.name : 'unknown'
        });

        // Test basic connectivity first
        console.log('🌐 Testing basic connectivity to domain...');
        try {
            // Use the same pattern as working APIs - Promise.race with timeout
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Connectivity test timeout')), 10000)
            );

            const testResponse = await Promise.race([
                fetch('https://eatitude-id-api.vercel.app/', {
                    method: 'GET',
                    headers: { 'Accept': 'text/html' },
                }),
                timeoutPromise
            ]);
            console.log('✅ Basic connectivity test:', testResponse.status, testResponse.statusText);
        } catch (connectivityError) {
            console.error('❌ Basic connectivity test failed:', connectivityError);
            throw new Error(`Cannot reach API server: ${connectivityError instanceof Error ? connectivityError.message : 'Unknown connectivity error'}`);
        }

        console.log('🚀 Making actual API request...');

        // Use the same timeout pattern as working APIs
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Food scanner request timeout')), 300000)
        );

        const response = await Promise.race([
            fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody), // Send as JSON with base64 image
                // Additional options for Android compatibility
                credentials: 'omit', // Don't send cookies
                cache: 'no-cache',
                redirect: 'follow',
            }),
            timeoutPromise
        ]);

        clearTimeout(timeoutId);

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

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

        // Detailed error analysis
        console.error('🔧 Detailed error analysis:', {
            errorType: typeof error,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : 'No stack trace',
            errorCause: error instanceof Error ? error.cause : 'No cause',
            isNetworkError: error instanceof Error && error.message.includes('Network'),
            isTimeoutError: error instanceof Error && error.name === 'AbortError',
            isFetchError: error instanceof Error && error.message.includes('fetch'),
        });

        // Check if it's a specific type of error
        if (error instanceof TypeError && error.message === 'Network request failed') {
            console.error('🚨 This is the classic React Native Android network error');
            console.error('🔧 Possible causes:');
            console.error('   1. Android network security policy blocking the request');
            console.error('   2. DNS resolution failure');
            console.error('   3. SSL certificate validation issue');
            console.error('   4. Network permissions not granted');
            console.error('   5. Proxy or firewall blocking the request');
        }

        let errorMessage = 'Unknown error occurred during food scanning';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Food scanning timed out. Please try again with a clearer image.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error') || error.message.includes('fetch')) {
                errorMessage = 'Network error: Unable to connect to food scanner service. Please check your internet connection.';
            } else if (error.message.includes('422')) {
                errorMessage = 'Invalid image format. Please upload a clear photo of food.';
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Network request failed. Please check your internet connection and try again.';
            } else {
                errorMessage = error.message;
            }
        }

        // Log additional debug information for network errors
        console.error('🔧 Debug info:', {
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
            apiUrl: API_BASE_URL,
            endpoint,
        });

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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
            } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
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
