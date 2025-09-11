import { UserProfile } from '../hooks/onboardingTypes';
import { PersonalPlan, UserData } from './api';

// Map frontend UserProfile to API UserData
export function mapUserProfileToApiData(profile: UserProfile): UserData {
    console.log('🔄 Mapping user profile to API data:', profile);

    // Map activity levels
    const activityLevelMap: { [key: string]: string } = {
        'sedentary': 'sedentari',
        'light': 'ringan',
        'moderate': 'sedang',
        'active': 'aktif',
        'very_active': 'sangat_aktif'
    };

    // Map goals
    const goalMap: { [key: string]: string } = {
        'improve_health': 'meningkatkan_kesehatan',
        'maintain_weight': 'menjaga_berat_badan',
        'lose_weight': 'menurunkan_berat_badan',
        'gain_weight': 'menambah_berat_badan',
        'manage_disease': 'pengelolaan_penyakit'
    };

    const mappedData = {
        nama: profile.nama,
        usia: profile.usia || 0,
        jenis_kelamin: profile.jenis_kelamin === 'male' ? 'Laki-laki' : 'Perempuan',
        berat_badan: profile.berat_badan || 0,
        tinggi_badan: profile.tinggi_badan || 0,
        tingkat_aktivitas: activityLevelMap[profile.tingkat_aktivitas] || 'sedang',
        catatan_aktivitas: profile.catatan_aktivitas || '',
        waktu_bangun: profile.waktu_bangun,
        waktu_tidur: profile.waktu_tidur,
        preferensi_makanan: profile.preferensi_makanan || '',
        alergi_makanan: profile.alergi_makanan || '',
        kondisi_kesehatan: profile.kondisi_kesehatan || '',
        tujuan: goalMap[profile.tujuan] || 'meningkatkan_kesehatan'
    };

    console.log('📊 Mapped data result:', mappedData);
    console.log(`🔍 Gender mapping: "${profile.jenis_kelamin}" -> "${mappedData.jenis_kelamin}"`);
    console.log(`🔍 Activity mapping: "${profile.tingkat_aktivitas}" -> "${mappedData.tingkat_aktivitas}"`);
    console.log(`🔍 Goal mapping: "${profile.tujuan}" -> "${mappedData.tujuan}"`);

    return mappedData;
}

// Map API PersonalPlan to frontend NutritionPlan (no mapping needed - direct pass-through)
export function mapPersonalPlanToNutritionPlan(apiPlan: any): any {
    console.log('🔄 No mapping needed - using API plan directly:', apiPlan);
    // Since frontend now expects the same format as backend, just return as-is
    return apiPlan;
}/**
 * Convert cached nutrition plan back to API PersonalPlan format
 * This handles the case where we have a simplified nutrition plan structure
 * and need to convert it back to the API's expected format
 */
