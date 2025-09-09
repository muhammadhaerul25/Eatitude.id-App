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

export const defaultProfile: UserProfile = {
    name: '',
    age: null,
    gender: '',
    weight: null,
    height: null,
    activityLevel: '',
    activityNotes: '',
    wakeTime: '06:00',
    sleepTime: '22:00',
    foodPreferences: '',
    allergies: '',
    healthConditions: '',
    goal: '',
};

// Validation helper functions
export const validateAge = (age: number | null): boolean => {
    return age !== null && age >= 1 && age <= 120;
};

export const validateWeight = (weight: number | null): boolean => {
    return weight !== null && weight >= 20 && weight <= 500;
};

export const validateHeight = (height: number | null): boolean => {
    return height !== null && height >= 50 && height <= 250;
};

export const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
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
