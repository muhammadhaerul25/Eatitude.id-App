import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { UserProfile, defaultProfile, steps, validateAge, validateHeight, validateTime, validateWeight } from './types';

export const useOnboardingLogic = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);

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
        try {
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            router.replace('/(tabs)/personal');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
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
        setProfile(prev => ({
            ...prev,
            goal: goalKey as UserProfile['goal']
        }));
    };

    const updateProfile = (updates: Partial<UserProfile>): void => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    return {
        currentStep,
        profile,
        validateCurrentStep,
        nextStep,
        prevStep,
        selectGoal,
        updateProfile,
        completeOnboarding,
    };
};
