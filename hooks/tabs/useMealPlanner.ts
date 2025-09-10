import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../../services/api';
import { mapMealPlanToMealItems, mapUserProfileToApiData } from '../../services/dataMapper';

interface MealItem {
    id: string;
    type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
    timeRange: string;
    rekomendasi_menu: string;
    targetKalori: number;
    status: 'not_planned' | 'upcoming' | 'completed' | 'skipped';
    isOptional?: boolean;
    details?: any;
}

export const useMealPlanner = () => {
    const [meals, setMeals] = useState<MealItem[]>([]);
    const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadMealPlan();
    }, [selectedDate]);

    const loadMealPlan = async () => {
        try {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const mealPlanData = await AsyncStorage.getItem(`mealPlan_${dateKey}`);

            if (mealPlanData) {
                setMeals(JSON.parse(mealPlanData));
            } else {
                generateDefaultMeals();
            }
        } catch (error) {
            console.error('Error loading meal plan:', error);
            generateDefaultMeals();
        }
    };

    const generateDefaultMeals = () => {
        const defaultMeals: MealItem[] = [
            {
                id: '1',
                type: 'sarapan',
                timeRange: '06:00 - 08:00',
                rekomendasi_menu: 'Get Recommendation',
                targetKalori: 400,
                status: 'not_planned',
            },
            {
                id: '2',
                type: 'snack_pagi',
                timeRange: '10:00 - 11:00',
                rekomendasi_menu: 'Get Recommendation',
                targetKalori: 150,
                status: 'not_planned',
                isOptional: true,
            },
            {
                id: '3',
                type: 'makan_siang',
                timeRange: '12:00 - 14:00',
                rekomendasi_menu: 'Get Recommendation',
                targetKalori: 500,
                status: 'not_planned',
            },
            {
                id: '4',
                type: 'snack_sore',
                timeRange: '15:00 - 16:00',
                rekomendasi_menu: 'Get Recommendation',
                targetKalori: 150,
                status: 'not_planned',
                isOptional: true,
            },
            {
                id: '5',
                type: 'makan_malam',
                timeRange: '18:00 - 20:00',
                rekomendasi_menu: 'Get Recommendation',
                targetKalori: 450,
                status: 'not_planned',
            },
        ];
        setMeals(defaultMeals);
    };

    const generateMealPlan = async () => {
        setIsGeneratingMealPlan(true);
        try {
            // Load user data and personal plan
            const profileData = await AsyncStorage.getItem('userProfile');
            const planData = await AsyncStorage.getItem('nutritionPlan');

            if (!profileData || !planData) {
                Alert.alert('Error', 'Data profil atau rencana nutrisi tidak ditemukan.');
                return;
            }

            const profile = JSON.parse(profileData);
            const personalPlan = JSON.parse(planData);

            const userData = mapUserProfileToApiData(profile);
            const apiMealPlan = await apiService.generateMealPlan(userData, personalPlan);

            const mappedMeals = mapMealPlanToMealItems(apiMealPlan);
            setMeals(mappedMeals);

            // Save to storage
            const dateKey = selectedDate.toISOString().split('T')[0];
            await AsyncStorage.setItem(`mealPlan_${dateKey}`, JSON.stringify(mappedMeals));

            Alert.alert('Berhasil', 'Rencana makan harian telah dibuat!');
        } catch (error) {
            console.error('Error generating meal plan:', error);
            Alert.alert('Error', 'Gagal membuat rencana makan. Silakan coba lagi.');
        } finally {
            setIsGeneratingMealPlan(false);
        }
    };

    const updateMealStatus = async (mealId: string, status: MealItem['status']) => {
        const updatedMeals = meals.map(meal =>
            meal.id === mealId ? { ...meal, status } : meal
        );
        setMeals(updatedMeals);

        // Save to storage
        const dateKey = selectedDate.toISOString().split('T')[0];
        await AsyncStorage.setItem(`mealPlan_${dateKey}`, JSON.stringify(updatedMeals));
    };

    const getTotalCalories = () => {
        return meals.reduce((total, meal) => total + meal.targetKalori, 0);
    };

    const getCompletedCalories = () => {
        return meals
            .filter(meal => meal.status === 'completed')
            .reduce((total, meal) => total + meal.targetKalori, 0);
    };

    return {
        meals,
        selectedDate,
        setSelectedDate,
        isGeneratingMealPlan,
        generateMealPlan,
        updateMealStatus,
        getTotalCalories,
        getCompletedCalories,
    };
};

export default useMealPlanner;
