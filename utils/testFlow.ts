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
        name: 'Muhammad Haerul',
        age: 22,
        gender: 'male' as const,
        weight: 62,
        height: 167,
        activityLevel: 'light' as const,
        activityNotes: 'Olahraga ringan 3x seminggu',
        wakeTime: '07:00',
        sleepTime: '22:00',
        foodPreferences: 'Makanan sehat',
        allergies: 'Tidak ada alergi',
        healthConditions: 'Sehat',
        goal: 'improve_health' as const,
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
        name: 'Test User',
        age: 25,
        gender: 'female' as const,
        weight: 55,
        height: 160,
        activityLevel: 'moderate' as const,
        activityNotes: 'Regular exercise',
        wakeTime: '06:30',
        sleepTime: '23:00',
        foodPreferences: 'Vegetarian',
        allergies: 'Nuts',
        healthConditions: 'Healthy',
        goal: 'lose_weight' as const,
    };

    const userData = mapUserProfileToApiData(sampleProfile);

    // Verify mapping correctness
    const tests = [
        { test: 'Name mapping', pass: userData.nama === sampleProfile.name },
        { test: 'Age mapping', pass: userData.usia === sampleProfile.age },
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
