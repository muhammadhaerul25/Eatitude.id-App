/**
 * Enhanced Meal Plan API Service with Unified Cache Integration
 * 
 * This service provides comprehensive meal planning functionality including:
 * - Daily meal plan generation with FastAPI backend
 * - Automatic meal plan refresh for new days
 * - Unified cache integration for improved data management
 * - Type-safe API integration
 * - Error handling and validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../hooks/onboardingTypes';
import { apiService, PersonalPlan, UserData } from './api';
import { mapNutritionPlanToPersonalPlan, mapUserProfileToApiData } from './dataMapper';
import { CachedMeal, unifiedCache } from './unifiedCacheService';

// TypeScript interfaces for meal plan data structures

/**
 * Individual meal in a daily meal plan
 */
export interface MealPlanMeal {
    range_waktu: string;                    // Time range (e.g., "07.00–08.00")
    deskripsi_rekomendasi_menu: string;     // Description of meal recommendation
    list_pilihan_menu: string[];           // List of menu options
    asupan_cairan_air_gelas: number;       // Water intake in glasses
    target_kalori_kcal: number;            // Target calories
}

/**
 * Complete daily meal plan response from API
 */
export interface DailyMealPlan {
    sarapan: MealPlanMeal;
    snack_pagi_opsional?: MealPlanMeal;
    makan_siang: MealPlanMeal;
    snack_sore_opsional?: MealPlanMeal;
    makan_malam: MealPlanMeal;
}

/**
 * Request body for meal plan generation API
 */
export interface MealPlanRequest {
    user_data: UserData;
    personal_plan: PersonalPlan;
}

/**
 * Response from meal plan generation API
 */
export interface MealPlanResponse {
    meal_plan: DailyMealPlan;
}

/**
 * Categorized error types for better error handling
 */
export interface MealPlanServiceError {
    type: 'network' | 'api' | 'validation' | 'storage' | 'unknown';
    message: string;
    details?: any;
}

/**
 * Service response structure
 */
export interface MealPlanServiceResult {
    success: boolean;
    data?: DailyMealPlan;
    error?: MealPlanServiceError;
}

/**
 * Enhanced Meal Plan Service Class
 */
export class MealPlanService {
    // Legacy storage keys for migration
    private static readonly USER_PROFILE_KEY = 'userProfile';
    private static readonly NUTRITION_PLAN_KEY = 'nutritionPlan';
    private static readonly MEAL_PLAN_PREFIX = 'mealPlan_';
    private static readonly LAST_LOGIN_KEY = 'last_login_date';

    /**
     * Generate daily meal plan using user data and personal plan
     * 
     * @param userData - User's personal information and preferences
     * @param personalPlan - User's personalized nutrition plan
     * @returns Promise with meal plan data or error information
     */
    async generateDailyMealPlan(
        userData: UserData,
        personalPlan: PersonalPlan
    ): Promise<MealPlanServiceResult> {
        try {
            console.log('🍽️ MealPlanService: Generating daily meal plan');
            console.log(`👤 User: ${userData.nama}, Goal: ${userData.tujuan}`);

            // Validate inputs
            this.validateInputs(userData, personalPlan);

            // Prepare request body matching exact API specification
            const requestBody: MealPlanRequest = {
                user_data: userData,
                personal_plan: personalPlan,
            };

            // Make API call using existing apiService
            const response = await apiService.generateMealPlan(
                requestBody.user_data,
                requestBody.personal_plan
            );

            console.log('🍽️ Raw API response for meal plan:', JSON.stringify(response, null, 2));
            console.log('✅ MealPlanService: Daily meal plan generated successfully');

            return {
                success: true,
                data: response as DailyMealPlan
            };

        } catch (error) {
            console.error('❌ MealPlanService: Failed to generate meal plan:', error);

            const serviceError = this.handleError(error);

            return {
                success: false,
                error: serviceError
            };
        }
    }

