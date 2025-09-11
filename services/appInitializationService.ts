import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataIntegration } from './dataIntegrationService';
import { demoDataService } from './demoDataService';
import { unifiedCache } from './unifiedCacheService';

export interface AppInitializationResult {
    success: boolean;
    isFirstLaunch: boolean;
    isDemoMode: boolean;
    hasUserData: boolean;
    needsOnboarding: boolean;
    error?: string;
}

class AppInitializationService {
    private initialized = false;

    /**
     * Complete app initialization process
     */
    public async initializeApp(): Promise<AppInitializationResult> {
        try {
            console.log('🚀 AppInit: Starting app initialization process');

            // Step 1: Initialize unified cache and data integration
            await dataIntegration.initializeAppData();

            // Step 2: Check current app state
            const cache = await unifiedCache.getCache();
            const hasOnboardingProfile = await this.checkOnboardingComplete();

            const isFirstLaunch = !cache.user_data && !cache.personal_plan && !hasOnboardingProfile;
            const needsOnboarding = !hasOnboardingProfile && (!cache.user_data || !cache.personal_plan);

            console.log('🔍 AppInit: App state check:', {
                hasOnboardingProfile,
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                isFirstLaunch,
                needsOnboarding
            });

            // Step 3: Validate data integrity if user data exists
            if (cache.user_data && cache.personal_plan) {
                await this.validateDataIntegrity();
                await this.syncProgressTargets();
            }

            // Step 4: Check demo mode
            let isDemoMode = false;
            const demoStatus = await demoDataService.getDemoStatus();
            isDemoMode = demoStatus.isDemoMode;

            // Step 5: Generate today's meal plan if user data exists
            if (cache.user_data && cache.personal_plan) {
                console.log('🍽️ AppInit: Ensuring today\'s meal plan is available');
                const today = new Date();
                const dayCache = await unifiedCache.getDayCache(today);

                if (Object.keys(dayCache.meal_plan).length === 0) {
                    console.log('🆕 AppInit: Generating meal plan for today');
                    // This will be handled by the meal planner hook automatically
                }
            }

            console.log('✅ AppInit: App initialization completed successfully', {
                hasOnboardingProfile,
                isFirstLaunch,
                isDemoMode,
                needsOnboarding
            });

            this.initialized = true;

            return {
                success: true,
                isFirstLaunch,
                isDemoMode,
                hasUserData: !!cache.user_data,
                needsOnboarding
            };

        } catch (error) {
            console.error('❌ AppInit: Failed to initialize app:', error);

            // Try fallback initialization
            return await this.fallbackInitialization();
        }
    }

    /**
     * Validate data integrity across all services
     */
    private async validateDataIntegrity(): Promise<void> {
        try {
            console.log('🔍 AppInit: Validating data integrity');

            const cache = await unifiedCache.getCache();

            // Check for inconsistencies in user data
            if (cache.user_data) {
                const requiredFields = ['nama', 'usia', 'jenis_kelamin', 'berat_badan', 'tinggi_badan', 'tujuan'];
                const missingFields = requiredFields.filter(field => !cache.user_data![field as keyof typeof cache.user_data]);

                if (missingFields.length > 0) {
                    console.warn('⚠️ Missing required user data fields:', missingFields);
                }
            }

            console.log('✅ Data integrity validation completed');

        } catch (error) {
            console.error('❌ Data integrity validation failed:', error);
        }
    }

    /**
     * Sync progress targets with personal plan
     */
    private async syncProgressTargets(): Promise<void> {
        try {
            console.log('🔄 AppInit: Syncing progress targets with personal plan');

            const cache = await unifiedCache.getCache();
            const today = new Date().toISOString().split('T')[0];

            if (cache.personal_plan && cache.daily_cache[today]) {
                const dayCache = cache.daily_cache[today];

                // Update calorie target
                const targetCalories = cache.personal_plan.kebutuhan_kalori?.["total_kalori_per_hari_(kcal)"];
                if (targetCalories && dayCache.progress.calories_target !== targetCalories) {
                    dayCache.progress.calories_target = targetCalories;

                    // Update macro targets
                    if (cache.personal_plan.kebutuhan_makronutrisi) {
                        dayCache.progress.macros_target = {
                            protein: cache.personal_plan.kebutuhan_makronutrisi["protein_per_hari_(g)"] || 150,
                            carbs: cache.personal_plan.kebutuhan_makronutrisi["karbohidrat_per_hari_(g)"] || 250,
                            fat: cache.personal_plan.kebutuhan_makronutrisi["lemak_per_hari_(g)"] || 67,
                            fiber: cache.personal_plan.kebutuhan_makronutrisi["serat_per_hari_(g)"] || 25,
                        };
                    }

                    // Update water target
                    if (cache.personal_plan.kebutuhan_cairan) {
                        dayCache.progress.water_target_ml =
                            (cache.personal_plan.kebutuhan_cairan["air_per_hari_(gelas)"] || 10) * 250;
                    }

                    console.log('✅ Progress targets synced with personal plan');
                }
            }

        } catch (error) {
            console.error('❌ Failed to sync progress targets:', error);
        }
    }

    /**
     * Fallback initialization when main initialization fails
     */
    private async fallbackInitialization(): Promise<AppInitializationResult> {
        try {
            console.log('🆘 AppInit: Attempting fallback initialization');

            // Try minimal initialization
            await unifiedCache.initializeCache();

            // Check what data we have
            const cache = await unifiedCache.getCache();
            const hasUserData = !!cache.user_data;
            const needsOnboarding = !hasUserData || !cache.personal_plan;

            console.log('✅ Fallback initialization completed');

            return {
                success: true,
                isFirstLaunch: false,
                isDemoMode: false,
                hasUserData,
                needsOnboarding
            };

        } catch (error) {
            console.error('❌ Fallback initialization failed:', error);
            return {
                success: false,
                isFirstLaunch: true,
                isDemoMode: false,
                hasUserData: false,
                needsOnboarding: true,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Check if user has completed the onboarding flow
     */
    public async checkOnboardingComplete(): Promise<boolean> {
        try {
            const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
            const userProfile = await AsyncStorage.getItem('userProfile');

            return hasCompletedOnboarding === 'true' && !!userProfile;
        } catch (error) {
            console.error('❌ AppInit: Failed to check onboarding status:', error);
            return false;
        }
    }

    /**
     * Mark onboarding as complete
     */
    public async markOnboardingComplete(): Promise<void> {
        try {
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            console.log('✅ AppInit: Onboarding marked as complete');
        } catch (error) {
            console.error('❌ AppInit: Failed to mark onboarding as complete:', error);
        }
    }

    /**
     * Check if app is properly initialized
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Force re-initialization
     */
    public async reinitialize(): Promise<AppInitializationResult> {
        this.initialized = false;
        return await this.initializeApp();
    }
}

export const appInitService = new AppInitializationService();
