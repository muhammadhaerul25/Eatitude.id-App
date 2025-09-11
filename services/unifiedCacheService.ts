/**
 * Unified Cache Service for Eatitude App
 * 
 * This service implements the comprehensive caching strategy that connects:
 * - Meal planning (daily meal plans with automatic generation)
 * - Personal plans (user goals and nutrition targets)
 * - Food scanning (nutrition label and food recognition)
 * - Progress tracking (calories, nutrients, water intake)
 * - Nutrition insights (daily advice and analysis)
 * 
 * Uses AsyncStorage with a single JSON blob for optimal performance
 * and follows the suggested cache schema pattern.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalPlan, UserData } from './api';

// Cache configuration
const CACHE_KEY = '@HealthyAppCache';
const CACHE_RETENTION_DAYS = 30; // Keep 30 days of history

/**
 * Core meal information structure - matches backend API format
 */
export interface CachedMeal {
    range_waktu: string;
    deskripsi_rekomendasi_menu: string;
    list_pilihan_menu: string[];
    "asupan_cairan_(air_gelas)": number;
    "target_kalori_(kcal)": number;
    status: 'planned' | 'eaten' | 'skipped';
    actual_calories?: number;
    actual_nutrition?: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    logged_at?: string; // ISO timestamp when meal was logged
    scanned_items?: ScannedFoodItem[]; // Items added via scanning
}

/**
 * Scanned food item from nutrition scanner
 */
export interface ScannedFoodItem {
    id: string;
    name: string;
    weight_grams: number;
    calories: number;
    nutrition: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
    };
    scan_type: 'food_recognition' | 'nutrition_label';
    image_path?: string;
    confidence_score?: number;
    scanned_at: string; // ISO timestamp
}

/**
 * Daily nutrition insights and advice
 */
export interface NutritionInsight {
    summary: string;
    advice: string[];
    warnings: string[];
    achievements: string[];
    recommendations: {
        next_meal_suggestion?: string;
        hydration_reminder?: string;
        activity_suggestion?: string;
    };
    generated_at: string; // ISO timestamp
}

/**
 * Daily progress tracking
 */
export interface DailyProgress {
    calories_eaten: number;
    calories_target: number;
    macros_eaten: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    macros_target: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    water_intake_ml: number;
    water_target_ml: number;
    meals_completed: number;
    meals_total: number;
    last_updated: string; // ISO timestamp
}

/**
 * Daily cache entry containing all day-specific data
 */
export interface DailyCache {
    meal_plan: { [mealType: string]: CachedMeal };
    nutrition_insight: NutritionInsight;
    progress: DailyProgress;
    scanned_foods: ScannedFoodItem[];
    last_updated: string; // ISO timestamp
}

/**
 * Complete app cache structure
 */
export interface AppCache {
    last_login: string; // ISO timestamp of last login
    user_data: UserData | null;
    personal_plan: PersonalPlan | null;
    daily_cache: { [dateKey: string]: DailyCache }; // dateKey format: "2025-09-11"
    app_settings: {
        notifications_enabled: boolean;
        auto_generate_meals: boolean;
        preferred_units: 'metric' | 'imperial';
        dark_mode: boolean;
    };
    cache_version: string; // For future migrations
}

/**
 * Unified Cache Service Class
 */
