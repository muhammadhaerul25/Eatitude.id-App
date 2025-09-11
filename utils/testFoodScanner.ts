/**
 * Food Scanner Test Utility
 * 
 * This file provides test functions for the food scanner API integration.
 * Use this to test the API calls during development.
 */

import { scanFoodNutrition } from '../services/foodScannerAPI';
import { scanNutritionLabel } from '../services/nutritionLabelScannerAPI';

/**
 * Test food scanning with a sample image
 * 
 * Call this function from your component to test the API integration:
 * ```typescript
 * import { testFoodScanning } from '../utils/testFoodScanner';
 * 
 * const handleTest = async () => {
 *   await testFoodScanning();
 * };
 * ```
 */
export const testFoodScanning = async () => {
    console.log('🧪 Testing Food Scanner API...');

    try {
        // Create a test file (you would replace this with actual file input)
        const testImageBlob = new Blob(['test image data'], { type: 'image/jpeg' });
        const testFile = new File([testImageBlob], 'test-food.jpg', { type: 'image/jpeg' });

        console.log('📤 Sending test image to food scanner...');
        const result = await scanFoodNutrition(testFile);

        if (result.success) {
            console.log('✅ Food scan successful!');
            console.log('🍽️ Food name:', result.data?.nama_makanan);
            console.log('📊 Calories:', result.data?.["estimasi_total_kalori_(kcal)"]);
            console.log('🏆 Grade:', result.data?.nutri_grade);
            console.log('📝 Description:', result.data?.keterangan);
        } else {
            console.log('❌ Food scan failed:', result.error);
        }

        return result;

    } catch (error) {
        console.error('🚨 Test error:', error);
        return null;
    }
};

/**
 * Test nutrition label scanning
 */
export const testLabelScanning = async () => {
    console.log('🧪 Testing Nutrition Label Scanner API...');

    try {
        const testImageBlob = new Blob(['test label data'], { type: 'image/jpeg' });
        const testFile = new File([testImageBlob], 'test-label.jpg', { type: 'image/jpeg' });

        console.log('📤 Sending test label to scanner...');
        const result = await scanNutritionLabel(testFile);

        if (result.success) {
            console.log('✅ Label scan successful!');
            console.log('🏷️ Product name:', result.data?.nama_makanan);
            console.log('📊 Calories:', result.data?.["estimasi_total_kalori_(kcal)"]);
            console.log('🏆 Grade:', result.data?.nutri_grade);
        } else {
            console.log('❌ Label scan failed:', result.error);
        }

        return result;

    } catch (error) {
        console.error('🚨 Test error:', error);
        return null;
    }
};

/**
 * Sample nutrition data for testing UI components
 * Use this when you want to test the UI without making API calls
 */
export const mockNutritionData = {
    nama_makanan: "Nasi Goreng Ayam",
    foto_makanan: "Foto menunjukkan nasi goreng ayam dengan telur dan sayuran",
    estimasi_komposisi_makanan: {
        "nasi_putih_(g)": 150,
        "ayam_goreng_(g)": 80,
        "telur_(g)": 50,
        "sayuran_campur_(g)": 30
    },
    estimasi_kandungan_makronutrisi: {
        "karbohidrat_(g)": 68,
        "protein_(g)": 25,
        "lemak_(g)": 12,
        "serat_(g)": 3
    },
    estimasi_kandungan_mikronutrisi: {
        "vitamin_(mg)": {
            "vitamin_a_(mg)": 0.2,
            "vitamin_b_kompleks_(mg)": 1.5,
            "vitamin_c_(mg)": 0.8,
            "vitamin_d_(mg)": 2.1,
            "vitamin_e_(mg)": 0.5,
            "vitamin_k_(mg)": 0.1
        },
        "mineral_(mg)": {
            "kalsium_(mg)": 120,
            "zat_besi_(mg)": 2.1,
            "magnesium_(mg)": 45,
            "kalium_(mg)": 180,
            "natrium_(mg)": 160,
            "zinc_(mg)": 1.2,
            "yodium_(mg)": 0.05
        }
    },
    estimasi_kandungan_tambahan: {
        "gula_(g)": 12,
        "garam_(g)": 0.4,
        "lemak_jenuh_(g)": 1,
        "lemak_trans_(g)": 0,
        "kafein_(mg)": 0,
        "kolesterol_(mg)": 5
    },
    "estimasi_total_kalori_(kcal)": 485,
    nutri_grade: "B+" as const,
    nutri_status: "Seimbang untuk Makan Siang",
    keterangan: "Nasi goreng ayam ini mengandung karbohidrat yang cukup untuk energi, protein dari ayam dan telur untuk pertumbuhan otot. Perhatikan kandungan lemak dan garam yang cukup tinggi."
};

/**
 * Mock API response for testing
 */
export const mockAPIResponse = {
    nutrition_estimation: mockNutritionData
};

/**
 * Test the food scanner hook with mock data
 */
export const testWithMockData = () => {
    console.log('🧪 Testing with mock data...');
    console.log('📊 Mock nutrition data:', mockNutritionData);
    return {
        success: true,
        data: mockNutritionData,
        confidence: 92
    };
};

export default {
    testFoodScanning,
    testLabelScanning,
    mockNutritionData,
    mockAPIResponse,
    testWithMockData,
};
