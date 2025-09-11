/**
 * Enhanced Meal Planner Hook (Updated with Unified Cache Integration)
 * 
 * This hook provides comprehensive meal planning functionality with:
 * - Automatic daily meal plan generation
 * - Smart caching and storage management through unified cache
 * - New day detection and meal plan refresh
 * - Seamless integration with enhanced meal plan API service
 * - Connected to data integration service for comprehensive features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
    DailyMealPlan,
    mealPlanService,
    MealPlanServiceResult
} from '../../services/enhancedMealPlanAPI';
import { unifiedCache } from '../../services/unifiedCacheService';

// Define MealItem interface for the hook
export interface MealItem {
    id: string;
    type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
    timeRange: string;
    rekomendasi_menu: string;
    targetKalori: number;
    status: 'not_planned' | 'upcoming' | 'completed' | 'skipped';
    isOptional?: boolean;
    details?: {
        deskripsi: string;
        pilihan_menu: string[];
        asupan_cairan: number;
    };
}

// Helper function to convert DailyMealPlan to MealItem array
const mapMealPlanToItems = (mealPlan: DailyMealPlan): MealItem[] => {
    const items: MealItem[] = [];

    if (mealPlan.sarapan) {
        items.push({
            id: 'sarapan',
            type: 'sarapan',
            timeRange: mealPlan.sarapan.range_waktu,
            rekomendasi_menu: mealPlan.sarapan.list_pilihan_menu[0] || mealPlan.sarapan.deskripsi_rekomendasi_menu,
            targetKalori: mealPlan.sarapan.target_kalori_kcal,
            status: 'upcoming',
            isOptional: false,
            details: {
                deskripsi: mealPlan.sarapan.deskripsi_rekomendasi_menu,
                pilihan_menu: mealPlan.sarapan.list_pilihan_menu,
                asupan_cairan: mealPlan.sarapan.asupan_cairan_air_gelas,
            }
        });
    }

    if (mealPlan.snack_pagi_opsional) {
        items.push({
            id: 'snack_pagi',
            type: 'snack_pagi',
            timeRange: mealPlan.snack_pagi_opsional.range_waktu,
            rekomendasi_menu: mealPlan.snack_pagi_opsional.list_pilihan_menu[0] || mealPlan.snack_pagi_opsional.deskripsi_rekomendasi_menu,
            targetKalori: mealPlan.snack_pagi_opsional.target_kalori_kcal,
            status: 'upcoming',
            isOptional: true,
            details: {
                deskripsi: mealPlan.snack_pagi_opsional.deskripsi_rekomendasi_menu,
                pilihan_menu: mealPlan.snack_pagi_opsional.list_pilihan_menu,
                asupan_cairan: mealPlan.snack_pagi_opsional.asupan_cairan_air_gelas,
            }
        });
    }

    if (mealPlan.makan_siang) {
        items.push({
            id: 'makan_siang',
            type: 'makan_siang',
            timeRange: mealPlan.makan_siang.range_waktu,
            rekomendasi_menu: mealPlan.makan_siang.list_pilihan_menu[0] || mealPlan.makan_siang.deskripsi_rekomendasi_menu,
            targetKalori: mealPlan.makan_siang.target_kalori_kcal,
            status: 'upcoming',
            isOptional: false,
            details: {
                deskripsi: mealPlan.makan_siang.deskripsi_rekomendasi_menu,
                pilihan_menu: mealPlan.makan_siang.list_pilihan_menu,
                asupan_cairan: mealPlan.makan_siang.asupan_cairan_air_gelas,
            }
        });
    }

    if (mealPlan.snack_sore_opsional) {
        items.push({
            id: 'snack_sore',
            type: 'snack_sore',
            timeRange: mealPlan.snack_sore_opsional.range_waktu,
            rekomendasi_menu: mealPlan.snack_sore_opsional.list_pilihan_menu[0] || mealPlan.snack_sore_opsional.deskripsi_rekomendasi_menu,
            targetKalori: mealPlan.snack_sore_opsional.target_kalori_kcal,
            status: 'upcoming',
            isOptional: true,
            details: {
                deskripsi: mealPlan.snack_sore_opsional.deskripsi_rekomendasi_menu,
                pilihan_menu: mealPlan.snack_sore_opsional.list_pilihan_menu,
                asupan_cairan: mealPlan.snack_sore_opsional.asupan_cairan_air_gelas,
            }
        });
    }

    if (mealPlan.makan_malam) {
        items.push({
            id: 'makan_malam',
            type: 'makan_malam',
            timeRange: mealPlan.makan_malam.range_waktu,
            rekomendasi_menu: mealPlan.makan_malam.list_pilihan_menu[0] || mealPlan.makan_malam.deskripsi_rekomendasi_menu,
            targetKalori: mealPlan.makan_malam.target_kalori_kcal,
            status: 'upcoming',
            isOptional: false,
            details: {
                deskripsi: mealPlan.makan_malam.deskripsi_rekomendasi_menu,
                pilihan_menu: mealPlan.makan_malam.list_pilihan_menu,
                asupan_cairan: mealPlan.makan_malam.asupan_cairan_air_gelas,
            }
        });
    }

    return items;
};

/**
 * Hook state interface
 */
