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

export const defaultProfile: UserProfile = {
    nama: '',
    usia: null,
    jenis_kelamin: '',
    berat_badan: null,
    tinggi_badan: null,
    tingkat_aktivitas: '',
    catatan_aktivitas: '',
    waktu_bangun: '06:00',
    waktu_tidur: '22:00',
    preferensi_makanan: '',
    alergi_makanan: '',
    kondisi_kesehatan: '',
    tujuan: '',
};

// Validation helper functions
export const validateUsia = (usia: number | null): boolean => {
    return usia !== null && usia >= 1 && usia <= 120;
};

export const validateBeratBadan = (berat_badan: number | null): boolean => {
    return berat_badan !== null && berat_badan >= 20 && berat_badan <= 500;
};

export const validateTinggiBadan = (tinggi_badan: number | null): boolean => {
    return tinggi_badan !== null && tinggi_badan >= 50 && tinggi_badan <= 250;
};

export const validateWaktu = (waktu: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(waktu);
};

export const formatTime = (time: string): string => {
    // Remove any non-digit characters and format as HH:MM
    const digits = time.replace(/\D/g, '');
    if (digits.length >= 3) {
        const hours = digits.substring(0, 2);
        const minutes = digits.substring(2, 4);
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return time;
};

export const steps = [
    'Personal Info',
    'Body Metrics',
    'Activity & Rest',
    'Goals & Objectives'
];

export const activityLevels = [
    { key: 'sedentary', label: 'Sedentary', description: 'No or rarely exercise' },
    { key: 'light', label: 'Light', description: 'Exercise 1-3 times/week' },
    { key: 'moderate', label: 'Moderate', description: 'Exercise 3-5 times/week' },
    { key: 'active', label: 'Active', description: 'Exercise 6-7 times/week' },
    { key: 'very_active', label: 'Very Active', description: 'Heavy exercise & physical work' }
];

export const goalOptions = [
    { key: 'improve_health', label: 'Improve Health', description: 'Focus on overall wellness' },
    { key: 'maintain_weight', label: 'Maintain Weight', description: 'Keep current weight stable' },
    { key: 'lose_weight', label: 'Lose Weight', description: 'Reduce body weight safely' },
    { key: 'gain_weight', label: 'Gain Weight', description: 'Increase body weight healthily' },
    { key: 'manage_disease', label: 'Manage Disease', description: 'Support medical condition management' }
];

// Label mappings for display purposes
export const activityLevelLabels: { [key: string]: string } = {
    'sedentary': 'Sedentary',
    'light': 'Light Activity',
    'moderate': 'Moderate Activity',
    'active': 'Active',
    'very_active': 'Very Active'
};

export const goalLabels: { [key: string]: string } = {
    'improve_health': 'Improve Health',
    'maintain_weight': 'Maintain Weight',
    'lose_weight': 'Lose Weight',
    'gain_weight': 'Gain Weight',
    'manage_disease': 'Manage Disease'
};
