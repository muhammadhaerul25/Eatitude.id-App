import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../services/api';
import { mapPersonalPlanToNutritionPlan, mapUserProfileToApiData } from '../services/dataMapper';
import { unifiedCache } from '../services/unifiedCacheService';
import { UserProfile } from './onboardingTypes';
import { NutritionPlan } from './types';

export const usePersonalLogic = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            // First try to load from unified cache
            const cache = await unifiedCache.getCache();
            if (cache.user_data) {
                // Map UserData to UserProfile format
                const userProfile: UserProfile = {
                    nama: cache.user_data.nama,
                    usia: cache.user_data.usia,
                    jenis_kelamin: cache.user_data.jenis_kelamin as 'male' | 'female' | '',
                    berat_badan: cache.user_data.berat_badan,
                    tinggi_badan: cache.user_data.tinggi_badan,
                    tingkat_aktivitas: cache.user_data.tingkat_aktivitas as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '',
                    catatan_aktivitas: cache.user_data.catatan_aktivitas || '',
                    waktu_bangun: cache.user_data.waktu_bangun,
                    waktu_tidur: cache.user_data.waktu_tidur,
                    preferensi_makanan: cache.user_data.preferensi_makanan || '',
                    alergi_makanan: cache.user_data.alergi_makanan || '',
                    kondisi_kesehatan: cache.user_data.kondisi_kesehatan || '',
                    tujuan: cache.user_data.tujuan as 'improve_health' | 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'manage_disease' | '',
                };
                setProfile(userProfile);
                return;
            }

            // Fallback to old AsyncStorage method
            const profileData = await AsyncStorage.getItem('userProfile');
            if (profileData) {
                setProfile(JSON.parse(profileData));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }, []);

    const generateSamplePlan = useCallback(() => {
        const samplePlan: NutritionPlan = {
            kebutuhan_kalori: {
                "total_kalori_per_hari_(kcal)": 2000
            },
            kebutuhan_makronutrisi: {
                "karbohidrat_per_hari_(g)": 250,
                "protein_per_hari_(g)": 150,
                "lemak_per_hari_(g)": 70,
                "serat_per_hari_(g)": 25
            },
            kebutuhan_mikronutrisi: {
                "vitamin_a_per_hari_(mg)": 0.9,
                "vitamin_b_kompleks_per_hari_(mg)": 2.4,
                "vitamin_c_per_hari_(mg)": 90,
                "vitamin_d_per_hari_(mg)": 0.02,
                "vitamin_e_per_hari_(mg)": 15,
                "vitamin_k_per_hari_(mg)": 0.12,
                "kalsium_per_hari_(mg)": 1000,
                "zat_besi_per_hari_(mg)": 18,
                "magnesium_per_hari_(mg)": 400,
                "kalium_per_hari_(mg)": 3500,
                "natrium_per_hari_(mg)": 2300,
                "zinc_per_hari_(mg)": 11,
                "yodium_per_hari_(mg)": 0.15
            },
            batasi_konsumsi: {
                "gula_per_hari_(g)": 50,
                "garam_per_hari_(g)": 5,
                "kafein_per_hari_(mg)": 400,
                "lemak_jenuh_per_hari_(g)": 22,
                "lemak_trans_per_hari_(g)": 2,
                "kolesterol_per_hari_(mg)": 300
            },
            kebutuhan_cairan: {
                "air_per_hari_(liter)": 2.5,
                "air_per_hari_(gelas)": 10
            },
            catatan: 'Rencana ini dibuat berdasarkan profil dan tujuan Anda. Silakan tunggu validasi dari ahli gizi.'
        };
        setNutritionPlan(samplePlan);
        AsyncStorage.setItem('nutritionPlan', JSON.stringify(samplePlan));
    }, []);

    const loadNutritionPlan = useCallback(async () => {
        try {
            // First try to load from unified cache
            const cache = await unifiedCache.getCache();
            if (cache.personal_plan) {
                const mappedPlan = mapPersonalPlanToNutritionPlan(cache.personal_plan);
                setNutritionPlan(mappedPlan);
                return;
            }

            // Fallback to old AsyncStorage method
            const planData = await AsyncStorage.getItem('nutritionPlan');
            if (planData) {
                setNutritionPlan(JSON.parse(planData));
            } else {
                // Only generate sample plan if no plan exists
                // This prevents overriding plans generated during onboarding
                const profileData = await AsyncStorage.getItem('userProfile');
                if (profileData) {
                    // If user profile exists but no plan, they might have just completed onboarding
                    // Give them the option to generate a plan
                    return;
                }
                generateSamplePlan();
            }
        } catch (error) {
            console.error('Error loading nutrition plan:', error);
            generateSamplePlan();
        }
    }, [generateSamplePlan]);

    useEffect(() => {
        loadProfile();
        loadNutritionPlan();
    }, [loadProfile, loadNutritionPlan]);

    const generateNutritionPlan = async () => {
        if (!profile) {
            Alert.alert('Error', 'Profil pengguna tidak ditemukan. Silakan lengkapi profil terlebih dahulu.');
            return;
        }

        // Check if profile is complete
        if (!profile.nama || !profile.usia || !profile.berat_badan || !profile.tinggi_badan ||
            !profile.jenis_kelamin || !profile.tingkat_aktivitas || !profile.tujuan) {
            Alert.alert('Profil Tidak Lengkap', 'Silakan lengkapi semua data profil untuk menghasilkan rencana nutrisi.');
            return;
        }

        setIsGeneratingPlan(true);
        try {
            const userData = mapUserProfileToApiData(profile);
            const apiPlan = await apiService.generatePersonalPlan(userData);
            const mappedPlan = mapPersonalPlanToNutritionPlan(apiPlan);

            setNutritionPlan(mappedPlan);
            await AsyncStorage.setItem('nutritionPlan', JSON.stringify(mappedPlan));

            Alert.alert('Berhasil', 'Rencana nutrisi personal telah dibuat!');
        } catch (error) {
            console.error('Error generating nutrition plan:', error);
            Alert.alert('Error', 'Gagal membuat rencana nutrisi. Silakan coba lagi.');
            // Fall back to sample plan if API fails
            generateSamplePlan();
        } finally {
            setIsGeneratingPlan(false);
        }
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
        if (profile?.berat_badan && profile?.tinggi_badan) {
            const weight = profile.berat_badan;
            const height = profile.tinggi_badan / 100;
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
        if (profile?.waktu_bangun && profile?.waktu_tidur) {
            const [wakeHour, wakeMin] = profile.waktu_bangun.split(':').map(Number);
            const [sleepHour, sleepMin] = profile.waktu_tidur.split(':').map(Number);

            let wakeTotalMin = wakeHour * 60 + wakeMin;
            let sleepTotalMin = sleepHour * 60 + sleepMin;

            // Sleep duration = wake time - sleep time
            // But if sleep time > wake time, sleep was the previous day
            let sleepDurationMin;

            if (sleepTotalMin > wakeTotalMin) {
                // Sleep time is later in the day than wake time
                // This means sleep was previous day: (24 hours - sleep time) + wake time
                sleepDurationMin = (24 * 60) - sleepTotalMin + wakeTotalMin;
            } else {
                // Wake time is later than sleep time (same day scenario, like naps)
                sleepDurationMin = wakeTotalMin - sleepTotalMin;
            }

            const hours = Math.floor(sleepDurationMin / 60);
            const minutes = sleepDurationMin % 60;

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
                        } catch {
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
        isGeneratingPlan,
        generateNutritionPlan,
        getStatusColor,
        getStatusText,
        getBMI,
        getBMICategory,
        getSleepDuration,
        resetApp,
    };
};
