import { appInitService } from '../services/appInitializationService';
import { dataIntegration } from '../services/dataIntegrationService';
import { unifiedCache } from '../services/unifiedCacheService';

/**
 * Comprehensive testing script for the complete app flow
 */
export class AppFlowTester {
    static async testCompleteFlow(): Promise<void> {
        console.log('🔥 Starting comprehensive app flow test...\n');

        try {
            // Step 1: Test app initialization
            console.log('Step 1: Testing app initialization...');
            const initResult = await appInitService.initializeApp();
            console.log('✅ App initialization result:', initResult);

            // Step 2: Test cache operations
            console.log('\nStep 2: Testing cache operations...');
            const cache = await unifiedCache.getCache();
            console.log('✅ Cache retrieved successfully:', {
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                hasDailyCache: Object.keys(cache.daily_cache).length > 0
            });

            // Step 3: Test today's progress data
            console.log('\nStep 3: Testing progress data...');
            const today = new Date();
            const todayCache = await unifiedCache.getDayCache(today);
            console.log('✅ Today\'s cache structure:', {
                mealPlanExists: Object.keys(todayCache.meal_plan).length > 0,
                progressTracking: {
                    calories: `${todayCache.progress.calories_eaten}/${todayCache.progress.calories_target}`,
                    macros: todayCache.progress.macros_eaten,
                    water: `${Math.floor(todayCache.progress.water_intake_ml / 250)}/${Math.ceil((cache.personal_plan?.kebutuhan_cairan?.["air_per_hari_(gelas)"] || 2500) / 250)}ml`
                },
                loggedMeals: Object.keys(todayCache.meal_plan || {}).length,
                scannedFoods: todayCache.scanned_foods.length
            });

            // Step 4: Test data integration capabilities
            console.log('\nStep 4: Testing data integration...');
            await dataIntegration.initializeAppData();
            console.log('✅ Data integration initialized successfully');

            // Step 5: Test validation
            console.log('\nStep 5: Testing data validation...');
            const validationResults = await this.validateDataIntegrity();
            console.log('✅ Data validation results:', validationResults);

            console.log('\n🎉 Complete app flow test passed successfully!');
            return;

        } catch (error) {
            console.error('❌ App flow test failed:', error);
            throw error;
        }
    }

    static async validateDataIntegrity(): Promise<{
        cacheIntegrity: boolean;
        progressCalculation: boolean;
        mealPlanIntegration: boolean;
        dataFlow: boolean;
    }> {
        const cache = await unifiedCache.getCache();
        const today = new Date().toISOString().split('T')[0];
        const dayCache = cache.daily_cache[today];

        return {
            cacheIntegrity: !!cache && typeof cache === 'object',
            progressCalculation: !!dayCache?.progress && typeof dayCache.progress.calories_eaten === 'number',
            mealPlanIntegration: !!dayCache?.meal_plan && typeof dayCache.meal_plan === 'object',
            dataFlow: !!cache.user_data || !!cache.personal_plan
        };
    }

    static async testProgressTracking(): Promise<void> {
        console.log('🧪 Testing progress tracking...');

        try {
            const today = new Date();

            // Test adding a mock meal to see if progress updates
            await unifiedCache.logMeal(today, 'breakfast', 300, {
                protein: 20,
                carbs: 40,
                fat: 10,
                fiber: 5,
                sugar: 5,
                sodium: 200
            });

            const updatedCache = await unifiedCache.getDayCache(today);
            console.log('✅ Progress after test meal:', {
                calories: updatedCache.progress.calories_eaten,
                protein: updatedCache.progress.macros_eaten.protein,
                carbs: updatedCache.progress.macros_eaten.carbs
            });

        } catch (error) {
            console.error('❌ Progress tracking test failed:', error);
        }
    }

    static async testOnboardingFlow(): Promise<void> {
        console.log('👋 Testing onboarding flow...');

        try {
            // Check if user needs onboarding
            const isComplete = await appInitService.checkOnboardingComplete();
            console.log('Onboarding status:', isComplete ? 'Complete' : 'Needs onboarding');

            if (!isComplete) {
                console.log('User should be shown onboarding flow');
            } else {
                console.log('User can proceed to main app');
            }

        } catch (error) {
            console.error('❌ Onboarding flow test failed:', error);
        }
    }
}

// Export for use in debug screens
export default AppFlowTester;
