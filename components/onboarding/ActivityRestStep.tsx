import { Activity } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile, activityLevels } from '../../hooks/onboardingTypes';
import { onboardingStyles as styles } from '../../styles/tabs/onboardingStyles';
import { TimeInput } from '../inputs/TimeInput';

interface ActivityRestStepProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

export const ActivityRestStep: React.FC<ActivityRestStepProps> = ({ profile, updateProfile }) => {
    return (
        <View style={styles.stepContent}>
            <Activity size={48} color="#10B981" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Activity & Rest</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Activity Level
                    <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.activityButtons}>
                    {activityLevels.map((activity: { key: string; label: string; description: string }) => (
                        <TouchableOpacity
                            key={activity.key}
                            style={[
                                styles.activityButton,
                                profile.tingkat_aktivitas === activity.key && styles.activityButtonActive
                            ]}
                            onPress={() => updateProfile({ tingkat_aktivitas: activity.key as any })}
                        >
                            <Text style={[
                                styles.activityButtonTitle,
                                profile.tingkat_aktivitas === activity.key && styles.activityButtonTitleActive
                            ]}>{activity.label}</Text>
                            <Text style={[
                                styles.activityButtonDesc,
                                profile.tingkat_aktivitas === activity.key && styles.activityButtonDescActive
                            ]}>{activity.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Notes (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.catatan_aktivitas}
                    onChangeText={(text) => updateProfile({ catatan_aktivitas: text })}
                    placeholder="Describe your typical activities or exercise routine..."
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.timeRow}>
                <View style={styles.halfWidth}>
                    <TimeInput
                        label="Wake Time"
                        value={profile.waktu_bangun}
                        onChangeValue={(waktu_bangun) => updateProfile({ waktu_bangun })}
                        placeholder="06:00"
                        required
                    />
                </View>

                <View style={styles.halfWidth}>
                    <TimeInput
                        label="Sleep Time"
                        value={profile.waktu_tidur}
                        onChangeValue={(waktu_tidur) => updateProfile({ waktu_tidur })}
                        placeholder="22:00"
                        required
                    />
                </View>
            </View>
        </View>
    );
};

export default ActivityRestStep;
