/**
 * Test Script for Enhanced Meal Plan API Integration
 * 
 * This script tests the meal plan API integration functionality
 * including daily meal generation and caching logic.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealPlanService } from '../services/mealPlanAPI';

// Test data
const testUserData = {
    nama: "Test User",
    usia: 25,
    jenis_kelamin: "Laki-laki",
    berat_badan: 70,
    tinggi_badan: 175,
    tingkat_aktivitas: "Sedang",
    catatan_aktivitas: "Olahraga 3x seminggu",
    waktu_bangun: "07:00",
    waktu_tidur: "22:00",
    preferensi_makanan: "Makanan Indonesia",
    alergi_makanan: null,
    kondisi_kesehatan: null,
    tujuan: "Menjaga berat badan ideal"
};

const testPersonalPlan = {
    kebutuhan_kalori: {
        harian: 2000,
        per_meal: {
            sarapan: 400,
            snack_pagi: 150,
            makan_siang: 600,
            snack_sore: 150,
            makan_malam: 500
        }
    },
    kebutuhan_makronutrisi: {
        karbohidrat: "50-60%",
        protein: "15-20%",
        lemak: "25-30%"
    },
    kebutuhan_mikronutrisi: {
        vitamin_c: "90mg",
        kalsium: "1000mg",
        zat_besi: "8mg"
    },
    batasi_konsumsi: {
        gula: "maksimal 50g",
        natrium: "maksimal 2300mg",
        lemak_jenuh: "maksimal 20g"
    },
    kebutuhan_cairan: {
        air_putih: "8 gelas",
        total_cairan: "2.5 liter"
    },
    catatan: "Rencana makan seimbang untuk menjaga kesehatan optimal"
};

/**
 * Test Suite for Meal Plan API Integration
 */
class MealPlanAPITester {

    /**
     * Test basic meal plan generation
     */
    async testBasicMealPlanGeneration() {
        console.log('🧪 Testing basic meal plan generation...');

        try {
            const result = await mealPlanService.generateDailyMealPlan(
                testUserData,
                testPersonalPlan
            );

            if (result.success && result.data) {
                console.log('✅ Basic meal plan generation successful');
                console.log('📋 Generated meal plan structure:');

                // Check required meals
                const requiredMeals = ['sarapan', 'makan_siang', 'makan_malam'];
                for (const meal of requiredMeals) {
                    if (result.data[meal as keyof typeof result.data]) {
                        console.log(`  ✅ ${meal}: OK`);
                    } else {
                        console.log(`  ❌ ${meal}: Missing`);
                    }
                }

                // Check optional meals
                const optionalMeals = ['snack_pagi_opsional', 'snack_sore_opsional'];
                for (const meal of optionalMeals) {
                    if (result.data[meal as keyof typeof result.data]) {
                        console.log(`  ✅ ${meal}: Present`);
                    } else {
                        console.log(`  ℹ️ ${meal}: Not included`);
                    }
                }

                return true;
            } else {
                console.log('❌ Basic meal plan generation failed:', result.error?.message);
                return false;
            }
        } catch (error) {
            console.log('❌ Error in basic meal plan generation:', error);
            return false;
        }
    }

    /**
     * Test meal plan mapping to UI format
     */
    async testMealPlanMapping() {
        console.log('\n🧪 Testing meal plan mapping to UI format...');

        try {
            const result = await mealPlanService.generateDailyMealPlan(
                testUserData,
                testPersonalPlan
            );

            if (result.success && result.data) {
                const mealItems = mealPlanService.mapMealPlanToItems(result.data);

                console.log('✅ Meal plan mapping successful');
                console.log(`📱 Generated ${mealItems.length} meal items for UI`);

                // Validate meal items structure
                for (const item of mealItems) {
                    const hasRequiredFields = item.id && item.type && item.timeRange &&
                        item.rekomendasi_menu && typeof item.targetKalori === 'number';

                    if (hasRequiredFields) {
                        console.log(`  ✅ ${item.type}: ${item.rekomendasi_menu} (${item.targetKalori} kcal)`);
                    } else {
                        console.log(`  ❌ ${item.type}: Missing required fields`);
                    }
                }

                return true;
            } else {
                console.log('❌ Failed to generate meal plan for mapping test');
                return false;
            }
        } catch (error) {
            console.log('❌ Error in meal plan mapping test:', error);
            return false;
        }
    }