    /**
     * Get or generate meal plan for a specific date
     * Automatically generates new plan if it's a new day or no plan exists
     * Now integrated with unified cache system
     * 
     * @param date - Date for which to get/generate meal plan
     * @returns Promise with meal plan data
     */
    async getMealPlanForDate(date: Date): Promise<MealPlanServiceResult> {
        try {
            console.log(`🍽️ MealPlanService: Getting meal plan for ${date.toISOString().split('T')[0]}`);

            // Initialize unified cache
            await unifiedCache.initializeCache();

            // Check if meal plan exists in unified cache
            const dayCache = await unifiedCache.getDayCache(date);
            const mealPlanKeys = Object.keys(dayCache.meal_plan);

            if (mealPlanKeys.length > 0) {
                console.log(`✅ Found existing meal plan with ${mealPlanKeys.length} meals`);
                return {
                    success: true,
                    data: this.convertCachedMealsToAPI(dayCache.meal_plan)
                };
            }

            // Check if we need to generate a new meal plan
            const shouldGenerateNew = await this.shouldGenerateNewMealPlan(date);

            if (shouldGenerateNew) {
                console.log(`🆕 Generating new meal plan for ${date.toISOString().split('T')[0]}`);

                // Load user data and personal plan
                const userData = await this.loadUserData();
                const personalPlan = await this.loadPersonalPlan();

                console.log('🔍 MealPlanService: Loaded data for generation:', {
                    userData: userData ? { name: userData.nama, age: userData.usia } : null,
                    personalPlan: personalPlan ? { calories: personalPlan.kebutuhan_kalori?.total_harian } : null
                });

                if (!userData) {
                    throw new Error('User profile not found. Please complete your profile setup in the onboarding process first.');
                }

                if (!personalPlan) {
                    throw new Error('Personal nutrition plan not found. Please complete the onboarding process to generate your nutrition plan first.');
                }

                // Generate new meal plan
                const result = await this.generateDailyMealPlan(userData, personalPlan);

                if (result.success && result.data) {
                    // Convert API response to cached format and save
                    const cachedMeals = this.convertAPIMealsToCached(result.data);
                    await unifiedCache.updateMealPlan(date, cachedMeals);

                    // Update last login date
                    await this.updateLastLoginDate(new Date());

                    console.log('✅ New meal plan generated and cached');
                } else {
                    // Fallback to default meal plan if generation fails
                    console.log('⚠️ Meal plan generation failed, using default plan');
                    const defaultPlan = this.getDefaultMealPlan();
                    const cachedMeals = this.convertAPIMealsToCached(defaultPlan);
                    await unifiedCache.updateMealPlan(date, cachedMeals);

                    return {
                        success: true,
                        data: defaultPlan,
                        error: {
                            type: 'api',
                            message: 'Used default meal plan due to generation failure'
                        }
                    };
                }

                return result;
            }

            // Return default meal plan if no generation needed
            console.log('📋 Using default meal plan');
            const defaultPlan = this.getDefaultMealPlan();
            const cachedMeals = this.convertAPIMealsToCached(defaultPlan);
            await unifiedCache.updateMealPlan(date, cachedMeals);

            return {
                success: true,
                data: defaultPlan
            };

        } catch (error) {
            console.error('❌ Error getting meal plan for date:', error);
            return {
                success: false,
                error: this.handleError(error)
            };
        }
    }

    /**
     * Check if a new meal plan should be generated
     * Uses unified cache for improved day detection
     */
    private async shouldGenerateNewMealPlan(targetDate: Date): Promise<boolean> {
        try {
            // Check if it's a new day using unified cache
            const isNewDay = await unifiedCache.checkNewDay();
            const today = new Date().toISOString().split('T')[0];
            const targetDateStr = targetDate.toISOString().split('T')[0];

            // Always generate for today if it's a new day
            if (targetDateStr === today && isNewDay) {
                console.log('🆕 New day detected - will generate meal plan');
                return true;
            }

            // Check if meal plan already exists for the target date in unified cache
            const dayCache = await unifiedCache.getDayCache(targetDate);
            const mealPlanKeys = Object.keys(dayCache.meal_plan);

            if (mealPlanKeys.length === 0) {
                console.log(`🆕 No meal plan found for ${targetDateStr} - will generate`);
                return true;
            }

            console.log(`✅ Meal plan exists for ${targetDateStr} with ${mealPlanKeys.length} meals - no generation needed`);
            return false;

        } catch (error) {
            console.error('❌ Error checking if new meal plan needed:', error);
            // Default to generating new plan on error
            return true;
        }
    }

