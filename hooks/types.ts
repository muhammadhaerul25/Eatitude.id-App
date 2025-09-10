export interface UserProfile {
    name: string;
    age: number | null;
    gender: 'male' | 'female' | '';
    weight: number | null;
    height: number | null;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
    activityNotes: string;
    wakeTime: string; // format: "HH:MM"
    sleepTime: string; // format: "HH:MM"
    foodPreferences: string;
    allergies: string;
    healthConditions: string;
    goal: 'improve_health' | 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'manage_disease' | '';
}

export interface NutritionPlan {
    status: 'waiting' | 'approved' | 'adjusted';
    generatedBy: string;
    validatedBy: string;
    calories: number;
    macros: {
        carbs: number;
        protein: number;
        fat: number;
        fiber: number;
    };
    vitamins: {
        vitaminA: number;
        vitaminB: number;
        vitaminC: number;
        vitaminD: number;
        vitaminE: number;
        vitaminK: number;
    };
    minerals: {
        calcium: number;
        iron: number;
        magnesium: number;
        potassium: number;
        sodium: number;
        zinc: number;
        iodine: number;
    };
    limits: {
        sugar: string;
        salt: string;
        caffeine: string;
        saturatedFat: string;
        transFat: string;
        cholesterol: string;
    };
    hydration: {
        liters: number;
        glasses: number;
    };
    notes: string;
}

export const activityLevelLabels = {
    sedentary: 'Sedentari',
    light: 'Ringan',
    moderate: 'Sedang',
    active: 'Aktif',
    very_active: 'Sangat Aktif'
};

export const goalLabels = {
    improve_health: 'Meningkatkan Kesehatan',
    maintain_weight: 'Menjaga Berat Badan',
    lose_weight: 'Menurunkan Berat Badan',
    gain_weight: 'Menambah Berat Badan',
    manage_disease: 'Pengelolaan Penyakit'
};
