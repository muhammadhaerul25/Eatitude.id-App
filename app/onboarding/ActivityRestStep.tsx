import { Activity } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TimeInput } from './components/TimeInput';
import { onboardingStyles as styles } from './styles';
import { UserProfile, activityLevels } from './types';

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
                    {activityLevels.map((activity) => (
                        <TouchableOpacity
                            key={activity.key}
                            style={[
                                styles.activityButton,
                                profile.activityLevel === activity.key && styles.activityButtonActive
                            ]}
                            onPress={() => updateProfile({ activityLevel: activity.key as any })}
                        >
                            <Text style={[
                                styles.activityButtonTitle,
                                profile.activityLevel === activity.key && styles.activityButtonTitleActive
                            ]}>{activity.label}</Text>
                            <Text style={[
                                styles.activityButtonDesc,
                                profile.activityLevel === activity.key && styles.activityButtonDescActive
                            ]}>{activity.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Notes (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={profile.activityNotes}
                    onChangeText={(text) => updateProfile({ activityNotes: text })}
                    placeholder="Describe your typical activities or exercise routine..."
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.timeRow}>
                <View style={styles.halfWidth}>
                    <TimeInput
                        label="Wake Time"
                        value={profile.wakeTime}
                        onChangeValue={(wakeTime) => updateProfile({ wakeTime })}
                        placeholder="06:00"
                        required
                    />
                </View>

                <View style={styles.halfWidth}>
                    <TimeInput
                        label="Sleep Time"
                        value={profile.sleepTime}
                        onChangeValue={(sleepTime) => updateProfile({ sleepTime })}
                        placeholder="22:00"
                        required
                    />
                </View>
            </View>
        </View>
    );
};
