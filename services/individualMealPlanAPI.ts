/**
 * Individual Meal Plan API Service
 * 
 * Service for generating individual meal plans (single meal type) based on user preferences and budget
 */

import { PersonalPlan, UserData } from './api';
import { unifiedCache } from './unifiedCacheService';

// Use the same API base URL as the main API service
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Request body for individual meal plan generation
 */
export interface IndividualMealPlanRequest {
    meal_type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
    preference: string;
    budget: 'rendah' | 'sedang' | 'tinggi';
    user_data?: UserData;
    personal_plan?: PersonalPlan;
}

/**
 * Individual meal menu option
 */
export interface MealMenuOption {
    nama_menu: string;
    deskripsi: string;
    'target_kalori_(kcal)': number;
    'harga_(idr)': number;
}

/**
 * Individual meal plan response
 */
export interface IndividualMealPlan {
    meal_type: string;
    range_waktu: string;
    deskripsi_rekomendasi_menu: string;
    list_pilihan_menu: MealMenuOption[];
    'asupan_cairan_(air_gelas)': number;
    'target_kalori_(kcal)': number;
}

/**
 * Frontend meal item for individual meals
 */
export interface IndividualMealItem {
    id: string;
    type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
    timeRange: string;
    description: string;
    targetCalories: number;
    waterIntake: number;
    menuOptions: {
        name: string;
        description: string;
        calories: number;
        price: number;
    }[];
    status: 'planned' | 'completed' | 'skipped';
    selectedOption?: {
        name: string;
        description: string;
        calories: number;
        price: number;
    };
    dateAdded: string;
}

/**
 * Service for managing individual meal plans
 */
class IndividualMealPlanService {
    /**
     * Generate mock meal plan for testing when backend is not available
     */
    private generateMockMealPlan(request: IndividualMealPlanRequest): IndividualMealPlan {
        const mealTypeData = {
            sarapan: { time: '07.00–08.00', baseCalories: 400 },
            snack_pagi: { time: '10.00–10.30', baseCalories: 150 },
            makan_siang: { time: '12.00–13.00', baseCalories: 500 },
            snack_sore: { time: '15.00–15.30', baseCalories: 150 },
            makan_malam: { time: '18.30–20.00', baseCalories: 450 }
        };

        const budgetMultiplier = {
            rendah: 0.7,
            sedang: 1.0,
            tinggi: 1.5
        };

        const mealData = mealTypeData[request.meal_type as keyof typeof mealTypeData] || mealTypeData.sarapan;
        const priceMultiplier = budgetMultiplier[request.budget as keyof typeof budgetMultiplier] || 1.0;

        const mockMenus: MealMenuOption[] = [
            {
                nama_menu: `Menu 1 - ${request.meal_type}`,
                deskripsi: `Menu sehat ${request.preference || 'berdasarkan preferensi Anda'}`,
                'target_kalori_(kcal)': Math.round(mealData.baseCalories * 0.8),
                'harga_(idr)': Math.round(15000 * priceMultiplier)
            },
            {
                nama_menu: `Menu 2 - ${request.meal_type}`,
                deskripsi: `Menu bergizi ${request.preference || 'sesuai kebutuhan'}`,
                'target_kalori_(kcal)': Math.round(mealData.baseCalories * 1.0),
                'harga_(idr)': Math.round(20000 * priceMultiplier)
            },
            {
                nama_menu: `Menu 3 - ${request.meal_type}`,
                deskripsi: `Menu premium ${request.preference || 'dengan kualitas terbaik'}`,
                'target_kalori_(kcal)': Math.round(mealData.baseCalories * 1.2),
                'harga_(idr)': Math.round(25000 * priceMultiplier)
            }
        ];

        return {
            meal_type: request.meal_type,
            range_waktu: mealData.time,
            deskripsi_rekomendasi_menu: `Rekomendasi ${request.meal_type} dengan preferensi: ${request.preference}`,
            list_pilihan_menu: mockMenus,
            'asupan_cairan_(air_gelas)': request.meal_type.includes('snack') ? 1 : 2,
            'target_kalori_(kcal)': mealData.baseCalories
        };
    }

