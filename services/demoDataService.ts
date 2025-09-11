/**
 * Demo Data Setup Service
 * 
 * This service helps set up demo/sample data for testing the app
 * when user data is not available. It creates:
 * - Sample user profile
 * - Sample personal plan
 * - Sample meal plans
 * - Sample progress data
 */

import { PersonalPlan, UserData } from './api';
import { unifiedCache } from './unifiedCacheService';

export class DemoDataService {
    private static instance: DemoDataService;

    private constructor() { }

    public static getInstance(): DemoDataService {
        if (!DemoDataService.instance) {
            DemoDataService.instance = new DemoDataService();
        }
        return DemoDataService.instance;
    }

    /**
     * Setup demo data for testing
     */
    public async setupDemoData(): Promise<void> {
        try {
            console.log('🎭 DemoData: Setting up demo data for testing');

            // Create sample user data
            const sampleUserData: UserData = {
                nama: "Demo User",
                usia: 28,
                jenis_kelamin: "Laki-laki",
                berat_badan: 70,
                tinggi_badan: 175,
                tingkat_aktivitas: "Sedang",
                catatan_aktivitas: "Olahraga 3x seminggu",
                waktu_bangun: "06:00",
                waktu_tidur: "22:00",
                preferensi_makanan: "Suka sayuran, hindari makanan pedas",
                alergi_makanan: "Tidak ada",
                kondisi_kesehatan: "Sehat",
                tujuan: "Menjaga berat badan ideal"
            };

            // Create sample personal plan
            const samplePersonalPlan: PersonalPlan = {
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
                    karbohidrat: {
                        gram_per_hari: 275,
                        persentase: 50
                    },
                    protein: {
                        gram_per_hari: 110,
                        persentase: 20
                    },
                    lemak: {
                        gram_per_hari: 73,
                        persentase: 30
                    }
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
                catatan: "Rencana nutrisi untuk menjaga berat badan ideal dengan pola makan seimbang dan aktivitas fisik teratur."
            };

            // Save to unified cache
            await unifiedCache.updateUserProfile(sampleUserData, samplePersonalPlan);

            // Verify data was saved correctly
            const verificationCache = await unifiedCache.getCache();
            console.log('🔍 DemoData: Verification after save:', {
                userData: verificationCache.user_data?.nama,
                userAge: verificationCache.user_data?.usia,
                planCalories: verificationCache.personal_plan?.kebutuhan_kalori?.total_harian
            });

            if (!verificationCache.user_data || !verificationCache.personal_plan) {
                throw new Error('Failed to save demo data to cache');
            }

            // Initialize today's cache with sample progress
            const today = new Date();
            const dayCache = await unifiedCache.getDayCache(today);

            // Update progress with some sample data
            dayCache.progress.calories_eaten = 1200;
            dayCache.progress.calories_target = 2200;
            dayCache.progress.macros_eaten = {
                protein: 45,
                carbs: 150,
                fat: 40,
                fiber: 15
            };
            dayCache.progress.water_intake_ml = 1500;
            dayCache.progress.meals_completed = 2;

            // Update cache
            const cache = await unifiedCache.getCache();
            cache.daily_cache[today.toISOString().split('T')[0]] = dayCache;
            await unifiedCache.initializeCache();

            console.log('✅ DemoData: Demo data setup completed successfully');

        } catch (error) {
            console.error('❌ DemoData: Failed to setup demo data:', error);
            throw error;
        }
    }

    /**
     * Check if demo data should be setup (no existing user data)
     */
    public async shouldSetupDemoData(): Promise<boolean> {
        try {
            const cache = await unifiedCache.getCache();
            return !cache.user_data || !cache.personal_plan;
        } catch (error) {
            console.error('❌ Error checking if demo data needed:', error);
            return true;
        }
    }

    /**
     * Clear demo data and reset to fresh state
     */
    public async clearDemoData(): Promise<void> {
        try {
            console.log('🧹 DemoData: Clearing demo data');
            await unifiedCache.clearCache();
            console.log('✅ DemoData: Demo data cleared successfully');
        } catch (error) {
            console.error('❌ DemoData: Failed to clear demo data:', error);
            throw error;
        }
    }

    /**
     * Get demo status information
     */
    public async getDemoStatus(): Promise<{
        isDemoMode: boolean;
        hasUserData: boolean;
        hasPersonalPlan: boolean;
        hasMealPlan: boolean;
    }> {
        try {
            const cache = await unifiedCache.getCache();
            const today = new Date().toISOString().split('T')[0];
            const todayCache = cache.daily_cache[today];

            return {
                isDemoMode: cache.user_data?.nama === "Demo User",
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                hasMealPlan: todayCache ? Object.keys(todayCache.meal_plan).length > 0 : false
            };

        } catch (error) {
            console.error('❌ Error getting demo status:', error);
            return {
                isDemoMode: false,
                hasUserData: false,
                hasPersonalPlan: false,
                hasMealPlan: false
            };
        }
    }

    /**
     * Debug function to log current cache state
     */
    public async debugCacheState(): Promise<void> {
        try {
            const cache = await unifiedCache.getCache();
            console.log('🔍 DemoData: Current cache state:', {
                userData: cache.user_data ? {
                    name: cache.user_data.nama,
                    age: cache.user_data.usia,
                    weight: cache.user_data.berat_badan,
                    height: cache.user_data.tinggi_badan
                } : null,
                personalPlan: cache.personal_plan ? {
                    totalCalories: cache.personal_plan.kebutuhan_kalori?.total_harian,
                    hasBreakfast: !!cache.personal_plan.kebutuhan_kalori?.per_waktu_makan?.sarapan
                } : null,
                lastLogin: cache.last_login,
                dailyCacheKeys: Object.keys(cache.daily_cache || {}),
                appSettings: cache.app_settings
            });
        } catch (error) {
            console.error('❌ Error debugging cache state:', error);
        }
    }
}

// Export singleton instance
export const demoDataService = DemoDataService.getInstance();
