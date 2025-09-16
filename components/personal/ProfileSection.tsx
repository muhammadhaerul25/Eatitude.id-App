import React from 'react';
import { Text, View } from 'react-native';
import { UserProfile, activityLevelLabels, goalLabels } from '../../hooks/onboardingTypes';
import { personalStyles } from '../../styles/tabs/personalStyles';

interface ProfileSectionProps {
    profile: UserProfile;
    getBMI: () => string;
    getBMICategory: (bmi: number) => { category: string; color: string };
    getSleepDuration: () => string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    profile,
    getBMI,
    getBMICategory,
    getSleepDuration,
}) => {
    const bmi = parseFloat(getBMI());
    const bmiCategory = getBMICategory(bmi);

    return (
        <View style={personalStyles.section}>
            <Text style={personalStyles.sectionTitle}>Profil</Text>
            <View style={personalStyles.card}>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Nama</Text>
                    <Text style={personalStyles.profileValue}>{profile.nama}</Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Usia</Text>
                    <Text style={personalStyles.profileValue}>{profile.usia} tahun</Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Jenis Kelamin</Text>
                    <Text style={personalStyles.profileValue}>
                        {profile.jenis_kelamin === 'male' ? 'Laki-laki' : 'Perempuan'}
                    </Text>
                </View>
            </View>

            <Text style={[personalStyles.sectionTitle, { marginTop: 20 }]}>Data Tubuh</Text>
            <View style={personalStyles.card}>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Berat Badan (kg)</Text>
                    <Text style={personalStyles.profileValue}>{profile.berat_badan} kg</Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Tinggi Badan (cm)</Text>
                    <Text style={personalStyles.profileValue}>{profile.tinggi_badan} cm</Text>
                </View>
                <View style={personalStyles.bmiRow}>
                    <Text style={personalStyles.bmiLabel}>Indeks Massa Tubuh (IMT)</Text>
                    <Text style={[personalStyles.bmiValue, { color: bmiCategory.color }]}>
                        {getBMI()} ({bmiCategory.category})
                    </Text>
                </View>
            </View>

            <Text style={[personalStyles.sectionTitle, { marginTop: 20 }]}>Aktivitas dan Istirahat</Text>
            <View style={personalStyles.card}>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Tingkat Aktivitas</Text>
                    <Text style={personalStyles.profileValue}>
                        {activityLevelLabels[profile.tingkat_aktivitas as keyof typeof activityLevelLabels]}
                    </Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Catatan Aktivitas</Text>
                    <Text style={profile.catatan_aktivitas ? personalStyles.profileValue : personalStyles.profileValuePlaceholder}>
                        {profile.catatan_aktivitas || 'Tidak ada catatan khusus'}
                    </Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Durasi Tidur</Text>
                    <Text style={personalStyles.profileValue}>{getSleepDuration()}</Text>
                </View>
            </View>

            <Text style={[personalStyles.sectionTitle, { marginTop: 20 }]}>Kesehatan dan Preferensi</Text>
            <View style={personalStyles.card}>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Preferensi Makanan</Text>
                    <Text style={profile.preferensi_makanan ? personalStyles.profileValue : personalStyles.profileValuePlaceholder}>
                        {profile.preferensi_makanan || 'Tidak ada preferensi khusus'}
                    </Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Alergi Makanan</Text>
                    <Text style={profile.alergi_makanan ? personalStyles.profileValue : personalStyles.profileValuePlaceholder}>
                        {profile.alergi_makanan || 'Tidak ada alergi'}
                    </Text>
                </View>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Kondisi Kesehatan</Text>
                    <Text style={profile.kondisi_kesehatan ? personalStyles.profileValue : personalStyles.profileValuePlaceholder}>
                        {profile.kondisi_kesehatan || 'Tidak ada kondisi khusus'}
                    </Text>
                </View>
            </View>

            <Text style={[personalStyles.sectionTitle, { marginTop: 20 }]}>Tujuan dan Sasaran</Text>
            <View style={personalStyles.card}>
                <View style={personalStyles.profileRow}>
                    <Text style={personalStyles.profileLabel}>Tujuan Utama</Text>
                    <Text style={personalStyles.profileValue}>
                        {goalLabels[profile.tujuan as keyof typeof goalLabels]}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default ProfileSection;