    /**
     * Update last login date in unified cache
     */
    private async updateLastLoginDate(date: Date): Promise<void> {
        try {
            // The unified cache automatically updates last_login when we use checkNewDay()
            // So this method now just ensures the cache is updated
            await unifiedCache.checkNewDay();
            console.log('✅ Last login date updated in unified cache');
        } catch (error) {
            console.error('❌ Error updating last login date:', error);
        }
    }

    /**
     * Load user data from unified cache with fallback to legacy storage
     */
    private async loadUserData(): Promise<UserData | null> {
        try {
            console.log('📊 MealPlanService: Loading user data from unified cache');
            const cache = await unifiedCache.getCache();

            if (cache.user_data) {
                // Check if it's already in the correct API format (UserData)
                if ('nama' in cache.user_data && 'usia' in cache.user_data) {
                    console.log(`✅ Found API-formatted user data: ${cache.user_data.nama}, ${cache.user_data.usia} years old`);
                    return cache.user_data as UserData;
                }

                // If it's in UserProfile format, convert it
                if ('name' in cache.user_data && 'age' in cache.user_data) {
                    const userProfile = cache.user_data as any;
                    console.log(`🔄 Converting UserProfile to API format: ${userProfile.name}, ${userProfile.age} years old`);
                    const userData = mapUserProfileToApiData(userProfile as UserProfile);
                    console.log(`✅ Converted user data:`, userData);
                    return userData;
                }
            }

            // Fallback: try legacy storage
            console.log('⚠️ No user data in unified cache, trying legacy storage...');
            const profileData = await AsyncStorage.getItem(MealPlanService.USER_PROFILE_KEY);
            if (profileData) {
                const userProfile = JSON.parse(profileData) as UserProfile;
                console.log(`✅ Found user profile in legacy storage: ${userProfile.nama}`);

                // Convert to API format
                const userData = mapUserProfileToApiData(userProfile);
                console.log(`🔄 Converted legacy data to API format:`, userData);
                return userData;
            }

            console.log('❌ No user data found in any storage');
            return null;
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            return null;
        }
    }

    /**
     * Load personal plan from unified cache with fallback to legacy storage
     */
    private async loadPersonalPlan(): Promise<PersonalPlan | null> {
        try {
            console.log('📋 MealPlanService: Loading personal plan from unified cache');
            const cache = await unifiedCache.getCache();

            if (cache.personal_plan) {
                // Check if it's already in the correct API format (PersonalPlan)
                if ('kebutuhan_kalori' in cache.personal_plan && 'kebutuhan_makronutrisi' in cache.personal_plan) {
                    console.log(`✅ Found API-formatted personal plan with calories: ${cache.personal_plan.kebutuhan_kalori?.['total_kalori_per_hari_(kcal)'] || 'unknown'}`);
                    return cache.personal_plan as PersonalPlan;
                }

                // If it's in simplified nutrition plan format, convert it
                if ('calories' in cache.personal_plan) {
                    const nutritionPlan = cache.personal_plan as any;
                    console.log(`🔄 Converting nutrition plan to API format: ${nutritionPlan.calories} calories`);
                    const personalPlan = mapNutritionPlanToPersonalPlan(nutritionPlan);
                    console.log(`✅ Converted personal plan:`, personalPlan);
                    return personalPlan;
                }

                console.log('⚠️ Personal plan found but format not recognized:', cache.personal_plan);
            }

            // Fallback: try legacy storage
            console.log('⚠️ No personal plan in unified cache, trying legacy storage...');
            const planData = await AsyncStorage.getItem(MealPlanService.NUTRITION_PLAN_KEY);
            if (planData) {
                const nutritionPlan = JSON.parse(planData);
                console.log(`✅ Found nutrition plan in legacy storage`);

                // Convert to API format
                const personalPlan = mapNutritionPlanToPersonalPlan(nutritionPlan);
                console.log(`🔄 Converted legacy plan to API format`);
                return personalPlan;
            }

            console.log('❌ No personal plan found in any storage');
            return null;
        } catch (error) {
            console.error('❌ Error loading personal plan:', error);
            return null;
        }
    }

