/**
 * Data Debug Utility
 * 
 * Use this utility to check and debug your app's data integrity after the Indonesian standardization.
 * 
 * Usage:
 * import { dataDebugger } from './utils/dataDebugger';
 * 
 * // Check current data status
 * const status = await dataDebugger.checkDataStatus();
 * console.log('Data Status:', status);
 * 
 * // Fix data integrity issues
 * const result = await dataDebugger.fixDataIssues();
 * console.log('Fix Result:', result);
 */

import { dataIntegration } from '../services/dataIntegrationService';
import { unifiedCache } from '../services/unifiedCacheService';

export class DataDebugger {
    /**
     * Check current data status and get recommendations
     */
    async checkDataStatus() {
        console.log('🔍 Checking data status...');

        try {
            const status = await dataIntegration.getDataStatus();

            console.log('📊 Data Status Report:');
            console.log(`├─ User Data: ${status.hasUserData ? '✅' : '❌'} (Format: ${status.userDataFormat})`);
            console.log(`├─ Personal Plan: ${status.hasPersonalPlan ? '✅' : '❌'} (Format: ${status.personalPlanFormat})`);

            if (status.missingFields.length > 0) {
                console.log(`├─ Missing Fields: ⚠️ ${status.missingFields.join(', ')}`);
            } else {
                console.log('├─ Missing Fields: ✅ None');
            }

            if (status.recommendations.length > 0) {
                console.log('└─ Recommendations:');
                status.recommendations.forEach((rec, index) => {
                    const isLast = index === status.recommendations.length - 1;
                    console.log(`   ${isLast ? '└─' : '├─'} ${rec}`);
                });
            } else {
                console.log('└─ Recommendations: ✅ All good!');
            }

            return status;

        } catch (error) {
            console.error('❌ Error checking data status:', error);
            return null;
        }
    }

    /**
     * Fix data integrity issues
     */
    async fixDataIssues() {
        console.log('🔧 Attempting to fix data issues...');

        try {
            const result = await dataIntegration.fixDataIntegrity();

            if (result.success) {
                console.log('✅ Data issues fixed successfully!');
                // Re-check status after fix
                console.log('\n📊 Updated status:');
                await this.checkDataStatus();
            } else {
                console.log('❌ Failed to fix data issues:', result.message);
            }

            return result;

        } catch (error) {
            console.error('❌ Error fixing data issues:', error);
            return { success: false, message: 'Error occurred while fixing data' };
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
                console.log('├─ Format:', 'nama' in cache.user_data ? 'Indonesian ✅' : 'English ⚠️');
                if ('nama' in cache.user_data) {
                    const userData = cache.user_data as any;
                    console.log(`├─ Nama: ${userData.nama}`);
                    console.log(`├─ Usia: ${userData.usia}`);
                    console.log(`├─ Jenis Kelamin: ${userData.jenis_kelamin}`);
                    console.log(`├─ Berat Badan: ${userData.berat_badan} kg`);
                    console.log(`├─ Tinggi Badan: ${userData.tinggi_badan} cm`);
                    console.log(`└─ Tujuan: ${userData.tujuan}`);
                } else if ('name' in cache.user_data) {
                    const userData = cache.user_data as any;
                    console.log(`├─ Name: ${userData.name}`);
                    console.log(`├─ Age: ${userData.age}`);
                    console.log(`├─ Gender: ${userData.gender}`);
                    console.log(`├─ Weight: ${userData.weight} kg`);
                    console.log(`├─ Height: ${userData.height} cm`);
                    console.log(`└─ Goal: ${userData.goal}`);
                }
            } else {
                console.log('└─ No user data found');
            }

            console.log('\n📋 Personal Plan:');
            if (cache.personal_plan) {
                console.log('├─ Format:', 'kebutuhan_kalori' in cache.personal_plan ? 'API ✅' : 'Legacy ⚠️');
                if ('kebutuhan_kalori' in cache.personal_plan) {
                    const plan = cache.personal_plan as any;
                    console.log(`└─ Kebutuhan Kalori: ${JSON.stringify(plan.kebutuhan_kalori)}`);
                } else if ('calories' in cache.personal_plan) {
                    const plan = cache.personal_plan as any;
                    console.log(`└─ Calories: ${plan.calories}`);
                }
            } else {
                console.log('└─ No personal plan found');
            }

            return cache;

        } catch (error) {
            console.error('❌ Error showing cache contents:', error);
            return null;
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

        // 2. Check data status
        const status = await this.checkDataStatus();

        console.log('\n' + '='.repeat(50) + '\n');

        // 3. Fix issues if any
        if (status && (status.userDataFormat !== 'indonesian' || status.personalPlanFormat !== 'api' || status.missingFields.length > 0)) {
            console.log('🔧 Issues detected, attempting to fix...\n');
            await this.fixDataIssues();
        } else {
            console.log('✅ No issues detected, data is in good shape!\n');
        }

        return status;
    }
}

// Export singleton instance
export const dataDebugger = new DataDebugger();
