/**
 * Meal Plan API Service (Enhanced with Unified Cache)
 * 
 * This service provides comprehensive meal planning functionality including:
 * - Daily meal plan generation
 * - Automatic meal plan refresh for new days
 * - Last login tracking for meal plan updates
 * - Type integration with FastAPI backend
 * - Integration with unified cache system for better data management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, PersonalPlan, UserData } from './api';
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
 * Frontend meal item representation for UI
 */
export interface MealItem {
    id: string;
    type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
    timeRange: string;
    rekomendasi_menu: string;
    targetKalori: number;
    status: 'not_planned' | 'upcoming' | 'completed' | 'skipped';
    isOptional?: boolean;
    details?: {
        deskripsi: string;
        pilihan_menu: string[];
        asupan_cairan: number;
    };
}

/**
 * Error handling for meal plan service
 */
export interface MealPlanServiceError {
    type: 'network' | 'validation' | 'api' | 'storage' | 'unknown';
    message: string;
    details?: any;
}

/**
 * Result wrapper for meal plan operations
 */
export interface MealPlanServiceResult {
    success: boolean;
    data?: DailyMealPlan;
    error?: MealPlanServiceError;
}

/**
 * Service class for meal planning functionality
 */
class MealPlanService {
    private static readonly LAST_LOGIN_KEY = 'last_login_date';
    private static readonly MEAL_PLAN_PREFIX = 'mealPlan_';
    private static readonly USER_PROFILE_KEY = 'userProfile';
    private static readonly NUTRITION_PLAN_KEY = 'nutritionPlan';

    /**
     * Generate a new daily meal plan
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

                if (!userData) {
                    throw new Error('User data not found. Please complete your profile setup first.');
                }

                if (!personalPlan) {
                    throw new Error('Personal plan not found. Please complete your nutrition assessment first.');
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
                data: this.getDefaultMealPlan()
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
     * Save meal plan to local storage
     */
    private async saveMealPlan(dateKey: string, mealPlan: DailyMealPlan): Promise<void> {
        try {
            await AsyncStorage.setItem(
                `${MealPlanService.MEAL_PLAN_PREFIX}${dateKey}`,
                JSON.stringify(mealPlan)
            );
            console.log(`💾 Meal plan saved for ${dateKey}`);
        } catch (error) {
            console.error('Error saving meal plan:', error);
            throw new Error('Failed to save meal plan to storage');
        }
    }

    /**
     * Update last login date in storage
     */
    private async updateLastLoginDate(date: Date): Promise<void> {
        try {
            const dateStr = date.toISOString().split('T')[0];
            await AsyncStorage.setItem(MealPlanService.LAST_LOGIN_KEY, dateStr);
            console.log(`📅 Last login date updated to ${dateStr}`);
        } catch (error) {
            console.error('Error updating last login date:', error);
        }
    }