    /**
     * Get default meal plan structure
     */
    private getDefaultMealPlan(): DailyMealPlan {
        return {
            sarapan: {
                range_waktu: "07.00–08.00",
                deskripsi_rekomendasi_menu: "Sarapan bergizi untuk memulai hari",
                list_pilihan_menu: ["Oatmeal dengan buah", "Nasi uduk dengan lauk", "Roti gandum dengan telur"],
                asupan_cairan_air_gelas: 1,
                target_kalori_kcal: 400
            },
            snack_pagi_opsional: {
                range_waktu: "10.00–10.30",
                deskripsi_rekomendasi_menu: "Camilan sehat pagi",
                list_pilihan_menu: ["Buah potong", "Yogurt", "Kacang-kacangan"],
                asupan_cairan_air_gelas: 1,
                target_kalori_kcal: 150
            },
            makan_siang: {
                range_waktu: "12.00–13.00",
                deskripsi_rekomendasi_menu: "Makan siang bergizi seimbang",
                list_pilihan_menu: ["Nasi dengan ayam dan sayur", "Gado-gado", "Soto ayam"],
                asupan_cairan_air_gelas: 2,
                target_kalori_kcal: 500
            },
            snack_sore_opsional: {
                range_waktu: "15.30–16.00",
                deskripsi_rekomendasi_menu: "Camilan sore yang ringan",
                list_pilihan_menu: ["Buah-buahan", "Teh dengan biskuit", "Kacang rebus"],
                asupan_cairan_air_gelas: 1,
                target_kalori_kcal: 120
            },
            makan_malam: {
                range_waktu: "18.30–19.30",
                deskripsi_rekomendasi_menu: "Makan malam yang mudah dicerna",
                list_pilihan_menu: ["Ikan dengan nasi", "Sayur sup", "Pecel lele"],
                asupan_cairan_air_gelas: 2,
                target_kalori_kcal: 450
            }
        };
    }

    /**
     * Validate input data before sending to API
     */
    private validateInputs(userData: UserData, personalPlan: PersonalPlan): void {
        console.log('🔍 Validating inputs:', {
            userData: userData ? `${userData.nama}, ${userData.usia} years` : 'null',
            personalPlan: personalPlan ? `${personalPlan.kebutuhan_kalori?.total_harian} kcal` : 'null'
        });

        if (!userData) {
            throw new Error('User data is null - please complete your profile');
        }

        if (!userData.nama || !userData.usia) {
            throw new Error(`Invalid user data - name: ${userData.nama}, age: ${userData.usia} - please complete your profile`);
        }

        if (!personalPlan) {
            throw new Error('Personal plan is null - please complete nutrition assessment');
        }

        if (!personalPlan.kebutuhan_kalori) {
            throw new Error('Valid personal plan is required - please complete nutrition assessment');
        }
    }

    /**
     * Convert API meal plan format to cached meals format
     */
    private convertAPIMealsToCached(apiMealPlan: DailyMealPlan): { [mealType: string]: CachedMeal } {
        console.log('🔄 Converting API meals to cached format:', JSON.stringify(apiMealPlan, null, 2));
        const cachedMeals: { [mealType: string]: CachedMeal } = {};

        // Helper function to convert individual meal
        const convertMeal = (mealType: string, meal: MealPlanMeal): CachedMeal => {
            const cached: CachedMeal = {
                range_waktu: meal.range_waktu,
                deskripsi_rekomendasi_menu: meal.deskripsi_rekomendasi_menu,
                list_pilihan_menu: meal.list_pilihan_menu,
                "asupan_cairan_(air_gelas)": meal.asupan_cairan_air_gelas,
                "target_kalori_(kcal)": meal.target_kalori_kcal,
                status: 'planned',
            };
            console.log(`🍽️ Converting ${mealType}: ${meal.target_kalori_kcal} kcal -> ${cached["target_kalori_(kcal)"]} kcal`);
            return cached;
        };

        // Convert each meal type
        if (apiMealPlan.sarapan) {
            cachedMeals['sarapan'] = convertMeal('sarapan', apiMealPlan.sarapan);
        }

        if (apiMealPlan.snack_pagi_opsional) {
            cachedMeals['snack_pagi'] = convertMeal('snack_pagi', apiMealPlan.snack_pagi_opsional);
        }

        if (apiMealPlan.makan_siang) {
            cachedMeals['makan_siang'] = convertMeal('makan_siang', apiMealPlan.makan_siang);
        }

        if (apiMealPlan.snack_sore_opsional) {
            cachedMeals['snack_sore'] = convertMeal('snack_sore', apiMealPlan.snack_sore_opsional);
        }

        if (apiMealPlan.makan_malam) {
            cachedMeals['makan_malam'] = convertMeal('makan_malam', apiMealPlan.makan_malam);
        }

        return cachedMeals;
    }

