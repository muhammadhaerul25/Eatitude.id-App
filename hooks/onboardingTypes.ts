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
    waktu_bangun: '',
    waktu_tidur: '',
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
    { key: 'sedentary', label: 'Sedentari', description: 'Tidak atau jarang berolahraga' },
    { key: 'light', label: 'Ringan', description: 'Olahraga 1-3 kali/minggu' },
    { key: 'moderate', label: 'Sedang', description: 'Olahraga 3-5 kali/minggu' },
    { key: 'active', label: 'Aktif', description: 'Olahraga 6-7 kali/minggu' },
    { key: 'very_active', label: 'Sangat Aktif', description: 'Olahraga berat & pekerjaan fisik' }
];

export const goalOptions = [
    { key: 'improve_health', label: 'Menjaga Kesehatan', description: '' },
    { key: 'maintain_weight', label: 'Menjaga Berat Badan', description: '' },
    { key: 'lose_weight', label: 'Mengurangi Berat Badan', description: '' },
    { key: 'gain_weight', label: 'Menambah Berat Badan', description: '' },
    { key: 'manage_disease', label: 'Mengelola Penyakit', description: '' }
];

// Label mappings for display purposes
export const activityLevelLabels: { [key: string]: string } = {
    'sedentary': 'Sedentari',
    'light': 'Ringan',
    'moderate': 'Sedang',
    'active': 'Aktif',
    'very_active': 'Sangat Aktif'
};

export const goalLabels: { [key: string]: string } = {
    'improve_health': 'Menjaga Kesehatan',
    'maintain_weight': 'Menjaga Berat Badan',
    'lose_weight': 'Mengurangi Berat Badan',
    'gain_weight': 'Menambah Berat Badan',
    'manage_disease': 'Mengelola Penyakit'
};
