import { UserProfile } from '../hooks/onboardingTypes';
import { UserData } from './api';

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
        nama: profile.name,
        usia: profile.age || 0,
        jenis_kelamin: profile.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        berat_badan: profile.weight || 0,
        tinggi_badan: profile.height || 0,
        tingkat_aktivitas: activityLevelMap[profile.activityLevel] || 'sedang',
        catatan_aktivitas: profile.activityNotes || '',
        waktu_bangun: profile.wakeTime,
        waktu_tidur: profile.sleepTime,
        preferensi_makanan: profile.foodPreferences || '',
        alergi_makanan: profile.allergies || '',
        kondisi_kesehatan: profile.healthConditions || '',
        tujuan: goalMap[profile.goal] || 'meningkatkan_kesehatan'
    };

    console.log('📊 Mapped data result:', mappedData);
    console.log(`🔍 Gender mapping: "${profile.gender}" -> "${mappedData.jenis_kelamin}"`);
    console.log(`🔍 Activity mapping: "${profile.activityLevel}" -> "${mappedData.tingkat_aktivitas}"`);
    console.log(`🔍 Goal mapping: "${profile.goal}" -> "${mappedData.tujuan}"`);

    return mappedData;
}

// Map API PersonalPlan to frontend NutritionPlan
export function mapPersonalPlanToNutritionPlan(apiPlan: any): any {
    console.log('🔄 Mapping API plan to nutrition plan...');
    console.log('📋 API Plan received:', apiPlan);

    // Extract values with proper field names for debugging
    const calories = apiPlan.kebutuhan_kalori?.['total_kalori_per_hari_(kcal)'] || 0;
    const carbs = apiPlan.kebutuhan_makronutrisi?.['karbohidrat_per_hari_(g)'] || 0;
    const protein = apiPlan.kebutuhan_makronutrisi?.['protein_per_hari_(g)'] || 0;
    const fat = apiPlan.kebutuhan_makronutrisi?.['lemak_per_hari_(g)'] || 0;
    const fiber = apiPlan.kebutuhan_makronutrisi?.['serat_per_hari_(g)'] || 0;

    console.log('🔍 Extracted key values:', { calories, carbs, protein, fat, fiber });

    const result = {
        status: 'approved',
        generatedBy: 'Eatitude AI',
        validatedBy: 'Nutrition Expert',
        calories: calories,
        macros: {
            carbs: carbs,
            protein: protein,
            fat: fat,
            fiber: fiber,
        },
        vitamins: {
            vitaminA: apiPlan.kebutuhan_mikronutrisi?.['vitamin_a_per_hari_(mg)'] || 0,
            vitaminB: apiPlan.kebutuhan_mikronutrisi?.['vitamin_b_kompleks_per_hari_(mg)'] || 0,
            vitaminC: apiPlan.kebutuhan_mikronutrisi?.['vitamin_c_per_hari_(mg)'] || 0,
            vitaminD: apiPlan.kebutuhan_mikronutrisi?.['vitamin_d_per_hari_(mg)'] || 0,
            vitaminE: apiPlan.kebutuhan_mikronutrisi?.['vitamin_e_per_hari_(mg)'] || 0,
            vitaminK: apiPlan.kebutuhan_mikronutrisi?.['vitamin_k_per_hari_(mg)'] || 0,
        },
        minerals: {
            calcium: apiPlan.kebutuhan_mikronutrisi?.['kalsium_per_hari_(mg)'] || 0,
            iron: apiPlan.kebutuhan_mikronutrisi?.['zat_besi_per_hari_(mg)'] || 0,
            magnesium: apiPlan.kebutuhan_mikronutrisi?.['magnesium_per_hari_(mg)'] || 0,
            potassium: apiPlan.kebutuhan_mikronutrisi?.['kalium_per_hari_(mg)'] || 0,
            sodium: apiPlan.kebutuhan_mikronutrisi?.['natrium_per_hari_(mg)'] || 0,
            zinc: apiPlan.kebutuhan_mikronutrisi?.['zinc_per_hari_(mg)'] || 0,
            iodine: apiPlan.kebutuhan_mikronutrisi?.['yodium_per_hari_(mg)'] || 0,
        },
        limits: {
            sugar: apiPlan.batasi_konsumsi?.['gula_per_hari_(g)'] ? `max ${apiPlan.batasi_konsumsi['gula_per_hari_(g)']}g/hari` : 'max 50g/hari',
            salt: apiPlan.batasi_konsumsi?.['garam_per_hari_(g)'] ? `max ${apiPlan.batasi_konsumsi['garam_per_hari_(g)']}g/hari` : 'max 5g/hari',
            caffeine: apiPlan.batasi_konsumsi?.['kafein_per_hari_(mg)'] ? `max ${apiPlan.batasi_konsumsi['kafein_per_hari_(mg)']}mg/hari` : 'max 400mg/hari',
            saturatedFat: apiPlan.batasi_konsumsi?.['lemak_jenuh_per_hari_(g)'] ? `max ${apiPlan.batasi_konsumsi['lemak_jenuh_per_hari_(g)']}g/hari` : 'max 25g/hari',
            transFat: apiPlan.batasi_konsumsi?.['lemak_trans_per_hari_(g)'] ? (apiPlan.batasi_konsumsi['lemak_trans_per_hari_(g)'] === 0 ? 'hindari' : `max ${apiPlan.batasi_konsumsi['lemak_trans_per_hari_(g)']}g/hari`) : 'hindari',
            cholesterol: apiPlan.batasi_konsumsi?.['kolesterol_per_hari_(mg)'] ? `max ${apiPlan.batasi_konsumsi['kolesterol_per_hari_(mg)']}mg/hari` : 'max 300mg/hari',
        },
        hydration: {
            liters: apiPlan.kebutuhan_cairan?.['air_per_hari_(liter)'] || 2.5,
            glasses: apiPlan.kebutuhan_cairan?.['air_per_hari_(gelas)'] || 8,
        },
        notes: apiPlan.catatan || '',
    };

    console.log('✅ Final mapped result:', result);
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
