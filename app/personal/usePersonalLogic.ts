import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { NutritionPlan, UserProfile } from './types';

export const usePersonalLogic = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);

    useEffect(() => {
        loadProfile();
        loadNutritionPlan();
    }, []);

    const loadProfile = async () => {
        try {
            const profileData = await AsyncStorage.getItem('userProfile');
            if (profileData) {
                setProfile(JSON.parse(profileData));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadNutritionPlan = async () => {
        try {
            const planData = await AsyncStorage.getItem('nutritionPlan');
            if (planData) {
                setNutritionPlan(JSON.parse(planData));
            } else {
                generateSamplePlan();
            }
        } catch (error) {
            console.error('Error loading nutrition plan:', error);
            generateSamplePlan();
        }
    };

    const generateSamplePlan = () => {
        const samplePlan: NutritionPlan = {
            status: 'waiting',
            generatedBy: 'NutriAdvisor AI',
            validatedBy: '',
            calories: 2000,
            macros: {
                carbs: 250,
                protein: 150,
                fat: 67,
                fiber: 25
            },
            vitamins: {
                vitaminA: 900,
                vitaminB: 2.4,
                vitaminC: 90,
                vitaminD: 20,
                vitaminE: 15,
                vitaminK: 120
            },
            minerals: {
                calcium: 1000,
                iron: 18,
                magnesium: 400,
                potassium: 3500,
                sodium: 2300,
                zinc: 11,
                iodine: 150
            },
            limits: {
                sugar: 'Maksimal 4 sendok makan per hari',
                salt: 'Maksimal 1 sendok teh per hari',
                caffeine: 'Maksimal 2 cangkir kopi per hari',
                saturatedFat: 'Maksimal 10% dari total energi harian (≈ 22g untuk kebutuhan 2000 kkal)',
                transFat: 'Maksimal <1% dari total energi harian (≈ 2g untuk kebutuhan 2000 kkal)',
                cholesterol: 'Maksimal 300mg per hari'
            },
            hydration: {
                liters: 2.5,
                glasses: 10
            },
            notes: 'Rencana ini dibuat berdasarkan profil dan tujuan Anda. Silakan tunggu validasi dari ahli gizi.'
        };
        setNutritionPlan(samplePlan);
        AsyncStorage.setItem('nutritionPlan', JSON.stringify(samplePlan));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting': return '#F59E0B';
            case 'approved': return '#10B981';
            case 'adjusted': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'waiting': return 'Menunggu Persetujuan';
            case 'approved': return 'Disetujui';
            case 'adjusted': return 'Disesuaikan';
            default: return 'Tidak Diketahui';
        }
    };

    const getBMI = () => {
        if (profile?.weight && profile?.height) {
            const weight = profile.weight;
            const height = profile.height / 100;
            return (weight / (height * height)).toFixed(1);
        }
        return '0.0';
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { category: 'Kurang Berat', color: '#3B82F6' };
        if (bmi < 25) return { category: 'Normal', color: '#10B981' };
        if (bmi < 30) return { category: 'Kelebihan Berat', color: '#F59E0B' };
        return { category: 'Obesitas', color: '#EF4444' };
    };

    const getSleepDuration = () => {
        if (profile?.wakeTime && profile?.sleepTime) {
            const [wakeHour, wakeMin] = profile.wakeTime.split(':').map(Number);
            const [sleepHour, sleepMin] = profile.sleepTime.split(':').map(Number);

            let wakeTotalMin = wakeHour * 60 + wakeMin;
            let sleepTotalMin = sleepHour * 60 + sleepMin;

            // If sleep time is later than wake time, it's the next day
            if (sleepTotalMin > wakeTotalMin) {
                sleepTotalMin += 24 * 60; // Add 24 hours
            }

            const diffMin = wakeTotalMin + (24 * 60) - sleepTotalMin;
            const hours = Math.floor(diffMin / 60);
            const minutes = diffMin % 60;

            return `${hours} jam ${minutes} menit`;
        }
        return '-';
    };

    const resetApp = async () => {
        Alert.alert(
            'Reset Aplikasi',
            'Ini akan menghapus semua data Anda dan kembali ke onboarding. Apakah Anda yakin?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Berhasil', 'Data aplikasi telah dihapus. Silakan restart aplikasi.');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal mereset data aplikasi.');
                        }
                    }
                }
            ]
        );
    };

    return {
        profile,
        nutritionPlan,
        getStatusColor,
        getStatusText,
        getBMI,
        getBMICategory,
        getSleepDuration,
        resetApp,
    };
};