    /**
     * Load user data from unified cache
     */
    private async loadUserData(): Promise<UserData | null> {
        try {
            console.log('📊 MealPlanService: Loading user data from unified cache');
            const cache = await unifiedCache.getCache();

            if (cache.user_data) {
                console.log(`✅ Found user data: ${cache.user_data.nama}, ${cache.user_data.usia} years old`);
                return cache.user_data;
            }

            // Fallback: try legacy storage
            console.log('⚠️ No user data in unified cache, trying legacy storage...');
            const profileData = await AsyncStorage.getItem(MealPlanService.USER_PROFILE_KEY);
            if (profileData) {
                const userData = JSON.parse(profileData);
                console.log(`✅ Found user data in legacy storage: ${userData.nama}`);

                // Migrate to unified cache if personal plan exists
                const personalPlanData = await AsyncStorage.getItem(MealPlanService.NUTRITION_PLAN_KEY);
                if (personalPlanData) {
                    const personalPlan = JSON.parse(personalPlanData);
                    await unifiedCache.updateUserProfile(userData, personalPlan);
                    console.log('✅ Migrated user data to unified cache');
                }

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
     * Load personal plan from unified cache
     */
    private async loadPersonalPlan(): Promise<PersonalPlan | null> {
        try {
            console.log('📋 MealPlanService: Loading personal plan from unified cache');
            const cache = await unifiedCache.getCache();

            if (cache.personal_plan) {
                console.log(`✅ Found personal plan with ${cache.personal_plan.kebutuhan_kalori} calories target`);
                return cache.personal_plan;
            }

            // Fallback: try legacy storage
            console.log('⚠️ No personal plan in unified cache, trying legacy storage...');
            const planData = await AsyncStorage.getItem(MealPlanService.NUTRITION_PLAN_KEY);
            if (planData) {
                const personalPlan = JSON.parse(planData);
                console.log(`✅ Found personal plan in legacy storage`);
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
     * Convert API meal plan to frontend meal items
     */
    mapMealPlanToItems(mealPlan: DailyMealPlan): MealItem[] {
        const mealTypes = [
            { key: 'sarapan', type: 'sarapan' as const, isOptional: false },
            { key: 'snack_pagi_opsional', type: 'snack_pagi' as const, isOptional: true },
            { key: 'makan_siang', type: 'makan_siang' as const, isOptional: false },
            { key: 'snack_sore_opsional', type: 'snack_sore' as const, isOptional: true },
            { key: 'makan_malam', type: 'makan_malam' as const, isOptional: false },
        ];

        return mealTypes.map((meal, index) => {
            const mealData = mealPlan[meal.key as keyof DailyMealPlan];

            if (!mealData) {
                return {
                    id: (index + 1).toString(),
                    type: meal.type,
                    timeRange: this.getDefaultTimeRange(meal.type),
                    rekomendasi_menu: 'Get Recommendation',
                    targetKalori: 0,
                    status: 'not_planned' as const,
                    isOptional: meal.isOptional,
                };
            }

            return {
                id: (index + 1).toString(),
                type: meal.type,
                timeRange: mealData.range_waktu,
                rekomendasi_menu: mealData.list_pilihan_menu[0] || 'Menu tidak tersedia',
                targetKalori: mealData.target_kalori_kcal,
                status: 'not_planned' as const,
                isOptional: meal.isOptional,
                details: {
                    deskripsi: mealData.deskripsi_rekomendasi_menu,
                    pilihan_menu: mealData.list_pilihan_menu,
                    asupan_cairan: mealData.asupan_cairan_air_gelas,
                }
            };
        });
    }

    /**
     * Get default time range for meal type
     */
    private getDefaultTimeRange(type: string): string {
        switch (type) {
            case 'sarapan': return '07:00 - 08:00';
            case 'snack_pagi': return '10:00 - 11:00';
            case 'makan_siang': return '12:00 - 14:00';
            case 'snack_sore': return '15:00 - 16:00';
            case 'makan_malam': return '18:00 - 20:00';
            default: return '00:00 - 00:00';
        }
    }

    /**
     * Validate input data before sending to API
     */
    private validateInputs(userData: UserData, personalPlan: PersonalPlan): void {
        if (!userData || !userData.nama || !userData.usia) {
            throw new Error('Valid user data is required');
        }

        if (!personalPlan || !personalPlan.kebutuhan_kalori) {
            throw new Error('Valid personal plan is required');
        }
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
     * Convert API meal plan format to cached meals format
     */
    private convertAPIMealsToCached(apiMealPlan: DailyMealPlan): { [mealType: string]: CachedMeal } {
        const cachedMeals: { [mealType: string]: CachedMeal } = {};

        // Helper function to convert individual meal
        const convertMeal = (mealType: string, meal: MealPlanMeal, isOptional: boolean = false): CachedMeal => {
            return {
                range_waktu: meal.range_waktu,
                deskripsi_rekomendasi_menu: meal.deskripsi_rekomendasi_menu,
                list_pilihan_menu: meal.list_pilihan_menu,
                "asupan_cairan_(air_gelas)": meal.asupan_cairan_air_gelas,
                "target_kalori_(kcal)": meal.target_kalori_kcal,
                status: 'planned',
            };
        };

        // Convert each meal type
        if (apiMealPlan.sarapan) {
            cachedMeals['sarapan'] = convertMeal('sarapan', apiMealPlan.sarapan);
        }

        if (apiMealPlan.snack_pagi_opsional) {
            cachedMeals['snack_pagi'] = convertMeal('snack_pagi', apiMealPlan.snack_pagi_opsional, true);
        }

        if (apiMealPlan.makan_siang) {
            cachedMeals['makan_siang'] = convertMeal('makan_siang', apiMealPlan.makan_siang);
        }

        if (apiMealPlan.snack_sore_opsional) {
            cachedMeals['snack_sore'] = convertMeal('snack_sore', apiMealPlan.snack_sore_opsional, true);
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
            return {
                range_waktu: cachedMeal.range_waktu,
                deskripsi_rekomendasi_menu: cachedMeal.deskripsi_rekomendasi_menu,
                list_pilihan_menu: cachedMeal.list_pilihan_menu,
                asupan_cairan_air_gelas: cachedMeal["asupan_cairan_(air_gelas)"],
                target_kalori_kcal: cachedMeal["target_kalori_(kcal)"],
            };
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
     * Create a formatted prompt for debugging purposes
     */
    createDebugInfo(userData: UserData, personalPlan: PersonalPlan): string {
        return `
=== Meal Plan Generation Debug Info ===
User: ${userData.nama} (${userData.usia} years old)
Goal: ${userData.tujuan}
Activity Level: ${userData.tingkat_aktivitas}
Daily Calories: ${personalPlan.kebutuhan_kalori?.harian || 'Not specified'}
Dietary Preferences: ${userData.preferensi_makanan || 'None specified'}
Allergies: ${userData.alergi_makanan || 'None specified'}
Health Conditions: ${userData.kondisi_kesehatan || 'None specified'}
=======================================
        `.trim();
    }
}

// Export singleton instance
export const mealPlanService = new MealPlanService();

