import { Check, Heart } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { onboardingStyles as styles } from './styles';
import { UserProfile, goalOptions } from './types';

interface GoalsObjectivesStepProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    selectGoal: (goalKey: string) => void;
}

export const GoalsObjectivesStep: React.FC<GoalsObjectivesStepProps> = ({
    profile,
    updateProfile,
    selectGoal
}) => {
    return (
        <View style={styles.stepContent}>
            <Heart size={48} color="#10B981" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Goals & Objectives</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Select Your Primary Goal
                    <Text style={styles.required}> *</Text>
                </Text>
                <Text style={styles.inputSubLabel}>Choose one that best describes your main objective:</Text>
                <View style={styles.goalsGrid}>
                    {goalOptions.map((goalOption) => (
                        <TouchableOpacity
                            key={goalOption.key}
                            style={[
                                styles.goalButton,
                                profile.goal === goalOption.key && styles.goalButtonActive
                            ]}
                            onPress={() => selectGoal(goalOption.key)}
                        >
                            {profile.goal === goalOption.key && (
                                <Check size={16} color="#FFFFFF" />
                            )}
                            <Text style={[
                                styles.goalButtonText,
                                profile.goal === goalOption.key && styles.goalButtonTextActive
                            ]}>{goalOption.label}</Text>
                            <Text style={[
                                styles.goalButtonDesc,
                                profile.goal === goalOption.key && styles.goalButtonDescActive
                            ]}>{goalOption.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Preferences (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.foodPreferences}
                    onChangeText={(text) => updateProfile({ foodPreferences: text })}
                    placeholder="Describe your food preferences, favorite cuisines, dietary restrictions, etc."
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Allergies (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.allergies}
                    onChangeText={(text) => updateProfile({ allergies: text })}
                    placeholder="e.g., Nuts, Dairy, Shellfish"
                    multiline
                    numberOfLines={2}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Health Conditions (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.healthConditions}
                    onChangeText={(text) => updateProfile({ healthConditions: text })}
                    placeholder="e.g., Diabetes, Hypertension"
                    multiline
                    numberOfLines={2}
                />
            </View>
        </View>
    );
};