export function mapNutritionPlanToPersonalPlan(nutritionPlan: any): PersonalPlan {
    console.log('🔄 Converting cached nutrition plan to API format:', nutritionPlan);

    const result: PersonalPlan = {
        kebutuhan_kalori: {
            'total_kalori_per_hari_(kcal)': nutritionPlan.calories || 2000,
            per_waktu_makan: {
                sarapan: Math.round((nutritionPlan.calories || 2000) * 0.25),
                snack_pagi: Math.round((nutritionPlan.calories || 2000) * 0.075),
                makan_siang: Math.round((nutritionPlan.calories || 2000) * 0.30),
                snack_sore: Math.round((nutritionPlan.calories || 2000) * 0.075),
                makan_malam: Math.round((nutritionPlan.calories || 2000) * 0.30)
            }
        },
        kebutuhan_makronutrisi: {
            'karbohidrat_per_hari_(g)': nutritionPlan.macros?.carbs || Math.round((nutritionPlan.calories || 2000) * 0.5 / 4),
            'protein_per_hari_(g)': nutritionPlan.macros?.protein || Math.round((nutritionPlan.calories || 2000) * 0.2 / 4),
            'lemak_per_hari_(g)': nutritionPlan.macros?.fat || Math.round((nutritionPlan.calories || 2000) * 0.3 / 9),
            'serat_per_hari_(g)': nutritionPlan.macros?.fiber || 25
        },
        kebutuhan_mikronutrisi: {
            'vitamin_a_per_hari_(mg)': nutritionPlan.vitamins?.vitaminA || 0.9,
            'vitamin_b_kompleks_per_hari_(mg)': nutritionPlan.vitamins?.vitaminB || 25,
            'vitamin_c_per_hari_(mg)': nutritionPlan.vitamins?.vitaminC || 90,
            'vitamin_d_per_hari_(mg)': nutritionPlan.vitamins?.vitaminD || 0.015,
            'vitamin_e_per_hari_(mg)': nutritionPlan.vitamins?.vitaminE || 15,
            'vitamin_k_per_hari_(mg)': nutritionPlan.vitamins?.vitaminK || 0.12,
            'kalsium_per_hari_(mg)': nutritionPlan.minerals?.calcium || 1000,
            'zat_besi_per_hari_(mg)': nutritionPlan.minerals?.iron || 8,
            'magnesium_per_hari_(mg)': nutritionPlan.minerals?.magnesium || 400,
            'kalium_per_hari_(mg)': nutritionPlan.minerals?.potassium || 3400,
            'natrium_per_hari_(mg)': nutritionPlan.minerals?.sodium || 1500,
            'zinc_per_hari_(mg)': nutritionPlan.minerals?.zinc || 11,
            'yodium_per_hari_(mg)': nutritionPlan.minerals?.iodine || 0.15
        },
        batasi_konsumsi: {
            'gula_per_hari_(g)': 25,
            'garam_per_hari_(g)': 5,
            'kafein_per_hari_(mg)': 400,
            'lemak_jenuh_per_hari_(g)': 20,
            'lemak_trans_per_hari_(g)': 0,
            'kolesterol_per_hari_(mg)': 300
        },
        kebutuhan_cairan: {
            'air_per_hari_(liter)': nutritionPlan.hydration?.liters || 2.5,
            'total_cairan_per_hari_(liter)': nutritionPlan.hydration?.liters || 2.5
        },
        catatan: nutritionPlan.notes || 'Personalized nutrition plan generated by Eatitude AI'
    };

    console.log('✅ Converted nutrition plan to API format:', result);
    return result;
}

// Map API meal plan to frontend meal items
export function mapMealPlanToMealItems(apiMealPlan: any): any[] {
    const mealTypes = [
        { key: 'sarapan', type: 'sarapan', timeRange: '06:00 - 08:00' },
        { key: 'snack_pagi', type: 'snack_pagi', timeRange: '10:00 - 11:00', isOptional: true },
        { key: 'makan_siang', type: 'makan_siang', timeRange: '12:00 - 14:00' },
        { key: 'snack_sore', type: 'snack_sore', timeRange: '15:00 - 16:00', isOptional: true },
        { key: 'makan_malam', type: 'makan_malam', timeRange: '18:00 - 20:00' },
    ];

    return mealTypes.map((meal, index) => {
        const mealData = apiMealPlan[meal.key];
        return {
            id: (index + 1).toString(),
            type: meal.type,
            timeRange: meal.timeRange,
            rekomendasi_menu: mealData?.menu || 'Get Recommendation',
            targetKalori: mealData?.kalori_target || 0,
            status: mealData ? 'not_planned' : 'not_planned',
            isOptional: meal.isOptional || false,
            details: mealData,
        };
    });
}

// Format nutrition data for display
export function formatNutritionData(nutrition: any): string {
    if (!nutrition) return 'Data tidak tersedia';

    const parts = [];
    if (nutrition.kalori) parts.push(`${nutrition.kalori} kal`);
    if (nutrition.protein) parts.push(`P: ${nutrition.protein}g`);
    if (nutrition.karbohidrat) parts.push(`K: ${nutrition.karbohidrat}g`);
    if (nutrition.lemak) parts.push(`L: ${nutrition.lemak}g`);

    return parts.join(' • ');
}
