/**
 * Nutrition Label Scanner API Integration
 * TypeScript integration for the FastAPI /generate_label_informasi_gizi_nutrition_estimation endpoint
 * 
 * This file provides type-safe API integration for nutrition label scanning functionality.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Request interface for nutrition label scanner endpoint
 */
export interface NutritionLabelScannerRequest {
    file: string; // Base64 encoded image or file path
}

/**
 * Nutrition label scanner response (same structure as food scanner)
 */
export interface NutritionLabelEstimation {
    nama_makanan: string;
    foto_makanan: string;
    estimasi_komposisi_makanan: {
        [key: string]: number;
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

/**
 * API Response interface - Direct response format
 */
export type NutritionLabelScannerResponse = NutritionLabelEstimation;

/**
 * Service result interface
 */
export interface NutritionLabelScannerResult {
    success: boolean;
    data?: NutritionLabelEstimation;
    error?: string;
    confidence?: number;
}

// =============================================================================
// API SERVICE FUNCTION
// =============================================================================

/**
 * Scan nutrition label image and get nutrition estimation
 * 
 * @param imageFile - Image file containing nutrition label
 * @returns Promise containing nutrition estimation result
 */
export async function scanNutritionLabel(imageFile: File): Promise<NutritionLabelScannerResult> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const endpoint = `${API_BASE_URL}/generate_label_informasi_gizi_nutrition_estimation`;

    try {
        console.log('🏷️ Starting nutrition label scan...');
        console.log(`📁 Image file: ${imageFile.name}, Size: ${(imageFile.size / 1024).toFixed(2)}KB`);

        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('Please upload a valid image file (JPG, PNG, etc.)');
        }

        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image file is too large. Please use an image smaller than 10MB.');
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', imageFile);

        console.log('🚀 Sending nutrition label to AI scanner...');

        // Make API call with extended timeout for AI processing
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(300000), // 5 minutes timeout
        });

        // Handle HTTP errors
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // If error response is not JSON, use status text
            }

            throw new Error(`API Error - ${errorMessage}`);
        }

        // Parse successful response
        const result: NutritionLabelScannerResponse = await response.json();

        console.log('✅ Nutrition label scan completed successfully');
        console.log(`🏷️ Detected product: ${result.nama_makanan}`);
        console.log(`📊 Calories: ${result["estimasi_total_kalori_(kcal)"]} kcal`);
        console.log(`🏆 Grade: ${result.nutri_grade}`);

        return {
            success: true,
            data: result,
            confidence: 88, // Nutrition labels might have slightly lower confidence than food photos
        };
    } catch (error) {
        console.error('❌ Failed to scan nutrition label:', error);

        let errorMessage = 'Unknown error occurred during label scanning';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Label scanning timed out. Please try again with a clearer image.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
                errorMessage = 'Network error: Unable to connect to label scanner service.';
            } else if (error.message.includes('422')) {
                errorMessage = 'Invalid image format or unclear nutrition label. Please upload a clear photo of the nutrition facts label.';
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

export default {
    scanNutritionLabel,
};
