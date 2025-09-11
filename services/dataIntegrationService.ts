/**
 * Data Integration Service
 * 
 * This service connects all features and ensures proper data flow between:
 * - User Profile & Personal Plans
 * - Meal Planning & Nutrition Tracking
 * - Food Scanning & Nutrition Analysis
 * - Progress Tracking & Insights Generation
 * 
 * Now uses Indonesian field names consistently throughout the app to match API format.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, PersonalPlan, UserData } from './api';
import { mealPlanService } from './enhancedMealPlanAPI';
import { NutritionInsight, ScannedFoodItem, unifiedCache } from './unifiedCacheService';

/**
 * Comprehensive user onboarding data - now using Indonesian field names
 */
export interface DataOnboarding {
    // Profil dasar
    nama: string;
    usia: number;
    jenis_kelamin: string;
    berat_badan: number;
    tinggi_badan: number;

    // Gaya hidup
    tingkat_aktivitas: string;
    catatan_aktivitas?: string;
    waktu_bangun: string;
    waktu_tidur: string;

    // Preferensi & Kesehatan
    preferensi_makanan?: string;
    alergi_makanan?: string;
    kondisi_kesehatan?: string;
    tujuan: string;
}

/**
 * Data Integration Service Class
 */
export class DataIntegrationService {
    private static instance: DataIntegrationService;

    private constructor() { }

    public static getInstance(): DataIntegrationService {
        if (!DataIntegrationService.instance) {
            DataIntegrationService.instance = new DataIntegrationService();
        }
        return DataIntegrationService.instance;
    }

    /**
     * Initialize app data system on startup
     * Migrates legacy data and sets up unified cache
     */
    public async initializeAppData(): Promise<void> {
        try {
            console.log('🚀 DataIntegration: Initializing app data system');

            // Initialize unified cache
            await unifiedCache.initializeCache();

            // Check for legacy data and migrate if needed
            await this.migrateLegacyData();

            // Verify data integrity
            await this.verifyDataIntegrity();

            console.log('✅ DataIntegration: App data system initialized successfully');

        } catch (error) {
            console.error('❌ DataIntegration: Failed to initialize app data:', error);
            throw error;
        }
    }

    /**
     * Complete user onboarding process
     * Creates user profile and generates personal plan
     */
    public async completeOnboarding(onboardingData: DataOnboarding): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('👤 DataIntegration: Starting onboarding process');

            // Convert onboarding data to UserData format (already in correct format!)
            const userData: UserData = {
                nama: onboardingData.nama,
                usia: onboardingData.usia,
                jenis_kelamin: onboardingData.jenis_kelamin,
                berat_badan: onboardingData.berat_badan,
                tinggi_badan: onboardingData.tinggi_badan,
                tingkat_aktivitas: onboardingData.tingkat_aktivitas,
                catatan_aktivitas: onboardingData.catatan_aktivitas || null,
                waktu_bangun: onboardingData.waktu_bangun,
                waktu_tidur: onboardingData.waktu_tidur,
                preferensi_makanan: onboardingData.preferensi_makanan || null,
                alergi_makanan: onboardingData.alergi_makanan || null,
                kondisi_kesehatan: onboardingData.kondisi_kesehatan || null,
                tujuan: onboardingData.tujuan,
            };

            // Generate personal plan using API
            console.log('📋 Generating personal nutrition plan...');
            const personalPlan = await apiService.generatePersonalPlan(userData);

            // Save both to unified cache
            await unifiedCache.updateUserProfile(userData, personalPlan);

            // Generate initial meal plan for today
            console.log('🍽️ Generating initial meal plan...');
            const today = new Date();
            await mealPlanService.getMealPlanForDate(today);

            console.log('✅ DataIntegration: Onboarding completed successfully');

