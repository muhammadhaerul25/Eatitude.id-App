import { Scale } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { UserProfile } from '../../hooks/onboardingTypes';
import { onboardingStyles as styles } from '../../styles/tabs/onboardingStyles';
import { NumberInput } from '../inputs/NumberInput';

interface BodyMetricsStepProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

export const BodyMetricsStep: React.FC<BodyMetricsStepProps> = ({ profile, updateProfile }) => {
    const calculateBMI = (): number | null => {
        if (profile.berat_badan && profile.tinggi_badan) {
            const weight = profile.berat_badan;
            const height = profile.tinggi_badan / 100; // convert cm to m
            return weight / (height * height);
        }
        return null;
    };

    const getBMICategory = (bmi: number): string => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal Weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const getBMIColor = (bmi: number): string => {
        if (bmi < 18.5) return '#3B82F6'; // Blue
        if (bmi < 25) return '#10B981'; // Green
        if (bmi < 30) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const bmi = calculateBMI();

    return (
        <View style={styles.stepContent}>
            <Scale size={48} color="#10B981" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Body Metrics</Text>

            <View style={styles.metricsRow}>
                <View style={styles.halfWidth}>
                    <NumberInput
                        label="Weight"
                        value={profile.berat_badan}
                        onChangeValue={(berat_badan) => updateProfile({ berat_badan })}
                        placeholder="70"
                        min={20}
                        max={500}
                        suffix="kg"
                        required
                    />
                </View>

                <View style={styles.halfWidth}>
                    <NumberInput
                        label="Height"
                        value={profile.tinggi_badan}
                        onChangeValue={(tinggi_badan) => updateProfile({ tinggi_badan })}
                        placeholder="175"
                        min={50}
                        max={250}
                        suffix="cm"
                        required
                    />
                </View>
            </View>

            {bmi && (
                <View style={styles.bmiCard}>
                    <Text style={styles.bmiTitle}>Your BMI</Text>
                    <Text style={[styles.bmiValue, { color: getBMIColor(bmi) }]}>
                        {bmi.toFixed(1)}
                    </Text>
                    <Text style={[styles.bmiCategory, { color: getBMIColor(bmi) }]}>
                        {getBMICategory(bmi)}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default BodyMetricsStep;
