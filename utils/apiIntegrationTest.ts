/**
 * API Integration Test & Data Structure Verification
 * 
 * This file contains comprehensive tests and documentation for the API data structures
 * and integration points. Use this to verify that all API calls work correctly.
 */

import { apiService, NutritionEstimation, NutritionLabelResponse, PersonalPlan, UserData } from '../services/api';
import { dataIntegration } from '../services/dataIntegrationService';
import { mealPlanService } from '../services/enhancedMealPlanAPI';
import { unifiedCache } from '../services/unifiedCacheService';

/**
 * Sample test data that matches the expected API structure
 */
export const TEST_USER_DATA: UserData = {
    nama: "Test User",
    usia: 25,
    jenis_kelamin: "Laki-laki",
    berat_badan: 70,
    tinggi_badan: 175,
    tingkat_aktivitas: "Sedang",
    catatan_aktivitas: "Olahraga 3x seminggu",
    waktu_bangun: "06:00",
    waktu_tidur: "22:00",
    preferensi_makanan: "Suka sayuran dan protein",
    alergi_makanan: "Tidak ada",
    kondisi_kesehatan: "Sehat",
    tujuan: "Menjaga berat badan ideal"
};

export const TEST_PERSONAL_PLAN: PersonalPlan = {
    kebutuhan_kalori: {
        total_harian: 2200,
        per_waktu_makan: {
            sarapan: 550,
            snack_pagi: 150,
            makan_siang: 660,
            snack_sore: 150,
            makan_malam: 690
        }
    },
    kebutuhan_makronutrisi: {
        karbohidrat: { gram_per_hari: 275, persentase: 50 },
        protein: { gram_per_hari: 110, persentase: 20 },
        lemak: { gram_per_hari: 73, persentase: 30 }
    },
    kebutuhan_mikronutrisi: {
        vitamin_a: "700 mcg",
        vitamin_c: "75 mg",
        kalsium: "1000 mg",
        zat_besi: "8 mg"
    },
    batasi_konsumsi: {
        gula_tambahan: "< 25g per hari",
        natrium: "< 2300mg per hari",
        lemak_jenuh: "< 22g per hari"
    },
    kebutuhan_cairan: {
        air_putih: "2000-2500 ml per hari",
        total_cairan: "2500-3000 ml per hari"
    },
    catatan: "Rencana nutrisi untuk menjaga berat badan ideal"
};

/**
 * API Integration Test Class
 */
export class APIIntegrationTest {
    /**
     * Test API connection and basic functionality
     */
    static async testConnection(): Promise<boolean> {
        try {
            console.log('🔗 Testing API connection...');
            const isConnected = await apiService.testConnection();

            if (isConnected) {
                console.log('✅ API connection successful');
                return true;
            } else {
                console.log('❌ API connection failed');
                return false;
            }
        } catch (error) {
            console.error('❌ API connection test error:', error);
            return false;
        }
    }