interface UseMealPlannerState {
    meals: MealItem[];
    selectedDate: Date;
    isGeneratingMealPlan: boolean;
    isLoadingMealPlan: boolean;
    lastError: string | null;
    lastGeneratedDate: string | null;
}

/**
 * Hook return interface
 */
interface UseMealPlannerReturn extends UseMealPlannerState {
    setSelectedDate: (date: Date) => void;
    generateMealPlan: () => Promise<void>;
    refreshMealPlan: () => Promise<void>;
    updateMealStatus: (mealId: string, status: MealItem['status']) => Promise<void>;
    getTotalCalories: () => number;
    getCompletedCalories: () => number;
    getDailyCalorieTarget: () => Promise<number>;
    clearError: () => void;
    forceNewMealPlan: () => Promise<void>;
}

/**
 * Enhanced meal planner hook with automatic daily meal plan generation
 */
export const useEnhancedMealPlanner = (): UseMealPlannerReturn => {
    const [state, setState] = useState<UseMealPlannerState>({
        meals: [],
        selectedDate: new Date(),
        isGeneratingMealPlan: false,
        isLoadingMealPlan: false,
        lastError: null,
        lastGeneratedDate: null,
    });

    /**
     * Load meal plan for a specific date
     */
    const loadMealPlanForDate = useCallback(async (date: Date) => {
        setState(prev => ({ ...prev, isLoadingMealPlan: true, lastError: null }));

        try {
            console.log(`📅 Loading meal plan for ${date.toISOString().split('T')[0]}`);

            // Add timeout for long-running operations (5 minutes to match API timeout)
            const timeoutPromise = new Promise<MealPlanServiceResult>((_, reject) => {
                setTimeout(() => reject(new Error('Meal plan generation is taking longer than expected. This may take up to 5 minutes for AI processing.')), 300000);
            });

            const loadPromise = mealPlanService.getMealPlanForDate(date);
            const result: MealPlanServiceResult = await Promise.race([loadPromise, timeoutPromise]);

            if (result.success && result.data) {
                const mealItems = mapMealPlanToItems(result.data);

                // Load any existing meal statuses from storage
                const mealItemsWithStatus = await loadMealStatuses(date, mealItems);

                setState(prev => ({
                    ...prev,
                    meals: mealItemsWithStatus,
                    isLoadingMealPlan: false,
                    lastGeneratedDate: date.toISOString().split('T')[0],
                    lastError: result.error ? `⚠️ ${result.error.message}` : null
                }));

                console.log(`✅ Meal plan loaded successfully for ${date.toISOString().split('T')[0]}`);
            } else {
                throw new Error(result.error?.message || 'Failed to load meal plan');
            }

        } catch (error) {
            console.error('❌ Error loading meal plan:', error);

            let errorMessage = 'Failed to load meal plan';
            if (error instanceof Error) {
                if (error.message.includes('onboarding') || error.message.includes('profile setup')) {
                    errorMessage = 'Please complete your profile setup in the onboarding process first.';
                } else if (error.message.includes('taking longer')) {
                    errorMessage = 'Meal plan generation is taking longer than expected. This may take up to 5 minutes for AI processing.';
                } else {
                    errorMessage = error.message;
                }
            }

            setState(prev => ({
                ...prev,
                isLoadingMealPlan: false,
                lastError: errorMessage
            }));

            // Load default meals as fallback only if not an onboarding issue
            if (!errorMessage.includes('onboarding') && !errorMessage.includes('profile setup')) {
                await loadDefaultMeals();
            }
        }
    }, []);

    /**
     * Load meal statuses from storage and merge with meal items
     */
    const loadMealStatuses = async (date: Date, mealItems: MealItem[]): Promise<MealItem[]> => {
        try {
            const dateKey = date.toISOString().split('T')[0];
            const statusData = await AsyncStorage.getItem(`mealStatus_${dateKey}`);

            if (statusData) {
                const statuses = JSON.parse(statusData);
                return mealItems.map(meal => ({
                    ...meal,
                    status: statuses[meal.id] || meal.status
                }));
            }
        } catch (error) {
            console.error('Error loading meal statuses:', error);
        }

        return mealItems;
    };

    /**
     * Save meal statuses to storage
     */
    const saveMealStatuses = async (date: Date, meals: MealItem[]): Promise<void> => {
        try {
            const dateKey = date.toISOString().split('T')[0];
            const statuses = meals.reduce((acc, meal) => {
                acc[meal.id] = meal.status;
                return acc;
            }, {} as Record<string, string>);

            await AsyncStorage.setItem(`mealStatus_${dateKey}`, JSON.stringify(statuses));
        } catch (error) {
            console.error('Error saving meal statuses:', error);
        }
    };

    /**
     * Load default meals as fallback
     */
    const loadDefaultMeals = async (): Promise<void> => {
        const defaultMealPlan = {
            sarapan: {
                range_waktu: "07:00 - 08:00",
                deskripsi_rekomendasi_menu: "Sarapan bergizi untuk memulai hari",
                list_pilihan_menu: ["Belum ada rekomendasi"],
                asupan_cairan_air_gelas: 1,
                target_kalori_kcal: 400
            },
            makan_siang: {
                range_waktu: "12:00 - 14:00",
                deskripsi_rekomendasi_menu: "Makan siang bergizi seimbang",
                list_pilihan_menu: ["Belum ada rekomendasi"],
                asupan_cairan_air_gelas: 2,
                target_kalori_kcal: 500
            },
            makan_malam: {
                range_waktu: "18:00 - 20:00",
                deskripsi_rekomendasi_menu: "Makan malam yang mudah dicerna",
                list_pilihan_menu: ["Belum ada rekomendasi"],
                asupan_cairan_air_gelas: 2,
                target_kalori_kcal: 450
            }
        } as DailyMealPlan;

        const defaultMeals = mapMealPlanToItems(defaultMealPlan);
        setState(prev => ({ ...prev, meals: defaultMeals }));
    };

    /**
     * Check if it's a new day and refresh meal plan if needed
     */
    const checkForNewDay = useCallback(async () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const selectedDateStr = state.selectedDate.toISOString().split('T')[0];

        // If we're viewing today and it's a new day, refresh the meal plan
        if (selectedDateStr === todayStr && state.lastGeneratedDate !== todayStr) {
            console.log('🆕 New day detected, refreshing meal plan');
            await loadMealPlanForDate(today);
        }
    }, [state.selectedDate, state.lastGeneratedDate, loadMealPlanForDate]);

    /**
     * Set selected date
     */
    const setSelectedDate = useCallback((date: Date) => {
        setState(prev => ({ ...prev, selectedDate: date }));
    }, []);

    /**
     * Generate new meal plan for current date
     */
    const generateMealPlan = useCallback(async () => {
        setState(prev => ({ ...prev, isGeneratingMealPlan: true, lastError: null }));

        try {
            // Load user data and personal plan
            const profileData = await AsyncStorage.getItem('userProfile');
            const planData = await AsyncStorage.getItem('nutritionPlan');

            if (!profileData || !planData) {
                Alert.alert('Error', 'Data profil atau rencana nutrisi tidak ditemukan. Silakan lengkapi onboarding terlebih dahulu.');
                return;
            }

            const userData = JSON.parse(profileData);
            const personalPlan = JSON.parse(planData);

            console.log('🍽️ Generating new meal plan...');

            // Add timeout for long-running operations (5 minutes to match API timeout)
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Meal plan generation is taking longer than expected. This may take up to 5 minutes for AI processing.')), 300000);
            });

            const generatePromise = mealPlanService.generateDailyMealPlan(userData, personalPlan);
            const result = await Promise.race([generatePromise, timeoutPromise]);

            if (result.success && result.data) {
                // Save meal plan to storage
                const dateKey = state.selectedDate.toISOString().split('T')[0];
                await AsyncStorage.setItem(`mealPlan_${dateKey}`, JSON.stringify(result.data));

                // Update UI with new meal plan
                const mealItems = mapMealPlanToItems(result.data);
                setState(prev => ({
                    ...prev,
                    meals: mealItems,
                    lastGeneratedDate: dateKey
                }));

                Alert.alert('Berhasil', 'Rencana makan harian berhasil dibuat!');
                console.log('✅ Meal plan generated and saved successfully');
            } else {
                throw new Error(result.error?.message || 'Gagal membuat rencana makan');
            }

        } catch (error) {
            console.error('❌ Error generating meal plan:', error);

            let errorMessage = 'Unknown error occurred';
            let alertMessage = 'Gagal membuat rencana makan. Silakan coba lagi.';

            if (error instanceof Error) {
                if (error.message.includes('taking longer') || error.message.includes('up to 5 minutes')) {
                    errorMessage = 'Meal plan generation is taking longer than expected. This may take up to 5 minutes for AI processing.';
                    alertMessage = 'Pemrosesan AI membutuhkan waktu lebih lama. Harap tunggu hingga 5 menit.';
                } else if (error.message.includes('onboarding') || error.message.includes('profile setup')) {
                    errorMessage = 'Please complete your profile setup in the onboarding process first.';
                    alertMessage = 'Harap lengkapi profil Anda di tahap onboarding terlebih dahulu.';
                } else {
                    errorMessage = error.message;
                }
            }

            setState(prev => ({ ...prev, lastError: errorMessage }));
            Alert.alert('Error', alertMessage);
        } finally {
            setState(prev => ({ ...prev, isGeneratingMealPlan: false }));
        }
    }, [state.selectedDate]);

    /**
     * Refresh meal plan for current date
     */
    const refreshMealPlan = useCallback(async () => {
        await loadMealPlanForDate(state.selectedDate);
    }, [state.selectedDate, loadMealPlanForDate]);

    /**
     * Force generation of new meal plan (bypassing cache)
     */
    const forceNewMealPlan = useCallback(async () => {
        try {
            // Clear existing meal plan for the date
            const dateKey = state.selectedDate.toISOString().split('T')[0];
            await AsyncStorage.removeItem(`mealPlan_${dateKey}`);

            // Generate new meal plan
            await generateMealPlan();
        } catch (error) {
            console.error('Error forcing new meal plan:', error);
            Alert.alert('Error', 'Gagal membuat rencana makan baru. Silakan coba lagi.');
        }
    }, [state.selectedDate, generateMealPlan]);

    /**
     * Update meal status
     */
    const updateMealStatus = useCallback(async (mealId: string, status: MealItem['status']) => {
        const updatedMeals = state.meals.map(meal =>
            meal.id === mealId ? { ...meal, status } : meal
        );

        setState(prev => ({ ...prev, meals: updatedMeals }));

        // Save meal statuses
        await saveMealStatuses(state.selectedDate, updatedMeals);

        console.log(`📝 Updated meal ${mealId} status to ${status}`);
    }, [state.meals, state.selectedDate]);

    /**
     * Get total calories for the day
     */
    const getTotalCalories = useCallback((): number => {
        return state.meals.reduce((total, meal) => total + meal.targetKalori, 0);
    }, [state.meals]);

    /**
     * Get completed calories for the day
     */
    const getCompletedCalories = useCallback((): number => {
        return state.meals
            .filter(meal => meal.status === 'completed')
            .reduce((total, meal) => total + meal.targetKalori, 0);
    }, [state.meals]);

    /**
     * Clear last error
     */
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, lastError: null }));
    }, []);

    /**
     * Get daily calorie target from personal plan
     */
    const getDailyCalorieTarget = useCallback(async (): Promise<number> => {
        try {
            await unifiedCache.initializeCache();
            const cache = await unifiedCache.getCache();

            if (cache.personal_plan?.kebutuhan_kalori) {
                // Try to extract daily calorie target from personal plan
                const kaloriData = cache.personal_plan.kebutuhan_kalori;

                // Handle different possible formats
                if (typeof kaloriData === 'number') {
                    return kaloriData;
                } else if (typeof kaloriData === 'object' && kaloriData.harian) {
                    return kaloriData.harian;
                } else if (typeof kaloriData === 'object' && kaloriData.daily) {
                    return kaloriData.daily;
                } else if (typeof kaloriData === 'string') {
                    // Try to extract number from string like "2000 kalori per hari"
                    const match = kaloriData.match(/(\d+)/);
                    if (match) {
                        return parseInt(match[1], 10);
                    }
                }
            }

            // Fallback: calculate from meal targets
            return getTotalCalories();
        } catch (error) {
            console.error('❌ Error getting daily calorie target:', error);
            return getTotalCalories(); // Fallback to meal targets
        }
    }, [getTotalCalories]);

    // Initialize and load meal plan when date changes
    useEffect(() => {
        loadMealPlanForDate(state.selectedDate);
    }, [state.selectedDate, loadMealPlanForDate]);

    // Check for new day on app focus/resume
    useEffect(() => {
        checkForNewDay();
    }, [checkForNewDay]);

    return {
        ...state,
        setSelectedDate,
        generateMealPlan,
        refreshMealPlan,
        updateMealStatus,
        getTotalCalories,
        getCompletedCalories,
        getDailyCalorieTarget,
        clearError,
        forceNewMealPlan,
    };
};

// Export the enhanced hook as default and also keep the original name for backward compatibility
export const useMealPlanner = useEnhancedMealPlanner;
export default useEnhancedMealPlanner;
