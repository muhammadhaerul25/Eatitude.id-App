/**
 * Test Script for Individual Meal Plan API Integration
 * 
 * This script tests the individual meal plan API integration functionality
 * including individual meal generation and caching logic.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { individualMealPlanService } from '../services/individualMealPlanAPI';

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
 * Test Suite for Individual Meal Plan API Integration
 */
class IndividualMealPlanAPITester {

    /**
     * Test basic individual meal generation
     */
    async testBasicIndividualMealGeneration() {
        console.log('🧪 Testing basic individual meal generation...');

        try {
            const request = {
                meal_type: 'sarapan' as const,
                preference: 'Makanan Indonesia',
                budget: 'sedang' as const
            };

            const result = await individualMealPlanService.generateIndividualMealPlan(request);

            if (result && result.deskripsi_rekomendasi_menu) {
                console.log('✅ Basic individual meal generation successful');
                console.log('📋 Generated meal plan structure:');
                console.log(`  ✅ Meal Type: ${result.meal_type}`);
                console.log(`  ✅ Time Range: ${result.range_waktu}`);
                console.log(`  ✅ Description: ${result.deskripsi_rekomendasi_menu}`);
                console.log(`  ✅ Menu Options: ${result.list_pilihan_menu.length} options`);
                console.log(`  ✅ Target Calories: ${result['target_kalori_(kcal)']} kcal`);

                return true;
            } else {
                console.log('❌ Basic individual meal generation failed: No menu recommendation returned');
                return false;
            }
        } catch (error) {
            console.log('❌ Error in basic individual meal generation:', error);
            return false;
        }
    }

    /**
     * Test meal conversion to UI format
     */
    async testMealConversion() {
        console.log('\n🧪 Testing meal conversion to UI format...');

        try {
            const request = {
                meal_type: 'makan_siang' as const,
                preference: 'Makanan Indonesia',
                budget: 'tinggi' as const
            };

            const mealPlan = await individualMealPlanService.generateIndividualMealPlan(request);

            if (mealPlan) {
                const mealItem = individualMealPlanService.convertToMealItem(mealPlan);

                console.log('✅ Meal conversion successful');
                console.log('📱 Converted meal item structure:');
                console.log(`  ✅ ID: ${mealItem.id}`);
                console.log(`  ✅ Type: ${mealItem.type}`);
                console.log(`  ✅ Time Range: ${mealItem.timeRange}`);
                console.log(`  ✅ Description: ${mealItem.description}`);
                console.log(`  ✅ Target Calories: ${mealItem.targetCalories} kcal`);
                console.log(`  ✅ Menu Options: ${mealItem.menuOptions.length} options`);

                return true;
            } else {
                console.log('❌ Failed to generate meal plan for conversion test');
                return false;
            }
        } catch (error) {
            console.log('❌ Error in meal conversion test:', error);
            return false;
        }
    }

    /**
     * Test individual meal storage and retrieval
     */
    async testMealStorage() {
        console.log('\n🧪 Testing individual meal storage and retrieval...');

        try {
            // Clear existing data
            await AsyncStorage.clear();

            const testDate = new Date();

            // First check - should be empty
            console.log('📅 First check - should have no meals...');
            const initialMeals = await individualMealPlanService.getIndividualMealsForDate(testDate);

            if (initialMeals.length === 0) {
                console.log('✅ Initial state correct (no meals)');
            } else {
                console.log('❌ Initial state incorrect (found meals when should be empty)');
                return false;
            }

            // Generate and save a meal
            console.log('📅 Generating and saving a meal...');
            const request = {
                meal_type: 'sarapan' as const,
                preference: 'Makanan Indonesia',
                budget: 'sedang' as const
            };

            const mealPlan = await individualMealPlanService.generateIndividualMealPlan(request);
            if (mealPlan) {
                const mealItem = individualMealPlanService.convertToMealItem(mealPlan);
                await individualMealPlanService.saveIndividualMeal(mealItem, testDate);

                console.log('✅ Meal saved successfully');
            } else {
                console.log('❌ Failed to generate meal for storage test');
                return false;
            }

            // Retrieve saved meals
            console.log('� Retrieving saved meals...');
            const savedMeals = await individualMealPlanService.getIndividualMealsForDate(testDate);

            if (savedMeals.length === 1 && savedMeals[0].type === 'sarapan') {
                console.log('✅ Meal retrieval successful');
                console.log(`   Found: ${savedMeals[0].type} - ${savedMeals[0].description}`);
                return true;
            } else {
                console.log('❌ Meal retrieval failed');
                return false;
            }
        } catch (error) {
            console.log('❌ Error in meal storage test:', error);
            return false;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🚀 Starting Individual Meal Plan API Integration Tests\n');

        const tests = [
            { name: 'Basic Individual Meal Generation', test: () => this.testBasicIndividualMealGeneration() },
            { name: 'Meal Conversion', test: () => this.testMealConversion() },
            { name: 'Meal Storage', test: () => this.testMealStorage() },
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
            console.log('🎉 All tests passed! Individual Meal Plan API integration is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please check the implementation.');
        }

        return passedTests === tests.length;
    }
}

// Export for use in testing
export const mealPlanTester = new IndividualMealPlanAPITester();

// Example usage
export async function runMealPlanTests() {
    return await mealPlanTester.runAllTests();
}

// For debugging individual components
export {
    IndividualMealPlanAPITester, testPersonalPlan, testUserData
};

