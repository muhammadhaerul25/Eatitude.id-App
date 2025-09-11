/**
 * Nutrition Advisor API Test Script
 * 
 * Run this script to test the nutrition advisor integration
 * This can be used for development and debugging purposes
 */

import { MealPlan, nutritionAdvisorService, PersonalPlan, UserData, UserProgress } from '../services/nutritionAdvisorAPI';

// Sample test data
const testUserData: UserData = {
    nama: 'Muhammad Haerul',
    usia: 22,
    jenis_kelamin: 'Laki-laki',
    berat_badan: 62,
    tinggi_badan: 167,
    tingkat_aktivitas: 'Ringan',
    catatan_aktivitas: 'Olahraga ringan 3x seminggu',
    waktu_bangun: '07.00',
    waktu_tidur: '22.00',
    preferensi_makanan: 'Makanan sehat',
    alergi_makanan: 'Tidak ada alergi',
    kondisi_kesehatan: 'Sehat',
    tujuan: 'Meningkatkan kesehatan'
};

const testPersonalPlan: PersonalPlan = {
    kebutuhan_kalori: {
        total_kalori_per_hari_kcal: 2150
    },
    kebutuhan_makronutrisi: {
        karbohidrat_per_hari_g: 295,
        protein_per_hari_g: 107,
        lemak_per_hari_g: 60,
        serat_per_hari_g: 30
    },
    kebutuhan_mikronutrisi: {
        vitamin_a_per_hari_mg: 0.9,
        vitamin_b_kompleks_per_hari_mg: 2.5,
        vitamin_c_per_hari_mg: 90,
        vitamin_d_per_hari_mg: 0.015,
        vitamin_e_per_hari_mg: 15,
        vitamin_k_per_hari_mg: 0.12,
        kalsium_per_hari_mg: 1000,
        zat_besi_per_hari_mg: 8,
        magnesium_per_hari_mg: 400,
        kalium_per_hari_mg: 3400,
        natrium_per_hari_mg: 1500,
        zinc_per_hari_mg: 11,
        yodium_per_hari_mg: 0.15
    },
    batasi_konsumsi: {
        gula_per_hari_sdm: 4,
        garam_per_hari_sdt: 1,
        kafein_per_hari_cangkir: 4
    },
    kebutuhan_cairan: {
        air_per_hari_liter: 2.2,
        air_per_hari_gelas: 9
    },
    catatan: 'Plan makan disusun untuk meningkatkan kesehatan dengan total kalori 2150 kkal. Fokus pada makanan sehat seperti sayuran, buah, biji-bijian utuh, protein tanpa lemak, dan lemak sehat. Batasi gula tambahan dan garam sesuai anjuran. Pastikan hidrasi cukup dengan minum minimal 2.2 liter air per hari.'
};

const testMealPlan: MealPlan = {
    sarapan: {
        range_waktu: '07.00–08.00',
        deskripsi_rekomendasi_menu: 'Sarapan bergizi seimbang untuk memulai hari',
        list_pilihan_menu: [
            'Nasi merah 100g + Telur dadar 2 butir + Tumis buncis wortel + Pisang 1 buah',
            'Oatmeal susu rendah lemak dengan potongan pepaya dan taburan biji chia',
            'Roti gandum panggang 2 lembar dengan selai kacang dan irisan pisang'
        ],
        asupan_cairan_air_gelas: 1,
        target_kalori_kcal: 430
    },
    snack_pagi: {
        range_waktu: '10.00–10.30',
        deskripsi_rekomendasi_menu: 'Camilan ringan kaya serat',
        list_pilihan_menu: [
            'Yogurt plain dengan potongan melon',
            'Jagung rebus ukuran sedang',
            'Kacang rebus campur (kacang merah, edamame)'
        ],
        asupan_cairan_air_gelas: 1,
        target_kalori_kcal: 150
    },
    makan_siang: {
        range_waktu: '12.00–13.00',
        deskripsi_rekomendasi_menu: 'Makanan utama dengan protein lengkap dan sayuran',
        list_pilihan_menu: [
            'Nasi merah 100g + Ikan bakar bumbu kunyit + Cah kangkung + Lalapan timun',
            'Nasi liwet dengan tempe bacem, pepes tahu, dan sayur asem',
            'Sop ayam kampung dengan kentang, wortel, jagung + Nasi putih 100g'
        ],
        asupan_cairan_air_gelas: 2,
        target_kalori_kcal: 650
    },
    snack_sore: {
        range_waktu: '16.00–16.30',
        deskripsi_rekomendasi_menu: 'Snack sore rendah gula',
        list_pilihan_menu: [
            'Buah pepaya potong 200g',
            'Puding buah tanpa gula',
            'Kacang almond panggang 25g'
        ],
        asupan_cairan_air_gelas: 1,
        target_kalori_kcal: 150
    },
    makan_malam: {
        range_waktu: '18.30–19.30',
        deskripsi_rekomendasi_menu: 'Makanan ringan dengan karbohidrat kompleks',
        list_pilihan_menu: [
            'Nasi merah 100g + Ayam panggang bumbu rujak + Capcay sayuran',
            'Pepes ikan mas dengan nasi jagung + Tumis tauge',
            'Tahu/tempe goreng tepung sehat + Ubi rebus + Salad sayur dressing jeruk'
        ],
        asupan_cairan_air_gelas: 1,
        target_kalori_kcal: 600
    }
};

