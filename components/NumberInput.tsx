import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { onboardingStyles as styles } from '../styles/tabs/onboardingStyles';

interface NumberInputProps {
    label: string;
    value: number | null;
    onChangeValue: (value: number | null) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    suffix?: string;
    required?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChangeValue,
    placeholder,
    min,
    max,
    suffix,
    required = false
}) => {
    const [textValue, setTextValue] = useState(value?.toString() || '');
    const [error, setError] = useState<string>('');

    const handleChangeText = (text: string) => {
        // Allow only numbers and decimal point
        const cleanedText = text.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = cleanedText.split('.');
        const formattedText = parts.length > 2
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleanedText;

        setTextValue(formattedText);

        if (formattedText === '') {
            onChangeValue(null);
            setError('');
            return;
        }

        const numValue = parseFloat(formattedText);

        if (isNaN(numValue)) {
            setError('Please enter a valid number');
            return;
        }

        if (min !== undefined && numValue < min) {
            setError(`Value must be at least ${min}`);
            return;
        }

        if (max !== undefined && numValue > max) {
            setError(`Value must be at most ${max}`);
            return;
        }

        setError('');
        onChangeValue(numValue);
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
                {suffix && <Text style={styles.suffix}> ({suffix})</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput,
                    error ? styles.textInputError : undefined
                ]}
                value={textValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                keyboardType="numeric"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};