            return { success: true };

        } catch (error) {
            console.error('❌ DataIntegration: Onboarding failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Update user profile and regenerate personal plan
     */
    public async updateUserProfile(updatedData: Partial<DataOnboarding>): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('🔄 DataIntegration: Updating user profile');

            const cache = await unifiedCache.getCache();
            if (!cache.user_data) {
                throw new Error('No existing user data found');
            }

            // Merge updated data with existing data
            const updatedUserData: UserData = {
                ...cache.user_data,
                ...(updatedData.nama && { nama: updatedData.nama }),
                ...(updatedData.usia && { usia: updatedData.usia }),
                ...(updatedData.jenis_kelamin && { jenis_kelamin: updatedData.jenis_kelamin }),
                ...(updatedData.berat_badan && { berat_badan: updatedData.berat_badan }),
                ...(updatedData.tinggi_badan && { tinggi_badan: updatedData.tinggi_badan }),
                ...(updatedData.tingkat_aktivitas && { tingkat_aktivitas: updatedData.tingkat_aktivitas }),
                ...(updatedData.catatan_aktivitas !== undefined && { catatan_aktivitas: updatedData.catatan_aktivitas }),
                ...(updatedData.waktu_bangun && { waktu_bangun: updatedData.waktu_bangun }),
                ...(updatedData.waktu_tidur && { waktu_tidur: updatedData.waktu_tidur }),
                ...(updatedData.preferensi_makanan !== undefined && { preferensi_makanan: updatedData.preferensi_makanan }),
                ...(updatedData.alergi_makanan !== undefined && { alergi_makanan: updatedData.alergi_makanan }),
                ...(updatedData.kondisi_kesehatan !== undefined && { kondisi_kesehatan: updatedData.kondisi_kesehatan }),
                ...(updatedData.tujuan && { tujuan: updatedData.tujuan }),
            };

            // Regenerate personal plan with updated data
            const personalPlan = await apiService.generatePersonalPlan(updatedUserData);

            // Update unified cache
            await unifiedCache.updateUserProfile(updatedUserData, personalPlan);

            console.log('✅ DataIntegration: User profile updated successfully');

            return { success: true };

        } catch (error) {
            console.error('❌ DataIntegration: Failed to update user profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Process scanned food and add to meal plan
     */
    public async processScannedFood(
        scanType: 'food_recognition' | 'nutrition_label',
        imageUri: string,
        mealType?: string
    ): Promise<{ success: boolean; scannedFood?: ScannedFoodItem; error?: string }> {
        try {
            console.log(`📸 DataIntegration: Processing ${scanType} scan`);

            let scannedFood: ScannedFoodItem;

            if (scanType === 'food_recognition') {
                // Use food scanner API with URI conversion
                const result = await apiService.scanFoodFromUri(imageUri);

                scannedFood = {
                    id: `food_${Date.now()}`,
                    name: result.makanan_teridentifikasi || 'Unknown Food',
                    weight_grams: this.extractWeight(result.estimasi_berat) || 100,
                    calories: result.informasi_nutrisi?.kalori || 0,
                    nutrition: {
                        protein: result.informasi_nutrisi?.protein || 0,
                        carbs: result.informasi_nutrisi?.karbohidrat || 0,
                        fat: result.informasi_nutrisi?.lemak || 0,
                        fiber: result.informasi_nutrisi?.serat || 0,
                        sugar: result.informasi_nutrisi?.gula || 0,
                        sodium: result.informasi_nutrisi?.natrium || 0,
                    },
                    scan_type: 'food_recognition',
                    image_path: imageUri,
                    confidence_score: 0.85, // Default confidence
                    scanned_at: new Date().toISOString(),
                };

            } else {
                // Use nutrition label scanner API with URI conversion
                const result = await apiService.scanNutritionLabelFromUri(imageUri);

                scannedFood = {
                    id: `label_${Date.now()}`,
                    name: result.nama_produk || 'Scanned Product',
                    weight_grams: result.berat_per_sajian || 100,
                    calories: result.informasi_gizi?.energi_total || 0,
                    nutrition: {
                        protein: result.informasi_gizi?.protein || 0,
                        carbs: result.informasi_gizi?.karbohidrat_total || 0,
                        fat: result.informasi_gizi?.lemak_total || 0,
                        fiber: result.informasi_gizi?.serat_pangan || 0,
                        sugar: result.informasi_gizi?.gula || 0,
                        sodium: result.informasi_gizi?.natrium || 0,
                    },
                    scan_type: 'nutrition_label',
                    image_path: imageUri,
                    scanned_at: new Date().toISOString(),
                };
            }

            // Add to today's scanned foods
            const today = new Date();
            await unifiedCache.addScannedFood(today, scannedFood);

            // If meal type specified, log it as a meal using the built-in unified cache method
            if (mealType) {
                await unifiedCache.logMeal(
                    today,
                    mealType,
                    scannedFood.calories,
                    scannedFood.nutrition,
                    [scannedFood]
                );
            }

            console.log('✅ DataIntegration: Scanned food processed successfully');

            return { success: true, scannedFood };

        } catch (error) {
            console.error('❌ DataIntegration: Failed to process scanned food:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process scanned food'
            };
        }
    }

    /**
     * Extract weight from composition data
     */
    private extractWeight(composition: any): number {
        if (!composition) return 100;

        // Sum all weights from composition
        let totalWeight = 0;
        for (const value of Object.values(composition)) {
            if (typeof value === 'number') {
                totalWeight += value;
            }
        }

        return totalWeight > 0 ? totalWeight : 100;
    }

    /**
     * Generate daily nutrition insights
     */
    public async generateNutritionInsights(date: Date): Promise<{ success: boolean; insights?: NutritionInsight; error?: string }> {
        try {
            console.log('💡 DataIntegration: Generating nutrition insights');

            const cache = await unifiedCache.getCache();
            const dayCache = await unifiedCache.getDayCache(date);

            if (!cache.user_data || !cache.personal_plan) {
                throw new Error('User data or personal plan not found');
            }

            // Calculate current nutrition status
            const progress = dayCache.progress;
            const calorieProgress = (progress.calories_eaten / progress.calories_target) * 100;
            const proteinProgress = (progress.macros_eaten.protein / progress.macros_target.protein) * 100;
            const hydrationProgress = (progress.water_intake_ml / progress.water_target_ml) * 100;

            // Generate insights based on progress
            const insights: NutritionInsight = {
                summary: this.generateInsightSummary(calorieProgress, proteinProgress, hydrationProgress),
                advice: this.generateAdvice(dayCache),
                warnings: this.generateWarnings(dayCache),
                achievements: this.generateAchievements(dayCache),
                recommendations: {
                    next_meal_suggestion: this.getNextMealSuggestion(dayCache),
                    hydration_reminder: hydrationProgress < 70 ? 'Drink more water to reach your daily goal' : undefined,
                    activity_suggestion: calorieProgress < 50 ? 'Consider a light workout to boost metabolism' : undefined,
                },
                generated_at: new Date().toISOString(),
            };

            // Save insights to cache
            await unifiedCache.updateNutritionInsights(date, insights);

            console.log('✅ DataIntegration: Nutrition insights generated successfully');

            return { success: true, insights };

        } catch (error) {
            console.error('❌ DataIntegration: Failed to generate nutrition insights:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate insights'
            };
        }
    }

    /**
     * Get comprehensive progress data for analytics
     */
    public async getProgressAnalytics(days: number = 7): Promise<any> {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const progressHistory = await unifiedCache.getProgressHistory(startDate, endDate);

            // Calculate averages and trends
            const analytics = {
                averageCalories: 0,
                averageProtein: 0,
                averageHydration: 0,
                streakDays: 0,
                totalMealsCompleted: 0,
                progressHistory,
            };

            const dataPoints = Object.values(progressHistory);
            if (dataPoints.length > 0) {
                analytics.averageCalories = dataPoints.reduce((sum, day) => sum + day.calories_eaten, 0) / dataPoints.length;
                analytics.averageProtein = dataPoints.reduce((sum, day) => sum + day.macros_eaten.protein, 0) / dataPoints.length;
                analytics.averageHydration = dataPoints.reduce((sum, day) => sum + day.water_intake_ml, 0) / dataPoints.length;
                analytics.totalMealsCompleted = dataPoints.reduce((sum, day) => sum + day.meals_completed, 0);
            }

            return analytics;

        } catch (error) {
            console.error('❌ DataIntegration: Failed to get progress analytics:', error);
            return null;
        }
    }

    // Private helper methods

    /**
     * Migrate data from legacy AsyncStorage to unified cache
     * Now handles legacy English field names and converts to Indonesian
     */
    private async migrateLegacyData(): Promise<void> {
        try {
            console.log('🔄 DataIntegration: Checking for legacy data to migrate');

            const cache = await unifiedCache.getCache();

            // Check if we already have proper API format data
            if (cache.user_data && 'nama' in cache.user_data && cache.personal_plan && 'kebutuhan_kalori' in cache.personal_plan) {
                console.log('✅ Data already in correct API format');
                return;
            }

            const userProfileData = await AsyncStorage.getItem('userProfile');
            const nutritionPlanData = await AsyncStorage.getItem('nutritionPlan');

            if (userProfileData && nutritionPlanData) {
                console.log('📦 Found legacy data, migrating to unified cache...');

                const legacyProfile = JSON.parse(userProfileData);
                const legacyPlan = JSON.parse(nutritionPlanData);

                // Convert legacy English field names to Indonesian API format
                const userData: UserData = {
                    nama: legacyProfile.name || legacyProfile.nama || '',
                    usia: legacyProfile.age || legacyProfile.usia || 0,
                    jenis_kelamin: legacyProfile.gender || legacyProfile.jenis_kelamin || '',
                    berat_badan: legacyProfile.weight || legacyProfile.berat_badan || 0,
                    tinggi_badan: legacyProfile.height || legacyProfile.tinggi_badan || 0,
                    tingkat_aktivitas: legacyProfile.activityLevel || legacyProfile.tingkat_aktivitas || '',
                    catatan_aktivitas: legacyProfile.activityNotes || legacyProfile.catatan_aktivitas || null,
                    waktu_bangun: legacyProfile.wakeTime || legacyProfile.waktu_bangun || '06:00',
                    waktu_tidur: legacyProfile.sleepTime || legacyProfile.waktu_tidur || '22:00',
                    preferensi_makanan: legacyProfile.foodPreferences || legacyProfile.preferensi_makanan || null,
                    alergi_makanan: legacyProfile.allergies || legacyProfile.alergi_makanan || null,
                    kondisi_kesehatan: legacyProfile.healthConditions || legacyProfile.kondisi_kesehatan || null,
                    tujuan: legacyProfile.goal || legacyProfile.tujuan || '',
                };

                // Convert legacy nutrition plan to API format
                const personalPlan: PersonalPlan = {
                    kebutuhan_kalori: {
                        total_harian: legacyPlan.calories || legacyPlan.kalori || 2000
                    },
                    kebutuhan_makronutrisi: {
                        protein: legacyPlan.macros?.protein || legacyPlan.makronutrisi?.protein || 150,
                        karbohidrat: legacyPlan.macros?.carbs || legacyPlan.makronutrisi?.karbohidrat || 250,
                        lemak: legacyPlan.macros?.fat || legacyPlan.makronutrisi?.lemak || 70,
                        serat: legacyPlan.macros?.fiber || legacyPlan.makronutrisi?.serat || 25
                    },
                    kebutuhan_mikronutrisi: legacyPlan.vitamins || legacyPlan.vitamin || {},
                    batasi_konsumsi: legacyPlan.limits || legacyPlan.batasan || {},
                    kebutuhan_cairan: {
                        harian_liter: legacyPlan.hydration?.liters || legacyPlan.hidrasi?.liter || 2.0
                    },
                    catatan: legacyPlan.notes || legacyPlan.catatan || 'Migrated from legacy data'
                };

                console.log('🔄 Converted legacy data to API format:', {
                    userData: { nama: userData.nama, usia: userData.usia, jenis_kelamin: userData.jenis_kelamin },
                    personalPlan: { kebutuhan_kalori: personalPlan.kebutuhan_kalori }
                });

                await unifiedCache.updateUserProfile(userData, personalPlan);

                console.log('✅ Legacy data migrated successfully');
            } else {
                console.log('ℹ️ No legacy data found to migrate');
            }

        } catch (error) {
            console.error('❌ Error migrating legacy data:', error);
        }
    }

    /**
     * Verify data integrity and completeness
     */
    private async verifyDataIntegrity(): Promise<void> {
        try {
            console.log('🔍 DataIntegration: Verifying data integrity');

            const cache = await unifiedCache.getCache();

            // Check if user has completed onboarding
            if (!cache.user_data || !cache.personal_plan) {
                console.log('⚠️ User onboarding incomplete');
                return;
            }

            // Verify API format data (Indonesian field names)
            if ('nama' in cache.user_data) {
                console.log('📊 Verifying API format data...');
                const apiUserData = cache.user_data as UserData;

                const requiredApiFields = ['nama', 'usia', 'jenis_kelamin', 'berat_badan', 'tinggi_badan', 'tujuan'];
                const missingFields: string[] = [];

                for (const field of requiredApiFields) {
                    if (!apiUserData[field as keyof UserData]) {
                        missingFields.push(field);
                    }
                }

                if (missingFields.length > 0) {
                    console.warn(`⚠️ Missing required user data fields: ${missingFields.join(', ')}`);
                    console.log('🔄 Attempting to fix missing data...');
                    await this.migrateLegacyData();
                } else {
                    console.log('✅ All required user data fields present');
                }

                // Verify personal plan (API format)
                if ('kebutuhan_kalori' in cache.personal_plan) {
                    const apiPersonalPlan = cache.personal_plan as PersonalPlan;
                    if (!apiPersonalPlan.kebutuhan_kalori) {
                        console.warn('⚠️ Missing calorie requirements in personal plan');
                    } else {
                        console.log('✅ Personal plan has calorie requirements');
                    }
                } else {
                    console.warn('⚠️ Personal plan not in API format');
                }

            } else if ('name' in cache.user_data) {
                // Legacy format detected - trigger migration
                console.warn('⚠️ Legacy user data format detected - triggering migration');
                await this.migrateLegacyData();

            } else {
                console.error('❌ Unknown user data format');
                return;
            }

            console.log('✅ Data integrity verification completed');

        } catch (error) {
            console.error('❌ Error verifying data integrity:', error);
        }
    }

    /**
     * Public method to manually fix data integrity issues
     */
    public async fixDataIntegrity(): Promise<{ success: boolean; message: string }> {
        try {
            console.log('� DataIntegration: Manually fixing data integrity');

            await this.migrateLegacyData();
            await this.verifyDataIntegrity();

            return {
                success: true,
                message: 'Data integrity fixed successfully'
            };
        } catch (error) {
            console.error('❌ Error fixing data integrity:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Get current data status for debugging
     */
    public async getDataStatus(): Promise<{
        hasUserData: boolean;
        hasPersonalPlan: boolean;
        userDataFormat: 'indonesian' | 'english' | 'unknown';
        personalPlanFormat: 'api' | 'legacy' | 'unknown';
        missingFields: string[];
        recommendations: string[];
    }> {
        try {
            const cache = await unifiedCache.getCache();

            const status = {
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                userDataFormat: 'unknown' as 'indonesian' | 'english' | 'unknown',
                personalPlanFormat: 'unknown' as 'api' | 'legacy' | 'unknown',
                missingFields: [] as string[],
                recommendations: [] as string[]
            };

            if (cache.user_data) {
                if ('nama' in cache.user_data) {
                    status.userDataFormat = 'indonesian';
                    const userData = cache.user_data as UserData;
                    const requiredFields = ['nama', 'usia', 'jenis_kelamin', 'berat_badan', 'tinggi_badan', 'tujuan'];

                    for (const field of requiredFields) {
                        if (!userData[field as keyof UserData]) {
                            status.missingFields.push(field);
                        }
                    }
                } else if ('name' in cache.user_data) {
                    status.userDataFormat = 'english';
                    status.recommendations.push('Convert user data from English to Indonesian format');
                }
            } else {
                status.recommendations.push('Complete user onboarding to create user profile');
            }

            if (cache.personal_plan) {
                if ('kebutuhan_kalori' in cache.personal_plan) {
                    status.personalPlanFormat = 'api';
                } else if ('calories' in cache.personal_plan) {
                    status.personalPlanFormat = 'legacy';
                    status.recommendations.push('Convert personal plan from legacy to API format');
                }
            } else {
                status.recommendations.push('Generate personal nutrition plan');
            }

            if (status.missingFields.length > 0) {
                status.recommendations.push(`Complete missing user data fields: ${status.missingFields.join(', ')}`);
            }

            return status;

        } catch (error) {
            console.error('❌ Error getting data status:', error);
            return {
                hasUserData: false,
                hasPersonalPlan: false,
                userDataFormat: 'unknown',
                personalPlanFormat: 'unknown',
                missingFields: [],
                recommendations: ['Error getting data status - check cache integrity']
            };
        }
    }

    /**
     * Generate insight summary based on progress
     */
    private generateInsightSummary(calorieProgress: number, proteinProgress: number, hydrationProgress: number): string {
        if (calorieProgress >= 80 && proteinProgress >= 80 && hydrationProgress >= 70) {
            return "Excellent! You're on track with your nutrition goals today.";
        } else if (calorieProgress >= 60 && proteinProgress >= 60) {
            return "Good progress! You're making steady advancement toward your goals.";
        } else if (calorieProgress < 40) {
            return "You need to eat more to meet your calorie goals for today.";
        } else {
            return "Keep it up! You're making progress toward your nutrition goals.";
        }
    }

    /**
     * Generate personalized advice
     */
    private generateAdvice(dayCache: any): string[] {
        const advice: string[] = [];
        const progress = dayCache.progress;

        if (progress.calories_eaten < progress.calories_target * 0.5) {
            advice.push("Consider adding a nutritious snack to reach your calorie goal.");
        }

        if (progress.macros_eaten.protein < progress.macros_target.protein * 0.6) {
            advice.push("Include more protein-rich foods like eggs, fish, or legumes.");
        }

        if (progress.water_intake_ml < progress.water_target_ml * 0.6) {
            advice.push("Increase your water intake to stay properly hydrated.");
        }

        return advice;
    }

    /**
     * Generate health warnings
     */
    private generateWarnings(dayCache: any): string[] {
        const warnings: string[] = [];
        const progress = dayCache.progress;

        if (progress.calories_eaten > progress.calories_target * 1.2) {
            warnings.push("You've exceeded your daily calorie target. Consider lighter meals.");
        }

        if (progress.meals_completed < 2 && new Date().getHours() > 14) {
            warnings.push("You've only completed one meal today. Don't skip meals!");
        }

        return warnings;
    }

    /**
     * Generate achievements
     */
    private generateAchievements(dayCache: any): string[] {
        const achievements: string[] = [];
        const progress = dayCache.progress;

        if (progress.water_intake_ml >= progress.water_target_ml) {
            achievements.push("🎉 Daily hydration goal achieved!");
        }

        if (progress.meals_completed >= 4) {
            achievements.push("🍽️ Great job eating regular meals today!");
        }

        if (progress.macros_eaten.protein >= progress.macros_target.protein) {
            achievements.push("💪 Protein goal reached!");
        }

        return achievements;
    }

    /**
     * Get next meal suggestion
     */
    private getNextMealSuggestion(dayCache: any): string | undefined {
        const hour = new Date().getHours();

        if (hour < 9) {
            return "Start your day with a nutritious breakfast!";
        } else if (hour < 12) {
            return "A healthy mid-morning snack could boost your energy.";
        } else if (hour < 15) {
            return "Time for a balanced lunch to fuel your afternoon.";
        } else if (hour < 18) {
            return "Consider a light afternoon snack if you're feeling hungry.";
        } else {
            return "Plan a light dinner that's easy to digest.";
        }
    }
}

// Export singleton instance
export const dataIntegration = DataIntegrationService.getInstance();
