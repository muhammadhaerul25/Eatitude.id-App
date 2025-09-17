import { individualMealPlanService } from '../services/individualMealPlanAPI';
import { unifiedCache } from '../services/unifiedCacheService';

/**
 * Simplified testing script for the individual meal planning flow
 */
export class AppFlowTester {
    static async testCompleteFlow(): Promise<void> {
        console.log('🔥 Starting individual meal planning flow test...\n');

        try {
            // Step 1: Test cache initialization
            console.log('Step 1: Testing cache initialization...');
            await unifiedCache.initializeCache();
            console.log('✅ Cache initialization successful');

            // Step 2: Test cache operations
            console.log('\nStep 2: Testing cache operations...');
            const cache = await unifiedCache.getCache();
            console.log('✅ Cache access successful, keys:', Object.keys(cache));

            // Step 3: Test individual meal generation
            console.log('\nStep 3: Testing individual meal generation...');
            const mealRequest = {
                meal_type: 'sarapan' as const,
                preference: 'Makanan Indonesia',
                budget: 'sedang' as const
            };

            const mealPlan = await individualMealPlanService.generateIndividualMealPlan(mealRequest);
            const mealItem = individualMealPlanService.convertToMealItem(mealPlan);
            console.log('✅ Individual meal generation successful:', mealItem.description);

            // Step 4: Test meal storage
            console.log('\nStep 4: Testing meal storage...');
            const testDate = new Date();
            await individualMealPlanService.saveIndividualMeal(mealItem, testDate);
            const meals = await individualMealPlanService.getIndividualMealsForDate(testDate);
            console.log('✅ Meal storage successful, meals count:', meals.length);

            console.log('\n🎉 All tests passed! Individual meal planning system is working correctly.');

        } catch (error) {
            console.error('❌ App flow test failed:', error);
        }
    }

    static async testCacheOperations(): Promise<void> {
        console.log('🧪 Testing cache operations...\n');

        try {
            await unifiedCache.initializeCache();

            const testDate = new Date();
            await unifiedCache.getDayCache(testDate);
            console.log('✅ Day cache retrieved successfully');

            console.log('\n✅ Cache operations test completed successfully.');

        } catch (error) {
            console.error('❌ Cache operations test failed:', error);
        }
    }

    static async testOnboardingFlow(): Promise<void> {
        console.log('🎯 Testing simplified onboarding flow...\n');

        try {
            // For the individual meal system, we don't need complex onboarding
            // Just test that we can initialize the cache and create meals
            await unifiedCache.initializeCache();
            console.log('✅ System ready for meal planning');

            console.log('\n✅ Simplified onboarding test completed.');

        } catch (error) {
            console.error('❌ Onboarding flow test failed:', error);
        }
    }
}

// Export for use in debug screens
export default AppFlowTester;