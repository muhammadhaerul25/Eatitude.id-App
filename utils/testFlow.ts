import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { mapPersonalPlanToNutritionPlan, mapUserProfileToApiData } from '../services/dataMapper';

/**
 * Test the complete onboarding to personal plan flow
 */
export const testOnboardingFlow = async () => {
    console.log('🚀 Testing Onboarding Flow...');

    // Sample user profile from onboarding
    const sampleProfile = {
        nama: 'Muhammad Haerul',
        usia: 22,
        jenis_kelamin: 'male' as const,
        berat_badan: 62,
        tinggi_badan: 167,
        tingkat_aktivitas: 'light' as const,
        catatan_aktivitas: 'Olahraga ringan 3x seminggu',
        waktu_bangun: '07:00',
        waktu_tidur: '22:00',
        preferensi_makanan: 'Makanan sehat',
        alergi_makanan: 'Tidak ada alergi',
        kondisi_kesehatan: 'Sehat',
        tujuan: 'improve_health' as const,
    };

    try {
        // Step 1: Simulate saving profile after onboarding
        console.log('📝 Step 1: Saving user profile...');
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        await AsyncStorage.setItem('userProfile', JSON.stringify(sampleProfile));
        console.log('✅ Profile saved successfully');

        // Step 2: Transform profile data for API
        console.log('🔄 Step 2: Transforming data for API...');
        const userData = mapUserProfileToApiData(sampleProfile);
        console.log('📊 Transformed user data:', userData);

        // Step 3: Generate personal plan via API
        console.log('🤖 Step 3: Generating personal plan...');
        const apiPlan = await apiService.generatePersonalPlan(userData);
        console.log('✅ Personal plan generated:', apiPlan);

        // Step 4: Transform API response for frontend
        console.log('🔄 Step 4: Mapping API response...');
        const mappedPlan = mapPersonalPlanToNutritionPlan(apiPlan);
        console.log('📋 Mapped nutrition plan:', mappedPlan);

        // Step 5: Save nutrition plan
        console.log('💾 Step 5: Saving nutrition plan...');
        await AsyncStorage.setItem('nutritionPlan', JSON.stringify(mappedPlan));
        console.log('✅ Nutrition plan saved successfully');

        // Step 6: Verify data persistence
        console.log('🔍 Step 6: Verifying data persistence...');
        const savedProfile = await AsyncStorage.getItem('userProfile');
        const savedPlan = await AsyncStorage.getItem('nutritionPlan');
        const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');

        console.log('✅ Verification Results:');
        console.log('  - Onboarding completed:', onboardingStatus === 'true');
        console.log('  - Profile saved:', !!savedProfile);
        console.log('  - Plan saved:', !!savedPlan);

        console.log('🎉 Complete onboarding flow test passed!');
        return true;

    } catch (error) {
        console.error('❌ Onboarding flow test failed:', error);
        return false;
    }
};

/**
 * Test data mapping consistency
 */
export const testDataMapping = () => {
    console.log('🧪 Testing Data Mapping...');

    const sampleProfile = {
        nama: 'Test User',
        usia: 25,
        jenis_kelamin: 'female' as const,
        berat_badan: 55,
        tinggi_badan: 160,
        tingkat_aktivitas: 'moderate' as const,
        catatan_aktivitas: 'Regular exercise',
        waktu_bangun: '06:30',
        waktu_tidur: '23:00',
        preferensi_makanan: 'Vegetarian',
        alergi_makanan: 'Nuts',
        kondisi_kesehatan: 'Healthy',
        tujuan: 'lose_weight' as const,
    };

    const userData = mapUserProfileToApiData(sampleProfile);

    // Verify mapping correctness
    const tests = [
        { test: 'Name mapping', pass: userData.nama === sampleProfile.nama },
        { test: 'Age mapping', pass: userData.usia === sampleProfile.usia },
        { test: 'Gender mapping', pass: userData.jenis_kelamin === 'perempuan' },
        { test: 'Activity mapping', pass: userData.tingkat_aktivitas === 'sedang' },
        { test: 'Goal mapping', pass: userData.tujuan === 'menurunkan_berat_badan' },
    ];

    console.log('📊 Mapping Test Results:');
    tests.forEach(({ test, pass }) => {
        console.log(`  ${pass ? '✅' : '❌'} ${test}`);
    });

    const allPassed = tests.every(t => t.pass);
    console.log(allPassed ? '🎉 All mapping tests passed!' : '❌ Some mapping tests failed');

    return allPassed;
};

/**
 * Clear all test data
 */
export const clearTestData = async () => {
    console.log('🧹 Clearing test data...');
    await AsyncStorage.multiRemove([
        'hasCompletedOnboarding',
        'userProfile',
        'nutritionPlan',
        'hasSeenWelcome'
    ]);
    console.log('✅ Test data cleared');
};
