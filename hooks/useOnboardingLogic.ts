import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { mapPersonalPlanToNutritionPlan, mapUserProfileToApiData } from '../services/dataMapper';
import { generatePersonalPlanWithRetry, PersonalPlanAPIError } from '../services/personalPlanAPI';
import { defaultProfile, steps, UserProfile, validateAge, validateHeight, validateTime, validateWeight } from './onboardingTypes';

export const useOnboardingLogic = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0:
                if (profile.name.trim() === '') {
                    Alert.alert('Validation Error', 'Please enter your name.');
                    return false;
                }
                if (!validateAge(profile.age)) {
                    Alert.alert('Validation Error', 'Please enter a valid age (1-120 years).');
                    return false;
                }
                if (profile.gender === '') {
                    Alert.alert('Validation Error', 'Please select your gender.');
                    return false;
                }
                return true;
            case 1:
                if (!validateWeight(profile.weight)) {
                    Alert.alert('Validation Error', 'Please enter a valid weight (20-500 kg).');
                    return false;
                }
                if (!validateHeight(profile.height)) {
                    Alert.alert('Validation Error', 'Please enter a valid height (50-250 cm).');
                    return false;
                }
                return true;
            case 2:
                if (profile.activityLevel === '') {
                    Alert.alert('Validation Error', 'Please select your activity level.');
                    return false;
                }
                if (!validateTime(profile.wakeTime)) {
                    Alert.alert('Validation Error', 'Please enter a valid wake time (HH:MM format).');
                    return false;
                }
                if (!validateTime(profile.sleepTime)) {
                    Alert.alert('Validation Error', 'Please enter a valid sleep time (HH:MM format).');
                    return false;
                }
                return true;
            case 3:
                if (profile.goal === '') {
                    Alert.alert('Validation Error', 'Please select your goal.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const completeOnboarding = async (): Promise<void> => {
        setIsGeneratingPlan(true);
        try {
            // Save basic onboarding completion first
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('hasSeenWelcome', 'true');
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));

            console.log('🚀 Starting nutrition plan generation...');

            // Generate nutrition plan using the new API integration
            const userData = mapUserProfileToApiData(profile);
            console.log('📊 User data for API:', userData);

            // Create a promise that keeps the UI responsive during long API calls
            const generatePlanWithProgress = async () => {
                // Set up periodic UI updates to prevent freezing
                const progressInterval = setInterval(() => {
                    console.log('⏳ Still generating plan... Please wait');
                    // Force a re-render to keep loading animation active
                    setIsGeneratingPlan(true);
                }, 5000); // Update every 5 seconds

                try {
                    // Use the API service with extended timeout (60 seconds)
                    console.log('🔄 Calling API with extended timeout...');
                    const apiPlan = await generatePersonalPlanWithRetry(userData, 2, 60000); // 2 retries, 3 second delay

                    clearInterval(progressInterval);
                    return apiPlan;
                } catch (error) {
                    clearInterval(progressInterval);
                    throw error;
                }
            };

            const apiPlan = await generatePlanWithProgress();

            console.log('✅ API response received:', apiPlan);

            const mappedPlan = mapPersonalPlanToNutritionPlan(apiPlan);
            console.log('🔄 Mapped plan:', mappedPlan);

            // Save the generated plan
            await AsyncStorage.setItem('nutritionPlan', JSON.stringify(mappedPlan));
            console.log('💾 Plan saved successfully');

            // Navigate to personal screen with plan ready
            router.replace('/(tabs)/personal');
        } catch (error) {
            console.error('❌ Error during onboarding completion:', error);

            // Always ensure onboarding is marked complete
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('hasSeenWelcome', 'true');

            // Handle specific error types from the new API integration
            let errorMessage = 'There was an issue generating your nutrition plan. Your profile has been saved and you can generate the plan manually from the Personal tab.';

            if (error instanceof PersonalPlanAPIError) {
                switch (error.code) {
                    case 'VALIDATION_ERROR':
                        errorMessage = 'Please check your profile information and try generating the plan again from the Personal tab.';
                        break;
                    case 'NETWORK_ERROR':
                        errorMessage = 'Network connection issue. Your profile has been saved and you can generate the plan from the Personal tab when you have a stable connection.';
                        break;
                    case 'TIMEOUT_ERROR':
                        errorMessage = 'The nutrition plan generation is taking longer than expected. Your profile has been saved and you can generate the plan from the Personal tab.';
                        break;
                    case 'SERVER_ERROR':
                        errorMessage = 'Server error occurred. Your profile has been saved and you can try generating the plan again from the Personal tab.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            }

            Alert.alert(
                'Onboarding Completed',
                errorMessage,
                [
                    {
                        text: 'Continue to App',
                        onPress: () => router.replace('/(tabs)/personal')
                    }
                ]
            );
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const nextStep = (): void => {
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    const prevStep = (): void => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const selectGoal = (goalKey: string): void => {
        setProfile((prev: UserProfile) => ({
            ...prev,
            goal: goalKey as UserProfile['goal']
        }));
    };

    const updateProfile = (updates: Partial<UserProfile>): void => {
        setProfile((prev: UserProfile) => ({ ...prev, ...updates }));
    };

    return {
        currentStep,
        profile,
        isGeneratingPlan,
        validateCurrentStep,
        nextStep,
        prevStep,
        selectGoal,
        updateProfile,
        completeOnboarding,
    };
};
