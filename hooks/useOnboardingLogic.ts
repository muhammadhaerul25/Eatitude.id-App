import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { unifiedCache } from '../services/unifiedCacheService';
import { defaultProfile, steps, UserProfile, validateBeratBadan, validateTinggiBadan, validateUsia, validateWaktu } from './onboardingTypes';

export const useOnboardingLogic = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0:
                return profile.nama.trim() !== '' &&
                    validateUsia(profile.usia) &&
                    profile.jenis_kelamin !== '';
            case 1:
                return validateBeratBadan(profile.berat_badan) &&
                    validateTinggiBadan(profile.tinggi_badan);
            case 2:
                return profile.tingkat_aktivitas !== '' &&
                    validateWaktu(profile.waktu_bangun) &&
                    validateWaktu(profile.waktu_tidur);
            case 3:
                return profile.tujuan !== '';
            default:
                return true;
        }
    };

    const validateWithAlerts = (): boolean => {
        switch (currentStep) {
            case 0:
                if (profile.nama.trim() === '') {
                    Alert.alert('Validation Error', 'Silakan masukkan nama Anda.');
                    return false;
                }
                if (!validateUsia(profile.usia)) {
                    Alert.alert('Validation Error', 'Silakan masukkan usia yang valid (1-120 tahun).');
                    return false;
                }
                if (profile.jenis_kelamin === '') {
                    Alert.alert('Validation Error', 'Silakan pilih jenis kelamin Anda.');
                    return false;
                }
                return true;
            case 1:
                if (!validateBeratBadan(profile.berat_badan)) {
                    Alert.alert('Validation Error', 'Silakan masukkan berat badan yang valid (20-500 kg).');
                    return false;
                }
                if (!validateTinggiBadan(profile.tinggi_badan)) {
                    Alert.alert('Validation Error', 'Silakan masukkan tinggi badan yang valid (50-250 cm).');
                    return false;
                }
                return true;
            case 2:
                if (profile.tingkat_aktivitas === '') {
                    Alert.alert('Validation Error', 'Silakan pilih tingkat aktivitas Anda.');
                    return false;
                }
                if (!validateWaktu(profile.waktu_bangun)) {
                    Alert.alert('Validation Error', 'Silakan masukkan waktu bangun yang valid (format HH:MM).');
                    return false;
                }
                if (!validateWaktu(profile.waktu_tidur)) {
                    Alert.alert('Validation Error', 'Silakan masukkan waktu tidur yang valid (format HH:MM).');
                    return false;
                }
                return true;
            case 3:
                if (profile.tujuan === '') {
                    Alert.alert('Validation Error', 'Silakan pilih tujuan kesehatan Anda.');
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
            console.log('🚀 Starting onboarding completion with data integration service...');

            // Create onboarding data in the new format
            const onboardingData = {
                nama: profile.nama,
                usia: profile.usia || 0,
                jenis_kelamin: profile.jenis_kelamin,
                berat_badan: profile.berat_badan || 0,
                tinggi_badan: profile.tinggi_badan || 0,
                tingkat_aktivitas: profile.tingkat_aktivitas,
                catatan_aktivitas: profile.catatan_aktivitas,
                waktu_bangun: profile.waktu_bangun,
                waktu_tidur: profile.waktu_tidur,
                preferensi_makanan: profile.preferensi_makanan,
                alergi_makanan: profile.alergi_makanan,
                kondisi_kesehatan: profile.kondisi_kesehatan,
                tujuan: profile.tujuan,
            };

            console.log('📊 Onboarding data prepared:', onboardingData);

            // Save user data directly to AsyncStorage
            await AsyncStorage.setItem('userProfile', JSON.stringify(onboardingData));

            // Initialize cache and save user data
            await unifiedCache.initializeCache();
            // Update user data in cache (personal plan will be generated separately)
            await unifiedCache.updateCache((cache) => {
                cache.user_data = onboardingData;
            });

            console.log('✅ Onboarding completed successfully with user data saved');

            // Save basic onboarding completion flags
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('hasSeenWelcome', 'true');

            // Navigate to personal tab first (not main tabs)
            console.log('🚀 Navigating to personal tab for first-time setup');
            router.replace('/(tabs)/personal');

            // Navigate to personal screen with plan ready
            console.log('🚀 Navigating to personal tab');
            // router.replace('/(tabs)/personal'); // Remove this since we already navigate above
        } catch (error) {
            console.error('❌ Error during onboarding completion:', error);

            // Always ensure onboarding is marked complete so user isn't stuck
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('hasSeenWelcome', 'true');

            // Show user-friendly error message
            const errorMessage = error instanceof Error ? error.message :
                'Terjadi masalah saat menyelesaikan onboarding. Anda bisa melanjutkan dan mengatur profil dari menu Personal.';

            Alert.alert(
                'Onboarding Error',
                errorMessage,
                [
                    {
                        text: 'Lanjutkan ke Personal',
                        onPress: () => router.replace('/(tabs)/personal'),
                        style: 'default'
                    }
                ]
            );
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const nextStep = (): void => {
        if (currentStep < steps.length - 1) {
            if (!validateWithAlerts()) {
                return;
            }
            setCurrentStep(currentStep + 1);
        } else {
            if (!validateWithAlerts()) {
                return;
            }
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
            tujuan: goalKey as UserProfile['tujuan']
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
