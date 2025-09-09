import { User } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AgeInput } from './components/AgeInput';
import { onboardingStyles as styles } from './styles';
import { UserProfile } from './types';

interface PersonalInfoStepProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ profile, updateProfile }) => {
    return (
        <View style={styles.stepContent}>
            <User size={48} color="#10B981" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Tell us about yourself</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Full Name
                    <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                    style={styles.textInput}
                    value={profile.name}
                    onChangeText={(text) => updateProfile({ name: text })}
                    placeholder="Enter your name"
                />
            </View>

            <AgeInput
                label="Age"
                value={profile.age}
                onChangeValue={(age: number | null) => updateProfile({ age })}
                required
            />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Gender
                    <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.genderButtons}>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            profile.gender === 'male' && styles.genderButtonActive
                        ]}
                        onPress={() => updateProfile({ gender: 'male' })}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            profile.gender === 'male' && styles.genderButtonTextActive
                        ]}>Male</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            profile.gender === 'female' && styles.genderButtonActive
                        ]}
                        onPress={() => updateProfile({ gender: 'female' })}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            profile.gender === 'female' && styles.genderButtonTextActive
                        ]}>Female</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
