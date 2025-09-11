import { Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { validateWaktu } from '../../hooks/onboardingTypes';
import { onboardingStyles as styles } from '../../styles/tabs/onboardingStyles';

interface TimeInputProps {
    label: string;
    value: string;
    onChangeValue: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
    label,
    value,
    onChangeValue,
    placeholder = "HH:MM",
    required = false
}) => {
    const [error, setError] = useState<string>('');

    const handleChangeText = (text: string) => {
        // Remove any non-digit characters initially
        const digitsOnly = text.replace(/\D/g, '');

        // Format as HH:MM while typing
        let formattedTime = '';
        if (digitsOnly.length >= 1) {
            formattedTime = digitsOnly.substring(0, 2);
            if (digitsOnly.length >= 3) {
                formattedTime += ':' + digitsOnly.substring(2, 4);
            }
        }

        // Limit to 5 characters (HH:MM)
        if (formattedTime.length <= 5) {
            onChangeValue(formattedTime);

            // Validate complete time
            if (formattedTime.length === 5) {
                if (!validateWaktu(formattedTime)) {
                    setError('Please enter a valid time (00:00 - 23:59)');
                } else {
                    setError('');
                }
            } else {
                setError('');
            }
        }
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[
                styles.timeInputContainer,
                error ? styles.timeInputError : undefined
            ]}>
                <Clock size={16} color="#6B7280" style={styles.timeInputIcon} />
                <TextInput
                    style={styles.timeInputField}
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    keyboardType="numeric"
                    maxLength={5}
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};