export class UnifiedCacheService {
    private static instance: UnifiedCacheService;
    private cache: AppCache | null = null;

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): UnifiedCacheService {
        if (!UnifiedCacheService.instance) {
            UnifiedCacheService.instance = new UnifiedCacheService();
        }
        return UnifiedCacheService.instance;
    }

    /**
     * Initialize cache on app start
     * Creates structure for today if needed
     */
    public async initializeCache(): Promise<AppCache> {
        try {
            console.log('🚀 UnifiedCache: Initializing cache system');

            const cacheString = await AsyncStorage.getItem(CACHE_KEY);
            let cache: AppCache = cacheString ? JSON.parse(cacheString) : this.getDefaultCache();

            const today = new Date().toISOString().split('T')[0];

            // Ensure daily cache structure exists
            if (!cache.daily_cache) cache.daily_cache = {};

            // Create today's cache if it doesn't exist
            if (!cache.daily_cache[today]) {
                console.log(`📅 Creating daily cache for ${today}`);
                cache.daily_cache[today] = await this.createEmptyDayCache();
                cache.last_login = new Date().toISOString();
            }

            // Clean up old cache entries
            await this.cleanupOldEntries(cache);

            // Save updated cache
            await this.saveCache(cache);
            this.cache = cache;

            console.log('✅ UnifiedCache: Cache initialized successfully');
            return cache;

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to initialize cache:', error);
            // Return default cache on error
            const defaultCache = this.getDefaultCache();
            this.cache = defaultCache;
            return defaultCache;
        }
    }

    /**
     * Get current cache (initialize if needed)
     */
    public async getCache(): Promise<AppCache> {
        if (!this.cache) {
            return await this.initializeCache();
        }
        return this.cache;
    }

    /**
     * Get daily cache for specific date
     */
    public async getDayCache(date: Date): Promise<DailyCache> {
        const cache = await this.getCache();
        const dateKey = date.toISOString().split('T')[0];

        if (!cache.daily_cache[dateKey]) {
            console.log(`📅 Creating new daily cache for ${dateKey}`);
            cache.daily_cache[dateKey] = await this.createEmptyDayCache();
            await this.saveCache(cache);
        }

        return cache.daily_cache[dateKey];
    }

    /**
     * Update user data and personal plan
     */
    public async updateUserProfile(userData: UserData, personalPlan: PersonalPlan): Promise<void> {
        try {
            const cache = await this.getCache();
            cache.user_data = userData;
            cache.personal_plan = personalPlan;
            cache.last_login = new Date().toISOString();

            await this.saveCache(cache);
            console.log('✅ UnifiedCache: User profile updated');

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to update user profile:', error);
            throw error;
        }
    }

    /**
     * Update meal plan for specific date
     */
    public async updateMealPlan(date: Date, mealPlan: { [mealType: string]: CachedMeal }): Promise<void> {
        try {
            const cache = await this.getCache();
            const dateKey = date.toISOString().split('T')[0];

            if (!cache.daily_cache[dateKey]) {
                cache.daily_cache[dateKey] = await this.createEmptyDayCache();
            }

            cache.daily_cache[dateKey].meal_plan = mealPlan;
            cache.daily_cache[dateKey].last_updated = new Date().toISOString();

            await this.saveCache(cache);
            console.log(`✅ UnifiedCache: Meal plan updated for ${dateKey}`);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to update meal plan:', error);
            throw error;
        }
    }

    /**
     * Log a meal as eaten with nutrition data
     */
    public async logMeal(date: Date, mealId: string, actualCalories: number, actualNutrition?: any, scannedItems?: ScannedFoodItem[]): Promise<void> {
        try {
            const cache = await this.getCache();
            const dateKey = date.toISOString().split('T')[0];
            const dayCache = await this.getDayCache(date);

            // Update meal status
            if (dayCache.meal_plan[mealId]) {
                dayCache.meal_plan[mealId].status = 'eaten';
                dayCache.meal_plan[mealId].actual_calories = actualCalories;
                dayCache.meal_plan[mealId].actual_nutrition = actualNutrition;
                dayCache.meal_plan[mealId].logged_at = new Date().toISOString();

                if (scannedItems) {
                    dayCache.meal_plan[mealId].scanned_items = scannedItems;
                    dayCache.scanned_foods.push(...scannedItems);
                }
            }

            // Update progress
            dayCache.progress.calories_eaten += actualCalories;
            if (actualNutrition) {
                dayCache.progress.macros_eaten.protein += actualNutrition.protein || 0;
                dayCache.progress.macros_eaten.carbs += actualNutrition.carbs || 0;
                dayCache.progress.macros_eaten.fat += actualNutrition.fat || 0;
                dayCache.progress.macros_eaten.fiber += actualNutrition.fiber || 0;
            }
            dayCache.progress.meals_completed += 1;
            dayCache.progress.last_updated = new Date().toISOString();

            // Update last updated timestamp
            dayCache.last_updated = new Date().toISOString();

            await this.saveCache(cache);
            console.log(`✅ UnifiedCache: Meal logged for ${dateKey}`);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to log meal:', error);
            throw error;
        }
    }

    /**
     * Add scanned food item
     */
    public async addScannedFood(date: Date, scannedItem: ScannedFoodItem): Promise<void> {
        try {
            const cache = await this.getCache();
            const dayCache = await this.getDayCache(date);

            dayCache.scanned_foods.push(scannedItem);
            dayCache.last_updated = new Date().toISOString();

            await this.saveCache(cache);
            console.log(`✅ UnifiedCache: Scanned food added for ${date.toISOString().split('T')[0]}`);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to add scanned food:', error);
            throw error;
        }
    }

    /**
     * Update nutrition insights
     */
    public async updateNutritionInsights(date: Date, insights: NutritionInsight): Promise<void> {
        try {
            const cache = await this.getCache();
            const dayCache = await this.getDayCache(date);

            dayCache.nutrition_insight = insights;
            dayCache.last_updated = new Date().toISOString();

            await this.saveCache(cache);
            console.log(`✅ UnifiedCache: Nutrition insights updated for ${date.toISOString().split('T')[0]}`);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to update nutrition insights:', error);
            throw error;
        }
    }

    /**
     * Update water intake
     */
    public async updateWaterIntake(date: Date, amountMl: number): Promise<void> {
        try {
            const cache = await this.getCache();
            const dayCache = await this.getDayCache(date);

            dayCache.progress.water_intake_ml += amountMl;
            dayCache.progress.last_updated = new Date().toISOString();
            dayCache.last_updated = new Date().toISOString();

            await this.saveCache(cache);
            console.log(`✅ UnifiedCache: Water intake updated (+${amountMl}ml)`);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to update water intake:', error);
            throw error;
        }
    }

    /**
     * Get progress data for date range (for charts/analytics)
     */
    public async getProgressHistory(startDate: Date, endDate: Date): Promise<{ [dateKey: string]: DailyProgress }> {
        try {
            const cache = await this.getCache();
            const history: { [dateKey: string]: DailyProgress } = {};

            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dateKey = currentDate.toISOString().split('T')[0];
                if (cache.daily_cache[dateKey]) {
                    history[dateKey] = cache.daily_cache[dateKey].progress;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return history;

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to get progress history:', error);
            return {};
        }
    }

    /**
     * Check if new day and update last login
     */
    public async checkNewDay(): Promise<boolean> {
        try {
            const cache = await this.getCache();
            const today = new Date().toISOString().split('T')[0];
            const lastLoginDate = cache.last_login ? cache.last_login.split('T')[0] : null;

            const isNewDay = !lastLoginDate || lastLoginDate !== today;

            if (isNewDay) {
                console.log(`🆕 New day detected! Previous: ${lastLoginDate}, Today: ${today}`);
                cache.last_login = new Date().toISOString();

                // Ensure today's cache exists
                if (!cache.daily_cache[today]) {
                    cache.daily_cache[today] = await this.createEmptyDayCache();
                }

                await this.saveCache(cache);
            }

            return isNewDay;

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to check new day:', error);
            return true; // Default to new day on error
        }
    }

    /**
     * Clear all cache data (for logout/reset)
     */
    public async clearCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CACHE_KEY);
            this.cache = null;
            console.log('✅ UnifiedCache: Cache cleared successfully');

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to clear cache:', error);
            throw error;
        }
    }

    /**
     * Export cache data (for backup/debugging)
     */
    public async exportCacheData(): Promise<string> {
        try {
            const cache = await this.getCache();
            return JSON.stringify(cache, null, 2);

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to export cache data:', error);
            throw error;
        }
    }

    // Private helper methods

    /**
     * Get default cache structure
     */
    private getDefaultCache(): AppCache {
        return {
            last_login: new Date().toISOString(),
            user_data: null,
            personal_plan: null,
            daily_cache: {},
            app_settings: {
                notifications_enabled: true,
                auto_generate_meals: true,
                preferred_units: 'metric',
                dark_mode: false,
            },
            cache_version: '1.0.0',
        };
    }

    /**
     * Create empty day cache structure
     */
    private async createEmptyDayCache(): Promise<DailyCache> {
        return {
            meal_plan: {},
            nutrition_insight: {
                summary: 'No data available yet',
                advice: [],
                warnings: [],
                achievements: [],
                recommendations: {},
                generated_at: new Date().toISOString(),
            },
            progress: {
                calories_eaten: 0,
                calories_target: 2000, // Default, should be updated with personal plan
                macros_eaten: {
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                },
                macros_target: {
                    protein: 150,  // Default values
                    carbs: 250,
                    fat: 70,
                    fiber: 25,
                },
                water_intake_ml: 0,
                water_target_ml: 2000, // 2 liters default
                meals_completed: 0,
                meals_total: 5, // sarapan, snack_pagi, makan_siang, snack_sore, makan_malam
                last_updated: new Date().toISOString(),
            },
            scanned_foods: [],
            last_updated: new Date().toISOString(),
        };
    }

    /**
     * Save cache to AsyncStorage
     */
    private async saveCache(cache: AppCache): Promise<void> {
        try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            this.cache = cache;

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to save cache:', error);
            throw error;
        }
    }

    /**
     * Public method to update cache data
     * Used by external services that need to modify cache
     */
    public async updateCache(updateFn: (cache: AppCache) => void): Promise<void> {
        try {
            const cache = await this.getCache();
            updateFn(cache);
            await this.saveCache(cache);
            console.log('✅ UnifiedCache: Cache updated successfully');
        } catch (error) {
            console.error('❌ UnifiedCache: Failed to update cache:', error);
            throw error;
        }
    }

    /**
     * Clean up old cache entries to save space
     */
    private async cleanupOldEntries(cache: AppCache): Promise<void> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - CACHE_RETENTION_DAYS);
            const cutoffDateKey = cutoffDate.toISOString().split('T')[0];

            const dateKeys = Object.keys(cache.daily_cache);
            let removedCount = 0;

            for (const dateKey of dateKeys) {
                if (dateKey < cutoffDateKey) {
                    delete cache.daily_cache[dateKey];
                    removedCount++;
                }
            }

            if (removedCount > 0) {
                console.log(`🧹 UnifiedCache: Cleaned up ${removedCount} old cache entries`);
            }

        } catch (error) {
            console.error('❌ UnifiedCache: Failed to cleanup old entries:', error);
        }
    }
}

// Export singleton instance
export const unifiedCache = UnifiedCacheService.getInstance();