    /**
     * Test personal plan generation
     */
    static async testPersonalPlanGeneration(): Promise<{ success: boolean; data?: PersonalPlan; error?: string }> {
        try {
            console.log('📋 Testing personal plan generation...');

            const personalPlan = await apiService.generatePersonalPlan(TEST_USER_DATA);

            console.log('✅ Personal plan generated successfully');
            console.log('📊 Personal plan structure:', JSON.stringify(personalPlan, null, 2));

            return { success: true, data: personalPlan };

        } catch (error) {
            console.error('❌ Personal plan generation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test meal plan generation
     */
    static async testMealPlanGeneration(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            console.log('🍽️ Testing meal plan generation...');

            const mealPlan = await apiService.generateMealPlan(TEST_USER_DATA, TEST_PERSONAL_PLAN);

            console.log('✅ Meal plan generated successfully');
            console.log('🍽️ Meal plan structure:', JSON.stringify(mealPlan, null, 2));

            return { success: true, data: mealPlan };

        } catch (error) {
            console.error('❌ Meal plan generation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test food scanning (requires actual image)
     */
    static async testFoodScanning(imageUri: string): Promise<{ success: boolean; data?: NutritionEstimation; error?: string }> {
        try {
            console.log('📸 Testing food scanning...');

            const result = await apiService.scanFoodFromUri(imageUri);

            console.log('✅ Food scanning successful');
            console.log('🍎 Food scan result:', JSON.stringify(result, null, 2));

            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Food scanning failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test nutrition label scanning (requires actual image)
     */
    static async testNutritionLabelScanning(imageUri: string): Promise<{ success: boolean; data?: NutritionLabelResponse; error?: string }> {
        try {
            console.log('🏷️ Testing nutrition label scanning...');

            const result = await apiService.scanNutritionLabelFromUri(imageUri);

            console.log('✅ Nutrition label scanning successful');
            console.log('🏷️ Nutrition label result:', JSON.stringify(result, null, 2));

            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Nutrition label scanning failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test complete data integration flow
     */
    static async testDataIntegration(): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('🔄 Testing complete data integration flow...');

            // Test 1: Initialize app data
            await dataIntegration.initializeAppData();
            console.log('✅ App data initialized');

            // Test 2: Complete onboarding
            const onboardingResult = await dataIntegration.completeOnboarding({
                nama: TEST_USER_DATA.nama,
                usia: TEST_USER_DATA.usia,
                jenis_kelamin: TEST_USER_DATA.jenis_kelamin,
                berat_badan: TEST_USER_DATA.berat_badan,
                tinggi_badan: TEST_USER_DATA.tinggi_badan,
                tingkat_aktivitas: TEST_USER_DATA.tingkat_aktivitas,
                catatan_aktivitas: TEST_USER_DATA.catatan_aktivitas ?? undefined,
                waktu_bangun: TEST_USER_DATA.waktu_bangun,
                waktu_tidur: TEST_USER_DATA.waktu_tidur,
                preferensi_makanan: TEST_USER_DATA.preferensi_makanan ?? undefined,
                alergi_makanan: TEST_USER_DATA.alergi_makanan ?? undefined,
                kondisi_kesehatan: TEST_USER_DATA.kondisi_kesehatan ?? undefined,
                tujuan: TEST_USER_DATA.tujuan
            });

            if (!onboardingResult.success) {
                throw new Error(onboardingResult.error);
            }
            console.log('✅ Onboarding completed');

            // Test 3: Generate meal plan for today
            const today = new Date();
            const mealPlanResult = await mealPlanService.getMealPlanForDate(today);

            if (!mealPlanResult.success) {
                throw new Error(mealPlanResult.error?.message);
            }
            console.log('✅ Meal plan generated for today');

            // Test 4: Generate nutrition insights
            const insightsResult = await dataIntegration.generateNutritionInsights(today);

            if (!insightsResult.success) {
                throw new Error(insightsResult.error);
            }
            console.log('✅ Nutrition insights generated');

            console.log('🎉 Complete data integration test successful!');
            return { success: true };

        } catch (error) {
            console.error('❌ Data integration test failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test unified cache operations
     */
    static async testUnifiedCache(): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('💾 Testing unified cache operations...');

            // Test 1: Initialize cache
            await unifiedCache.initializeCache();
            console.log('✅ Cache initialized');

            // Test 2: Update user profile
            await unifiedCache.updateUserProfile(TEST_USER_DATA, TEST_PERSONAL_PLAN);
            console.log('✅ User profile updated in cache');

            // Test 3: Get cache data
            const cache = await unifiedCache.getCache();
            console.log('✅ Cache data retrieved');
            console.log('📊 Cache structure:', {
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                dailyCacheEntries: Object.keys(cache.daily_cache).length,
                cacheVersion: cache.cache_version
            });

            // Test 4: Day cache operations
            const today = new Date();
            const dayCache = await unifiedCache.getDayCache(today);
            console.log('✅ Day cache retrieved');
            console.log('📅 Day cache structure:', {
                hasMealPlan: Object.keys(dayCache.meal_plan).length > 0,
                hasProgress: !!dayCache.progress,
                hasInsights: !!dayCache.nutrition_insight,
                scannedFoodsCount: dayCache.scanned_foods.length
            });

            console.log('🎉 Unified cache test successful!');
            return { success: true };

        } catch (error) {
            console.error('❌ Unified cache test failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Run comprehensive API and integration tests
     */
    static async runComprehensiveTests(): Promise<{
        connectionTest: boolean;
        personalPlanTest: { success: boolean; error?: string };
        mealPlanTest: { success: boolean; error?: string };
        cacheTest: { success: boolean; error?: string };
        integrationTest: { success: boolean; error?: string };
    }> {
        console.log('🧪 Starting comprehensive API integration tests...');

        const results = {
            connectionTest: await this.testConnection(),
            personalPlanTest: await this.testPersonalPlanGeneration(),
            mealPlanTest: await this.testMealPlanGeneration(),
            cacheTest: await this.testUnifiedCache(),
            integrationTest: await this.testDataIntegration()
        };

        console.log('📊 Test Results Summary:');
        console.log('=========================');
        console.log(`🔗 API Connection: ${results.connectionTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📋 Personal Plan: ${results.personalPlanTest.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`🍽️ Meal Plan: ${results.mealPlanTest.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`💾 Cache Operations: ${results.cacheTest.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`🔄 Data Integration: ${results.integrationTest.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log('=========================');

        const allPassed = results.connectionTest &&
            results.personalPlanTest.success &&
            results.mealPlanTest.success &&
            results.cacheTest.success &&
            results.integrationTest.success;

        if (allPassed) {
            console.log('🎉 All tests passed! API integration is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the logs above for details.');
        }

        return results;
    }
}

/**
 * Quick test function for debugging
 */
export async function quickAPITest(): Promise<void> {
    console.log('⚡ Running quick API test...');

    try {
        // Test basic connection
        const isConnected = await apiService.testConnection();
        console.log(`API Connection: ${isConnected ? '✅' : '❌'}`);

        if (!isConnected) {
            console.log('❌ API is not available. Check your network connection and API server.');
            return;
        }

        // Test data integration initialization
        await dataIntegration.initializeAppData();
        console.log('✅ Data integration initialized');

        // Test cache
        const cache = await unifiedCache.getCache();
        console.log(`✅ Cache status: ${cache.user_data ? 'Has user data' : 'No user data'}`);

        console.log('⚡ Quick test completed successfully!');

    } catch (error) {
        console.error('❌ Quick test failed:', error);
    }
}

/**
 * Debug helper to log data structures
 */
export function logDataStructures(): void {
    console.log('📊 API Data Structures:');
    console.log('=======================');

    console.log('👤 UserData interface:');
    console.log(JSON.stringify(TEST_USER_DATA, null, 2));

    console.log('\n📋 PersonalPlan interface:');
    console.log(JSON.stringify(TEST_PERSONAL_PLAN, null, 2));

    console.log('\n🍎 Expected NutritionEstimation structure:');
    console.log({
        makanan_teridentifikasi: "string",
        estimasi_berat: "string (e.g., '100 gram')",
        informasi_nutrisi: {
            kalori: "number",
            karbohidrat: "number",
            protein: "number",
            lemak: "number",
            serat: "number",
            gula: "number",
            natrium: "number"
        },
        vitamin_mineral: "any",
        catatan: "string"
    });

    console.log('\n🏷️ Expected NutritionLabelResponse structure:');
    console.log({
        nama_produk: "string",
        berat_per_sajian: "number",
        informasi_gizi: {
            energi_total: "number",
            lemak_total: "number",
            lemak_jenuh: "number",
            protein: "number",
            karbohidrat_total: "number",
            gula: "number",
            serat_pangan: "number",
            natrium: "number"
        },
        catatan: "string (optional)"
    });
}
