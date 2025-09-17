/**
 * Data Debug Utility
 * 
 * Simplified utility to debug the individual meal planning system data.
 * 
 * Usage:
 * import { dataDebugger } from './utils/dataDebugger';
 * 
 * // Check current cache status
 * const status = await dataDebugger.checkCacheStatus();
 * console.log('Cache Status:', status);
 * 
 * // Show cache contents
 * await dataDebugger.showCacheContents();
 */

import { individualMealPlanService } from '../services/individualMealPlanAPI';
import { unifiedCache } from '../services/unifiedCacheService';

export class DataDebugger {
    /**
     * Check current cache status
     */
    async checkCacheStatus() {
        console.log('🔍 Checking cache status...');

        try {
            await unifiedCache.initializeCache();
            const cache = await unifiedCache.getCache();

            const status = {
                hasUserData: !!cache.user_data,
                hasPersonalPlan: !!cache.personal_plan,
                dailyCacheKeys: Object.keys(cache.daily_cache),
                cacheInitialized: true
            };

            console.log('📊 Cache Status Report:');
            console.log(`├─ User Data: ${status.hasUserData ? '✅' : '❌'}`);
            console.log(`├─ Personal Plan: ${status.hasPersonalPlan ? '✅' : '❌'}`);
            console.log(`├─ Daily Cache Keys: ${status.dailyCacheKeys.length} entries`);
            console.log(`└─ Cache Initialized: ${status.cacheInitialized ? '✅' : '❌'}`);

            return status;

        } catch (error) {
            console.error('❌ Error checking cache status:', error);
            return null;
        }
    }

    /**
     * Show cache contents for debugging
     */
    async showCacheContents() {
        console.log('📦 Current cache contents:');

        try {
            const cache = await unifiedCache.getCache();

            console.log('\n👤 User Data:');
            if (cache.user_data) {
                const userData = cache.user_data as any;
                if ('nama' in userData) {
                    console.log(`├─ Nama: ${userData.nama}`);
                    console.log(`├─ Usia: ${userData.usia}`);
                    console.log(`├─ Jenis Kelamin: ${userData.jenis_kelamin}`);
                    console.log(`├─ Berat Badan: ${userData.berat_badan} kg`);
                    console.log(`├─ Tinggi Badan: ${userData.tinggi_badan} cm`);
                    console.log(`└─ Tujuan: ${userData.tujuan}`);
                } else {
                    console.log('└─ User data exists but format unknown');
                }
            } else {
                console.log('└─ No user data found');
            }

            console.log('\n📋 Personal Plan:');
            if (cache.personal_plan) {
                const plan = cache.personal_plan as any;
                if ('kebutuhan_kalori' in plan) {
                    console.log(`└─ Kebutuhan Kalori: ${JSON.stringify(plan.kebutuhan_kalori)}`);
                } else {
                    console.log('└─ Personal plan exists but format unknown');
                }
            } else {
                console.log('└─ No personal plan found');
            }

            console.log('\n�️ Daily Cache:');
            const dailyCacheKeys = Object.keys(cache.daily_cache);
            if (dailyCacheKeys.length > 0) {
                console.log(`├─ Dates cached: ${dailyCacheKeys.length}`);
                dailyCacheKeys.forEach((dateKey: string, index: number) => {
                    const isLast = index === dailyCacheKeys.length - 1;
                    console.log(`${isLast ? '└─' : '├─'} ${dateKey}`);
                });
            } else {
                console.log('└─ No daily cache entries');
            }

            return cache;

        } catch (error) {
            console.error('❌ Error showing cache contents:', error);
            return null;
        }
    }

    /**
     * Check individual meals for a specific date
     */
    async checkIndividualMeals(date: Date = new Date()) {
        console.log(`🍽️ Checking individual meals for ${date.toDateString()}...`);

        try {
            const meals = await individualMealPlanService.getIndividualMealsForDate(date);

            console.log(`📊 Found ${meals.length} individual meals:`);
            meals.forEach((meal, index) => {
                const isLast = index === meals.length - 1;
                console.log(`${isLast ? '└─' : '├─'} ${meal.type}: ${meal.description} (${meal.targetCalories} kcal)`);
            });

            return meals;

        } catch (error) {
            console.error('❌ Error checking individual meals:', error);
            return [];
        }
    }

    /**
     * Complete debugging workflow
     */
    async runCompleteCheck() {
        console.log('🔍 Running complete data debugging workflow...\n');

        // 1. Show current cache
        await this.showCacheContents();

        console.log('\n' + '='.repeat(50) + '\n');

        // 2. Check cache status
        const status = await this.checkCacheStatus();

        console.log('\n' + '='.repeat(50) + '\n');

        // 3. Check individual meals
        await this.checkIndividualMeals();

        console.log('\n✅ Complete check finished!\n');

        return status;
    }

    /**
     * Clear all cache data for testing
     */
    async clearAllCache() {
        console.log('�️ Clearing all cache data...');

        try {
            await unifiedCache.clearCache();
            console.log('✅ Cache cleared successfully');
            return true;
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            return false;
        }
    }
}

// Export singleton instance
export const dataDebugger = new DataDebugger();
