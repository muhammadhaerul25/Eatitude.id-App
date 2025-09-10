import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { onboardingStyles as styles } from '../styles/tabs/onboardingStyles';

interface AgeInputProps {
    label: string;
    value: number | null;
    onChangeValue: (value: number | null) => void;
    required?: boolean;
}

export const AgeInput: React.FC<AgeInputProps> = ({
    label,
    value,
    onChangeValue,
    required = false
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const ages = Array.from({ length: 100 }, (_, i) => i + 1); // 1 to 100

    const handleSelectAge = (age: number) => {
        onChangeValue(age);
        setModalVisible(false);
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>

            <TouchableOpacity
                style={[styles.textInput, styles.pickerInput]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[
                    styles.pickerText,
                    !value && styles.pickerPlaceholder
                ]}>
                    {value ? `${value} years old` : 'Select your age'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Age</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.ageList}>
                            {ages.map((age) => (
                                <TouchableOpacity
                                    key={age}
                                    style={[
                                        styles.ageItem,
                                        value === age && styles.ageItemSelected
                                    ]}
                                    onPress={() => handleSelectAge(age)}
                                >
                                    <Text style={[
                                        styles.ageItemText,
                                        value === age && styles.ageItemTextSelected
                                    ]}>
                                        {age} years old
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
