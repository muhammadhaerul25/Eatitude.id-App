/**
 * Nutrition Label Scanner API Integration
 * TypeScript integration for the FastAPI /generate_label_informasi_gizi_nutrition_estimation endpoint
 * 
 * This file provides type-safe API integration for nutrition label scanning functionality.
 */

import { debugAPIRequest } from '../utils/debugNutritionScanner';
import { convertImageToBase64 } from './foodScannerAPI';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert any image format to JPEG for better API compatibility
 * React Native compatible version
 * 
 * @param imageFile - Input image file
 * @returns Promise containing JPEG file
 */
const convertImageToJPEG = async (imageFile: File): Promise<File> => {
    // In React Native, we can't use canvas, so we'll create a new File with JPEG mime type
    // The actual format conversion would need to be handled by the backend
    console.log(`🔄 Converting ${imageFile.type} to JPEG format...`);

    try {
        // Create a new blob with JPEG mime type
        const jpegBlob = new Blob([imageFile], { type: 'image/jpeg' });
        const jpegFile = new File([jpegBlob], 'converted_image.jpg', {
            type: 'image/jpeg'
        });

        console.log(`✅ MIME type updated: ${imageFile.type} → image/jpeg`);
        return jpegFile;
    } catch (error) {
        console.warn('⚠️ MIME type conversion failed, using original file:', error);
        return imageFile;
    }
};// =============================================================================
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
    const endpoint = `${API_BASE_URL}/generate_label_informasi_gizi_nutrition_estimation_base64`;

    try {
        console.log('🏷️ Starting nutrition label scan...');
        console.log(`📁 Image file: ${imageFile.name}, Size: ${(imageFile.size / 1024).toFixed(2)}KB`);
        console.log(`🌐 API Endpoint: ${endpoint}`);

        // Validate image file with more specific format checking
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!imageFile.type || !supportedFormats.includes(imageFile.type.toLowerCase())) {
            throw new Error('Please upload a valid image file (JPG, PNG, or WebP only)');
        }

        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image file is too large. Please use an image smaller than 10MB.');
        }

        // Enhanced image processing for better API compatibility
        console.log('📷 Processing image for API compatibility...');
        console.log(`📁 Original format: ${imageFile.type}, size: ${(imageFile.size / 1024).toFixed(2)}KB`);

        let processedImageFile = imageFile;

        // Always ensure JPEG format for maximum compatibility
        console.log('🔄 Ensuring JPEG format for API compatibility...');
        processedImageFile = await convertImageToJPEG(imageFile);

        // Additional validation: check if the file is actually readable
        try {
            const testRead = await new Promise<boolean>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(true);
                reader.onerror = () => resolve(false);
                reader.readAsDataURL(processedImageFile);
            });

            if (!testRead) {
                throw new Error('Image file appears to be corrupted or unreadable');
            }
        } catch (readError) {
            console.error('🚨 Image readability test failed:', readError);
            throw new Error('Unable to read image file. Please try a different image.');
        }

        // Convert image to base64 for Android compatibility
        console.log('📷 Converting image to base64...');
        const base64Image = await convertImageToBase64(processedImageFile);

        // Validate base64 data
        if (!base64Image || base64Image.length < 100) {
            throw new Error('Failed to convert image to base64 format. Please try a different image.');
        }

        // Check if base64 starts with valid image data
        const base64Header = base64Image.substring(0, 20);
        if (!base64Header.match(/^[A-Za-z0-9+/]/)) {
            throw new Error('Invalid base64 image data. Please try a different image.');
        }

        console.log('✅ Image processed and converted to base64');
        console.log(`📊 Base64 length: ${base64Image.length} characters`);
        console.log(`🔍 Base64 starts with: ${base64Image.substring(0, 50)}...`);

        // 🧪 EXPERIMENTAL: Try to validate base64 by attempting to decode it
        try {
            const binaryString = atob(base64Image.substring(0, 100)); // Test decode first 100 chars
            console.log('✅ Base64 validation successful - data is decodable');
            console.log('🔍 First bytes after decode:', Array.from(binaryString.slice(0, 10), c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
        } catch (decodeError) {
            console.error('🚨 Base64 decode test failed:', decodeError);
            throw new Error('Base64 data is corrupted. Please try a different image.');
        }

        // For Android compatibility, try base64 approach instead of FormData
        const requestBody = {
            file: base64Image
        };

        console.log('🚀 Sending nutrition label to AI scanner...');
        console.log(`📊 Request body size: ${JSON.stringify(requestBody).length} bytes`);
        console.log(`🔧 Final validation - MIME type: ${processedImageFile.type}, Size: ${processedImageFile.size} bytes`);

        // Enhanced headers for better Android compatibility
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // For base64 JSON approach
        };

        // Add User-Agent for Android compatibility
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
            (headers as any)['User-Agent'] = navigator.userAgent;
        }

        // 🚨 DETAILED REQUEST LOGGING 🚨
        console.log('🔍 === DETAILED REQUEST DEBUG INFO ===');
        console.log('🌐 API Endpoint:', endpoint);
        console.log('📋 Request Headers:', JSON.stringify(headers, null, 2));
        console.log('📦 Request Method: POST');
        console.log('📊 Original Image Details:', {
            name: imageFile.name,
            type: imageFile.type,
            size: imageFile.size,
            lastModified: imageFile.lastModified
        });
        console.log('🔄 Processed Image Details:', {
            name: processedImageFile.name,
            type: processedImageFile.type,
            size: processedImageFile.size,
            lastModified: processedImageFile.lastModified
        });
        console.log('📝 Base64 Image Details:', {
            length: base64Image.length,
            firstChars: base64Image.substring(0, 100),
            lastChars: base64Image.substring(base64Image.length - 50),
            hasDataPrefix: base64Image.startsWith('data:'),
            estimatedDecodedSize: Math.round(base64Image.length * 0.75)
        });
        console.log('📤 Full Request Body (first 500 chars):', JSON.stringify(requestBody).substring(0, 500));
        console.log('🔧 Request Body Structure:', {
            keys: Object.keys(requestBody),
            fileFieldType: typeof requestBody.file,
            fileFieldLength: requestBody.file?.length || 'N/A'
        });
        console.log('🔍 === END REQUEST DEBUG INFO ===');

        // 🚨 CALL DEBUG UTILITY 🚨
        debugAPIRequest(requestBody, endpoint, headers);

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

        console.log('🚀 Making actual nutrition label API request...');

        // Use the same timeout pattern as working APIs
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Nutrition label scanner request timeout')), 300000)
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

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

        // Handle HTTP errors with more specific image format error handling
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData = await response.json();
                console.error('🚨 API Error Response:', errorData);

                // Check for specific image format errors
                if (errorData.detail && typeof errorData.detail === 'string') {
                    const detail = errorData.detail.toLowerCase();
                    if (detail.includes('unsupportedimageformat') || detail.includes('image format')) {
                        errorMessage = 'Image format not supported. Please try a different image or convert to JPG format.';
                    } else if (detail.includes('invalidparameter')) {
                        errorMessage = 'Invalid image parameters. Please try a clearer, higher quality image.';
                    } else {
                        errorMessage = errorData.detail;
                    }
                } else {
                    errorMessage = errorData.detail || errorMessage;
                }
            } catch {
                // If error response is not JSON, use status text
                if (response.status === 400) {
                    errorMessage = 'Bad request - possibly unsupported image format. Please try a JPG image.';
                }
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

        let errorMessage = 'Unknown error occurred during label scanning';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Label scanning timed out. Please try again with a clearer image.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error') || error.message.includes('fetch')) {
                errorMessage = 'Network error: Unable to connect to label scanner service. Please check your internet connection.';
            } else if (error.message.includes('422')) {
                errorMessage = 'Invalid image format or unclear nutrition label. Please upload a clear photo of the nutrition facts label.';
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
            endpoint,
        });

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export default {
    scanNutritionLabel,
};
