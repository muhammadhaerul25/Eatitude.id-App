import React from 'react';
import { Text, View } from 'react-native';
import { NutritionPlan } from '../../hooks/types';
import { personalStyles } from '../../styles/tabs/personalStyles';

interface NutritionSectionsProps {
    nutritionPlan: NutritionPlan;
}

export const NutritionSections: React.FC<NutritionSectionsProps> = ({ nutritionPlan }) => {
    return (
        <>
            {/* Calorie Needs */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Kalori</Text>
                <View style={personalStyles.calorieCard}>
                    <Text style={personalStyles.calorieValue}>{nutritionPlan.kebutuhan_kalori["total_kalori_per_hari_(kcal)"]}</Text>
                    <Text style={personalStyles.calorieLabel}>kcal per hari</Text>
                </View>
            </View>

            {/* Macronutrients */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Makronutrisi</Text>
                <View style={personalStyles.macroGrid}>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.kebutuhan_makronutrisi["karbohidrat_per_hari_(g)"]}g</Text>
                        <Text style={personalStyles.macroLabel}>Karbohidrat per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.kebutuhan_makronutrisi["protein_per_hari_(g)"]}g</Text>
                        <Text style={personalStyles.macroLabel}>Protein per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.kebutuhan_makronutrisi["lemak_per_hari_(g)"]}g</Text>
                        <Text style={personalStyles.macroLabel}>Lemak per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.kebutuhan_makronutrisi["serat_per_hari_(g)"]}g</Text>
                        <Text style={personalStyles.macroLabel}>Serat per hari</Text>
                    </View>
                </View>
            </View>

            {/* Micronutrients - Vitamins */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Mikronutrisi</Text>
                <Text style={[personalStyles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>
                    Vitamin (mg) per hari
                </Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin A</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_a_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin B Kompleks</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_b_kompleks_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin C</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_c_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin D</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_d_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin E</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_e_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin K</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["vitamin_k_per_hari_(mg)"]}mg</Text>
                    </View>
                </View>

                <Text style={[personalStyles.sectionTitle, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                    Mineral (mg) per hari
                </Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Kalsium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["kalsium_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Zat Besi</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["zat_besi_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Magnesium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["magnesium_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Kalium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["kalium_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Natrium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["natrium_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Zinc</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["zinc_per_hari_(mg)"]}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Yodium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.kebutuhan_mikronutrisi["yodium_per_hari_(mg)"]}mg</Text>
                    </View>
                </View>
            </View>

            {/* Consumption Limits */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Batasi Konsumsi</Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Gula</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["gula_per_hari_(g)"]}g/hari</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Garam</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["garam_per_hari_(g)"]}g/hari</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Kafein</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["kafein_per_hari_(mg)"]}mg/hari</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Lemak Jenuh</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["lemak_jenuh_per_hari_(g)"]}g/hari</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Lemak Trans</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["lemak_trans_per_hari_(g)"]}g/hari</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Kolesterol</Text>
                        <Text style={personalStyles.limitValue}>max {nutritionPlan.batasi_konsumsi["kolesterol_per_hari_(mg)"]}mg/hari</Text>
                    </View>
                </View>
            </View>

            {/* Hydration Needs */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Cairan</Text>
                <View style={personalStyles.hydrationCard}>
                    <View style={personalStyles.hydrationItem}>
                        <Text style={personalStyles.hydrationValue}>{nutritionPlan.kebutuhan_cairan["air_per_hari_(liter)"]}L</Text>
                        <Text style={personalStyles.hydrationLabel}>per hari</Text>
                    </View>
                    <Text style={personalStyles.hydrationOr}>atau</Text>
                    <View style={personalStyles.hydrationItem}>
                        <Text style={personalStyles.hydrationValue}>{nutritionPlan.kebutuhan_cairan["air_per_hari_(gelas)"]}</Text>
                        <Text style={personalStyles.hydrationLabel}>gelas per hari</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Catatan</Text>
                <View style={personalStyles.card}>
                    <Text style={personalStyles.notesText}>{nutritionPlan.catatan}</Text>
                </View>
            </View>
        </>
    );
};

export default NutritionSections;