const testUserProgress: UserProgress = {
    target_kalori: '1520 kcal / 2000 kcal',
    target_makronutrisi: {
        karbohidrat: '220 g / 275 g',
        protein: '95 g / 120 g',
        lemak: '60 g / 70 g',
        serat: '24 g / 30 g'
    },
    status_mikronutrisi: {
        vitamin: {
            vitamin_a: 'Cukup',
            vitamin_b: 'Kurang',
            vitamin_c: 'Berlebih',
            vitamin_d: 'Kurang',
            vitamin_e: 'Cukup',
            vitamin_k: 'Cukup'
        },
        mineral: {
            kalsium: 'Cukup',
            zat_besi: 'Kurang',
            magnesium: 'Cukup',
            kalium: 'Kurang',
            natrium: 'Berlebih',
            zinc: 'Cukup',
            yodium: 'Cukup'
        }
    },
    batas_konsumsi: {
        gula: 'Waspada',
        garam: 'Berlebih',
        lemak_jenuh: 'Bahaya',
        lemak_trans: 'Aman',
        kafein: 'Aman',
        kolestrol: 'Cukup'
    },
    asupan_cairan: {
        air: '7 gelas / 10 gelas'
    }
};

/**
 * Test the nutrition advisor API integration
 */
export async function testNutritionAdvisor() {
    console.log('🧪 Starting Nutrition Advisor API Test...');
    console.log('👤 User:', testUserData.nama);
    console.log('🎯 Goal:', testUserData.tujuan);

    try {
        const startTime = Date.now();

        const result = await nutritionAdvisorService.generateAdvice(
            testUserData,
            testPersonalPlan,
            testMealPlan,
            testUserProgress
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        if (result.success && result.data) {
            console.log('✅ Test PASSED!');
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log('📝 Generated Advice:');
            console.log(JSON.stringify(result.data.nutrition_advice, null, 2));

            // Create formatted prompt for reference
            const prompt = nutritionAdvisorService.createPrompt(
                testUserData,
                testPersonalPlan,
                testMealPlan,
                testUserProgress
            );
            console.log('\n📋 Prompt that was sent:');
            console.log(prompt);

            return {
                success: true,
                duration,
                advice: result.data.nutrition_advice,
                prompt
            };
        } else {
            console.log('❌ Test FAILED!');
            console.log('Error:', result.error);

            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        console.log('❌ Test ERROR!');
        console.error('Unexpected error:', error);

        return {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: 'Unexpected error during test',
                originalError: error
            }
        };
    }
}

/**
 * Test validation functionality
 */
export function testValidation() {
    console.log('🧪 Testing validation...');

    // Test with invalid data
    const invalidUserData = {
        ...testUserData,
        nama: '', // Invalid: empty name
        usia: -5, // Invalid: negative age
    };

    try {
        // This should throw a validation error
        nutritionAdvisorService.generateAdvice(
            invalidUserData as UserData,
            testPersonalPlan,
            testMealPlan
        );
        console.log('❌ Validation test FAILED: Should have thrown error');
    } catch (error) {
        console.log('✅ Validation test PASSED: Correctly caught validation error');
        console.log('Error:', error);
    }
}

/**
 * Run all tests
 */
export async function runAllTests() {
    console.log('🚀 Running all Nutrition Advisor tests...\n');

    // Test validation
    testValidation();
    console.log('\n');

    // Test API integration
    const apiResult = await testNutritionAdvisor();

    console.log('\n📊 Test Summary:');
    console.log('- Validation:', '✅ PASSED');
    console.log('- API Integration:', apiResult.success ? '✅ PASSED' : '❌ FAILED');

    if (apiResult.success) {
        console.log(`- Response Time: ${apiResult.duration}ms`);
    }

    return apiResult;
}

// Export test data for use in components
export {
    testMealPlan, testPersonalPlan, testUserData, testUserProgress
};