    /**
     * Convert cached meals format to API meal plan format
     */
    private convertCachedMealsToAPI(cachedMeals: { [mealType: string]: CachedMeal }): DailyMealPlan {
        // Helper function to convert individual cached meal back to API format
        const convertCachedMeal = (cachedMeal: CachedMeal): MealPlanMeal => {
            const converted = {
                range_waktu: cachedMeal.range_waktu,
                deskripsi_rekomendasi_menu: cachedMeal.deskripsi_rekomendasi_menu,
                list_pilihan_menu: cachedMeal.list_pilihan_menu,
                asupan_cairan_air_gelas: cachedMeal["asupan_cairan_(air_gelas)"],
                target_kalori_kcal: cachedMeal["target_kalori_(kcal)"],
            };
            console.log(`🔄 Converting cached meal - Original: ${cachedMeal["target_kalori_(kcal)"]} -> Converted: ${converted.target_kalori_kcal}`);
            return converted;
        };

        const apiMealPlan: DailyMealPlan = {
            sarapan: cachedMeals['sarapan'] ? convertCachedMeal(cachedMeals['sarapan']) : this.getDefaultMealPlan().sarapan,
            makan_siang: cachedMeals['makan_siang'] ? convertCachedMeal(cachedMeals['makan_siang']) : this.getDefaultMealPlan().makan_siang,
            makan_malam: cachedMeals['makan_malam'] ? convertCachedMeal(cachedMeals['makan_malam']) : this.getDefaultMealPlan().makan_malam,
        };

        // Optional meals
        if (cachedMeals['snack_pagi']) {
            apiMealPlan.snack_pagi_opsional = convertCachedMeal(cachedMeals['snack_pagi']);
        }

        if (cachedMeals['snack_sore']) {
            apiMealPlan.snack_sore_opsional = convertCachedMeal(cachedMeals['snack_sore']);
        }

        return apiMealPlan;
    }

    /**
     * Handle and categorize errors
     */
    private handleError(error: any): MealPlanServiceError {
        if (error.name === 'AbortError') {
            return {
                type: 'network',
                message: 'Request timeout - the server took too long to respond',
                details: error
            };
        }

        if (error.message?.includes('fetch')) {
            return {
                type: 'network',
                message: 'Network error - please check your internet connection',
                details: error
            };
        }

        if (error.message?.includes('API Error')) {
            return {
                type: 'api',
                message: error.message,
                details: error
            };
        }

        if (error.message?.includes('required') || error.message?.includes('Valid')) {
            return {
                type: 'validation',
                message: error.message,
                details: error
            };
        }

        if (error.message?.includes('storage')) {
            return {
                type: 'storage',
                message: 'Failed to access local storage',
                details: error
            };
        }

        return {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred',
            details: error
        };
    }

    /**
     * Create a formatted prompt for debugging purposes
     */
    createDebugInfo(userData: UserData, personalPlan: PersonalPlan): string {
        return `
🔍 MEAL PLAN GENERATION DEBUG INFO

👤 USER DATA:
- Name: ${userData.nama}
- Age: ${userData.usia} years
- Gender: ${userData.jenis_kelamin}
- Weight: ${userData.berat_badan} kg
- Height: ${userData.tinggi_badan} cm
- Activity Level: ${userData.tingkat_aktivitas}
- Goal: ${userData.tujuan}
- Food Preferences: ${userData.preferensi_makanan || 'None'}
- Food Allergies: ${userData.alergi_makanan || 'None'}
- Health Conditions: ${userData.kondisi_kesehatan || 'None'}

📋 PERSONAL PLAN:
- Daily Calories: ${JSON.stringify(personalPlan.kebutuhan_kalori)}
- Macronutrients: ${JSON.stringify(personalPlan.kebutuhan_makronutrisi)}
- Micronutrients: ${JSON.stringify(personalPlan.kebutuhan_mikronutrisi)}
- Restrictions: ${JSON.stringify(personalPlan.batasi_konsumsi)}
- Fluid Needs: ${JSON.stringify(personalPlan.kebutuhan_cairan)}

📊 REQUEST TIMESTAMP: ${new Date().toISOString()}
        `.trim();
    }
}

// Export singleton instance
export const mealPlanService = new MealPlanService();
