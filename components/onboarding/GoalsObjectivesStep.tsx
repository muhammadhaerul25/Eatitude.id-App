import { Check, Heart } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile, goalOptions } from '../../hooks/onboardingTypes';
import { onboardingStyles as styles } from '../../styles/tabs/onboardingStyles';

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
            <Text style={styles.stepTitle}>Kesehatan, Preferensi dan Tujuan</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Pilih Tujuan Utama Anda
                    <Text style={styles.required}> *</Text>
                </Text>
                <Text style={styles.inputSubLabel}>Pilih salah satu yang paling menggambarkan tujuan utama Anda:</Text>
                <View style={styles.goalsGrid}>
                    {goalOptions.map((goalOption: { key: string; label: string; description: string }) => (
                        <TouchableOpacity
                            key={goalOption.key}
                            style={[
                                styles.goalButton,
                                profile.tujuan === goalOption.key && styles.goalButtonActive
                            ]}
                            onPress={() => selectGoal(goalOption.key)}
                        >
                            {profile.tujuan === goalOption.key && (
                                <Check size={16} color="#FFFFFF" />
                            )}
                            <Text style={[
                                styles.goalButtonText,
                                profile.tujuan === goalOption.key && styles.goalButtonTextActive
                            ]}>{goalOption.label}</Text>
                            <Text style={[
                                styles.goalButtonDesc,
                                profile.tujuan === goalOption.key && styles.goalButtonDescActive
                            ]}>{goalOption.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferensi Makanan (Opsional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.preferensi_makanan}
                    onChangeText={(text) => updateProfile({ preferensi_makanan: text })}
                    placeholder=""
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alergi Makanan (Opsional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.alergi_makanan}
                    onChangeText={(text) => updateProfile({ alergi_makanan: text })}
                    placeholder=""
                    multiline
                    numberOfLines={2}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kondisi Kesehatan (Opsional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.kondisi_kesehatan}
                    onChangeText={(text) => updateProfile({ kondisi_kesehatan: text })}
                    placeholder=""
                    multiline
                    numberOfLines={2}
                />
            </View>
        </View>
    );
};

export default GoalsObjectivesStep;
