export interface UserProfile {
    nama: string;
    usia: number | null;
    jenis_kelamin: 'male' | 'female' | '';
    berat_badan: number | null;
    tinggi_badan: number | null;
    tingkat_aktivitas: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
    catatan_aktivitas: string;
    waktu_bangun: string; // format: "HH:MM"
    waktu_tidur: string; // format: "HH:MM"
    preferensi_makanan: string;
    alergi_makanan: string;
    kondisi_kesehatan: string;
    tujuan: 'improve_health' | 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'manage_disease' | '';
}

// Backend API format - matches Prompt.py exactly
export interface PersonalPlan {
    kebutuhan_kalori: {
        "total_kalori_per_hari_(kcal)": number;
    };
    kebutuhan_makronutrisi: {
        "karbohidrat_per_hari_(g)": number;
        "protein_per_hari_(g)": number;
        "lemak_per_hari_(g)": number;
        "serat_per_hari_(g)": number;
    };
    kebutuhan_mikronutrisi: {
        "vitamin_a_per_hari_(mg)": number;
        "vitamin_b_kompleks_per_hari_(mg)": number;
        "vitamin_c_per_hari_(mg)": number;
        "vitamin_d_per_hari_(mg)": number;
        "vitamin_e_per_hari_(mg)": number;
        "vitamin_k_per_hari_(mg)": number;
        "kalsium_per_hari_(mg)": number;
        "zat_besi_per_hari_(mg)": number;
        "magnesium_per_hari_(mg)": number;
        "kalium_per_hari_(mg)": number;
        "natrium_per_hari_(mg)": number;
        "zinc_per_hari_(mg)": number;
        "yodium_per_hari_(mg)": number;
    };
    batasi_konsumsi: {
        "gula_per_hari_(g)": number;
        "garam_per_hari_(g)": number;
        "kafein_per_hari_(mg)": number;
        "lemak_jenuh_per_hari_(g)": number;
        "lemak_trans_per_hari_(g)": number;
        "kolesterol_per_hari_(mg)": number;
    };
    kebutuhan_cairan: {
        "air_per_hari_(liter)": number;
        "air_per_hari_(gelas)": number;
    };
    catatan: string;
    // Legacy/alternate property names for backwards compatibility
    hidrasi?: {
        liter?: number;
        gelas?: number;
    };
    kalori?: number;
    // Status and metadata properties for UI components
    status?: 'waiting' | 'approved' | 'adjusted' | string;
    dibuatOleh?: string;
    divalidasiOleh?: string;
}

// Meal plan format - matches Prompt.py exactly
export interface MealOption {
    range_waktu: string;
    deskripsi_rekomendasi_menu: string;
    list_pilihan_menu: string[];
    "asupan_cairan_(air_gelas)": number;
    "target_kalori_(kcal)": number;
}

export interface MealPlanPerDay {
    sarapan: MealOption;
    snack_pagi_opsional: MealOption;
    makan_siang: MealOption;
    snack_sore_opsional: MealOption;
    makan_malam: MealOption;
}

// Use PersonalPlan directly as NutritionPlan (no more mapping needed)
export type NutritionPlan = PersonalPlan;

export const labelTingkatAktivitas = {
    sedentary: 'Sedentari',
    light: 'Ringan',
    moderate: 'Sedang',
    active: 'Aktif',
    very_active: 'Sangat Aktif'
};

export const labelTujuan = {
    improve_health: 'Meningkatkan Kesehatan',
    maintain_weight: 'Menjaga Berat Badan',
    lose_weight: 'Menurunkan Berat Badan',
    gain_weight: 'Menambah Berat Badan',
    manage_disease: 'Pengelolaan Penyakit'
};