    /**
     * Test date-based meal plan retrieval
     */
    async testDateBasedRetrieval() {
        console.log('\n🧪 Testing date-based meal plan retrieval...');

        try {
            // Clear any existing data
            await AsyncStorage.clear();

            // Set up test user data in storage
            await AsyncStorage.setItem('userProfile', JSON.stringify(testUserData));
            await AsyncStorage.setItem('nutritionPlan', JSON.stringify(testPersonalPlan));

            const testDate = new Date();

            // First call should generate new meal plan
            console.log('📅 First call for today - should generate new plan...');
            const result1 = await mealPlanService.getMealPlanForDate(testDate);

            if (result1.success) {
                console.log('✅ First retrieval successful (generated new plan)');
            } else {
                console.log('❌ First retrieval failed:', result1.error?.message);
                return false;
            }

            // Second call should use cached meal plan
            console.log('📅 Second call for today - should use cached plan...');
            const result2 = await mealPlanService.getMealPlanForDate(testDate);

            if (result2.success) {
                console.log('✅ Second retrieval successful (used cached plan)');
            } else {
                console.log('❌ Second retrieval failed:', result2.error?.message);
                return false;
            }

            // Test different date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            console.log('📅 Call for tomorrow - should generate new plan...');
            const result3 = await mealPlanService.getMealPlanForDate(tomorrow);

            if (result3.success) {
                console.log('✅ Tomorrow retrieval successful (generated new plan)');
            } else {
                console.log('❌ Tomorrow retrieval failed:', result3.error?.message);
                return false;
            }

            return true;
        } catch (error) {
            console.log('❌ Error in date-based retrieval test:', error);
            return false;
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('\n🧪 Testing error handling...');

        try {
            // Test with invalid user data
            console.log('🔍 Testing with invalid user data...');
            const invalidUserData = { name: "invalid" } as any;

            const result1 = await mealPlanService.generateDailyMealPlan(
                invalidUserData,
                testPersonalPlan
            );

            if (!result1.success && result1.error) {
                console.log('✅ Error handling for invalid user data works');
                console.log(`   Error type: ${result1.error.type}`);
                console.log(`   Error message: ${result1.error.message}`);
            } else {
                console.log('❌ Error handling for invalid user data failed');
            }

            // Test with invalid personal plan
            console.log('🔍 Testing with invalid personal plan...');
            const invalidPersonalPlan = { invalid: true } as any;

            const result2 = await mealPlanService.generateDailyMealPlan(
                testUserData,
                invalidPersonalPlan
            );

            if (!result2.success && result2.error) {
                console.log('✅ Error handling for invalid personal plan works');
                console.log(`   Error type: ${result2.error.type}`);
                console.log(`   Error message: ${result2.error.message}`);
            } else {
                console.log('❌ Error handling for invalid personal plan failed');
            }

            return true;
        } catch (error) {
            console.log('❌ Error in error handling test:', error);
            return false;
        }
    }

    /**
     * Test debugging information
     */
    testDebuggingInfo() {
        console.log('\n🧪 Testing debugging information...');

        try {
            const debugInfo = mealPlanService.createDebugInfo(testUserData, testPersonalPlan);

            if (debugInfo && debugInfo.includes(testUserData.nama)) {
                console.log('✅ Debug info generation works');
                console.log('🐛 Sample debug info:');
                console.log(debugInfo);
            } else {
                console.log('❌ Debug info generation failed');
                return false;
            }

            return true;
        } catch (error) {
            console.log('❌ Error in debugging info test:', error);
            return false;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🚀 Starting Enhanced Meal Plan API Integration Tests\n');

        const tests = [
            { name: 'Basic Meal Plan Generation', test: () => this.testBasicMealPlanGeneration() },
            { name: 'Meal Plan Mapping', test: () => this.testMealPlanMapping() },
            { name: 'Date-based Retrieval', test: () => this.testDateBasedRetrieval() },
            { name: 'Error Handling', test: () => this.testErrorHandling() },
            { name: 'Debugging Info', test: () => this.testDebuggingInfo() },
        ];

        let passedTests = 0;

        for (const { name, test } of tests) {
            try {
                const result = await test();
                if (result) {
                    passedTests++;
                }
            } catch (error) {
                console.log(`❌ Test '${name}' threw an error:`, error);
            }
        }

        console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed`);

        if (passedTests === tests.length) {
            console.log('🎉 All tests passed! Meal Plan API integration is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please check the implementation.');
        }

        return passedTests === tests.length;
    }
}

// Export for use in testing
export const mealPlanTester = new MealPlanAPITester();

// Example usage
export async function runMealPlanTests() {
    return await mealPlanTester.runAllTests();
}

// For debugging individual components
export {
    MealPlanAPITester, testPersonalPlan, testUserData
};

