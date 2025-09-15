import { User } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile } from '../../hooks/onboardingTypes';
import { onboardingStyles as styles } from '../../styles/tabs/onboardingStyles';
import { AgeInput } from '../inputs/AgeInput';

interface PersonalInfoStepProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ profile, updateProfile }) => {
    return (
        <View style={styles.stepContent}>
            <User size={48} color="#10B981" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Beritahu tentang diri Anda</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Nama Lengkap
                    <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                    style={styles.textInput}
                    value={profile.nama}
                    onChangeText={(text) => updateProfile({ nama: text })}
                    placeholder=""
                />
            </View>

            <AgeInput
                label="Usia"
                value={profile.usia}
                onChangeValue={(usia: number | null) => updateProfile({ usia })}
                required
            />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Jenis Kelamin
                    <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.genderButtons}>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            profile.jenis_kelamin === 'male' && styles.genderButtonActive
                        ]}
                        onPress={() => updateProfile({ jenis_kelamin: 'male' })}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            profile.jenis_kelamin === 'male' && styles.genderButtonTextActive
                        ]}>Laki-laki</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            profile.jenis_kelamin === 'female' && styles.genderButtonActive
                        ]}
                        onPress={() => updateProfile({ jenis_kelamin: 'female' })}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            profile.jenis_kelamin === 'female' && styles.genderButtonTextActive
                        ]}>Perempuan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default PersonalInfoStep;