    /**
     * Generate individual meal plan
     */
    async generateIndividualMealPlan(request: IndividualMealPlanRequest): Promise<IndividualMealPlan> {
        try {
            console.log('🍽️ IndividualMealPlanService: Generating individual meal plan');
            console.log('Request:', request);

            // Get user data and personal plan from cache if not provided
            let userData = request.user_data;
            let personalPlan = request.personal_plan;

            if (!userData || !personalPlan) {
                await unifiedCache.initializeCache();
                const cache = await unifiedCache.getCache();
                userData = userData || cache.user_data || undefined;
                personalPlan = personalPlan || cache.personal_plan || undefined;

                console.log('📋 Retrieved from cache - userData:', !!userData, 'personalPlan:', !!personalPlan);
            }

            // Validate that we have required data
            if (!userData) {
                throw new Error('User data is required but not found in cache. Please complete your profile setup.');
            }
            if (!personalPlan) {
                throw new Error('Personal plan is required but not found in cache. Please complete your nutrition plan setup.');
            }

            // Prepare request body matching the expected format
            const requestBody = {
                meal_type: request.meal_type,
                preference: request.preference,
                budget: request.budget,
                user_data: userData,
                personal_plan: personalPlan
            };

            console.log('🔗 Making API call to:', `${API_BASE_URL}/generate_meal_plan`);
            console.log('📤 Request body keys:', Object.keys(requestBody));

            // Test connectivity first
            try {
                const testResponse = await fetch(API_BASE_URL);
                console.log('🌐 Server connectivity test - status:', testResponse.status);
            } catch (connectError) {
                console.warn('⚠️ Server connectivity test failed:', connectError);
                throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please ensure the backend server is running and accessible.`);
            }

            // Make API call to generate individual meal plan
            const response = await fetch(`${API_BASE_URL}/generate_meal_plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);

                // If endpoint doesn't exist, provide helpful error
                if (response.status === 404) {
                    throw new Error(`Endpoint not found: The '/generate_meal_plan' endpoint does not exist on the server. Please check if this endpoint is implemented in the backend.`);
                }

                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const mealPlan: IndividualMealPlan = await response.json();

            console.log('✅ IndividualMealPlanService: Individual meal plan generated successfully');
            console.log('📥 Meal plan response:', mealPlan);

            return mealPlan;

        } catch (error) {
            console.error('❌ IndividualMealPlanService: Failed to generate individual meal plan:', error);

            // If it's a network error and we're in development, use mock data
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn('🔄 Falling back to mock data due to network error');

                // Add a small delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                return this.generateMockMealPlan(request);
            }

            // If the endpoint doesn't exist (404), also use mock data
            if (error instanceof Error && error.message.includes('404')) {
                console.warn('🔄 Falling back to mock data - endpoint not found');

                await new Promise(resolve => setTimeout(resolve, 1000));

                return this.generateMockMealPlan(request);
            }

            throw error;
        }
    }    /**
     * Convert API response to frontend meal item
     */
    convertToMealItem(mealPlan: IndividualMealPlan, dateAdded: Date = new Date()): IndividualMealItem {
        const mealId = `${mealPlan.meal_type}_${dateAdded.toISOString().split('T')[0]}_${Date.now()}`;

        return {
            id: mealId,
            type: mealPlan.meal_type as any,
            timeRange: mealPlan.range_waktu,
            description: mealPlan.deskripsi_rekomendasi_menu,
            targetCalories: mealPlan['target_kalori_(kcal)'],
            waterIntake: mealPlan['asupan_cairan_(air_gelas)'],
            menuOptions: mealPlan.list_pilihan_menu.map(option => ({
                name: option.nama_menu,
                description: option.deskripsi,
                calories: option['target_kalori_(kcal)'],
                price: option['harga_(idr)']
            })),
            status: 'planned',
            dateAdded: dateAdded.toISOString()
        };
    }

    /**
     * Save individual meal to cache
     */
    async saveIndividualMeal(mealItem: IndividualMealItem, date: Date): Promise<void> {
        try {
            await unifiedCache.initializeCache();

            // Get existing day cache
            const dayCache = await unifiedCache.getDayCache(date);

            // Create a cached meal object compatible with the base type
            const cachedMeal: any = {
                range_waktu: mealItem.timeRange,
                deskripsi_rekomendasi_menu: mealItem.description,
                list_pilihan_menu: mealItem.menuOptions.map(option => option.name),
                "asupan_cairan_(air_gelas)": mealItem.waterIntake,
                "target_kalori_(kcal)": mealItem.targetCalories,
                status: 'planned',
                actual_calories: 0,
                scanned_items: [],
                logged_at: new Date().toISOString(),
                // Extended properties for individual meals
                meal_type: mealItem.type,
                menu_options: mealItem.menuOptions,
                time_range: mealItem.timeRange,
                description: mealItem.description,
                target_calories: mealItem.targetCalories,
                water_intake: mealItem.waterIntake
            };

            // Add the individual meal to the meal plan
            dayCache.meal_plan[mealItem.id] = cachedMeal;

            // Update cache
            await unifiedCache.updateMealPlan(date, dayCache.meal_plan);

            console.log(`💾 Saved individual meal ${mealItem.id} to cache for date:`, date.toDateString());

        } catch (error) {
            console.error('❌ Failed to save individual meal to cache:', error);
            throw error;
        }
    }

    /**
     * Get all individual meals for a specific date
     */
    async getIndividualMealsForDate(date: Date): Promise<IndividualMealItem[]> {
        try {
            await unifiedCache.initializeCache();
            const dayCache = await unifiedCache.getDayCache(date);

            const meals: IndividualMealItem[] = [];

            for (const [mealId, cachedMeal] of Object.entries(dayCache.meal_plan)) {
                // Cast to any to access extended properties
                const extendedMeal = cachedMeal as any;

                // Skip if it's not an individual meal (legacy format)
                if (!extendedMeal.menu_options || !Array.isArray(extendedMeal.menu_options)) {
                    continue;
                }

                const mealItem: IndividualMealItem = {
                    id: mealId,
                    type: extendedMeal.meal_type || 'sarapan',
                    timeRange: extendedMeal.time_range || extendedMeal.range_waktu || '',
                    description: extendedMeal.description || extendedMeal.deskripsi_rekomendasi_menu || '',
                    targetCalories: extendedMeal.target_calories || extendedMeal['target_kalori_(kcal)'] || 0,
                    waterIntake: extendedMeal.water_intake || extendedMeal['asupan_cairan_(air_gelas)'] || 0,
                    menuOptions: extendedMeal.menu_options || [],
                    status: cachedMeal.status === 'eaten' ? 'completed' :
                        cachedMeal.status === 'skipped' ? 'skipped' : 'planned',
                    selectedOption: extendedMeal.selected_option,
                    dateAdded: cachedMeal.logged_at || new Date().toISOString()
                };

                meals.push(mealItem);
            }

            return meals.sort((a, b) => {
                const typeOrder = ['sarapan', 'snack_pagi', 'makan_siang', 'snack_sore', 'makan_malam'];
                return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
            });

        } catch (error) {
            console.error('❌ Failed to get individual meals for date:', error);
            return [];
        }
    }

    /**
     * Update meal status
     */
    async updateMealStatus(mealId: string, status: 'planned' | 'completed' | 'skipped', date: Date): Promise<void> {
        try {
            await unifiedCache.initializeCache();
            const dayCache = await unifiedCache.getDayCache(date);

            if (dayCache.meal_plan[mealId]) {
                dayCache.meal_plan[mealId].status = status === 'completed' ? 'eaten' : status === 'skipped' ? 'skipped' : 'planned';
                dayCache.meal_plan[mealId].logged_at = new Date().toISOString();

                await unifiedCache.updateMealPlan(date, dayCache.meal_plan);
                console.log(`✅ Updated meal status: ${mealId} -> ${status}`);
            }

        } catch (error) {
            console.error('❌ Failed to update meal status:', error);
            throw error;
        }
    }

    /**
     * Select a menu option for a meal
     */
    async selectMenuOption(mealId: string, option: any, date: Date): Promise<void> {
        try {
            await unifiedCache.initializeCache();
            const dayCache = await unifiedCache.getDayCache(date);

            if (dayCache.meal_plan[mealId]) {
                // Cast to any to access extended properties
                (dayCache.meal_plan[mealId] as any).selected_option = option;
                dayCache.meal_plan[mealId].logged_at = new Date().toISOString();

                await unifiedCache.updateMealPlan(date, dayCache.meal_plan);
                console.log(`✅ Selected menu option for ${mealId}:`, option.name);
            }

        } catch (error) {
            console.error('❌ Failed to select menu option:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const individualMealPlanService = new IndividualMealPlanService();
export default individualMealPlanService;