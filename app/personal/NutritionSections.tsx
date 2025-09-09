import React from 'react';
import { Text, View } from 'react-native';
import { personalStyles } from './styles';
import { NutritionPlan } from './types';

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
                    <Text style={personalStyles.calorieValue}>{nutritionPlan.calories}</Text>
                    <Text style={personalStyles.calorieLabel}>kcal per hari</Text>
                </View>
            </View>

            {/* Macronutrients */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Makronutrisi</Text>
                <View style={personalStyles.macroGrid}>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.macros.carbs}g</Text>
                        <Text style={personalStyles.macroLabel}>Karbohidrat per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.macros.protein}g</Text>
                        <Text style={personalStyles.macroLabel}>Protein per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.macros.fat}g</Text>
                        <Text style={personalStyles.macroLabel}>Lemak per hari</Text>
                    </View>
                    <View style={personalStyles.macroCard}>
                        <Text style={personalStyles.macroValue}>{nutritionPlan.macros.fiber}g</Text>
                        <Text style={personalStyles.macroLabel}>Serat per hari</Text>
                    </View>
                </View>
            </View>

            {/* Micronutrients - Vitamins */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Mikronutrisi</Text>
                <Text style={[personalStyles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>
                    Vitamin (mg/µg) per hari
                </Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin A</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminA}µg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin B Kompleks</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminB}µg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin C</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminC}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin D</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminD}µg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin E</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminE}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Vitamin K</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.vitamins.vitaminK}µg</Text>
                    </View>
                </View>

                <Text style={[personalStyles.sectionTitle, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                    Mineral (mg/µg) per hari
                </Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Kalsium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.calcium}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Zat Besi</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.iron}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Magnesium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.magnesium}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Kalium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.potassium}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Natrium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.sodium}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Zinc</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.zinc}mg</Text>
                    </View>
                    <View style={personalStyles.microRow}>
                        <Text style={personalStyles.microLabel}>Yodium</Text>
                        <Text style={personalStyles.microValue}>{nutritionPlan.minerals.iodine}µg</Text>
                    </View>
                </View>
            </View>

            {/* Consumption Limits */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Batasi Konsumsi</Text>
                <View style={personalStyles.card}>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Gula</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.sugar}</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Garam</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.salt}</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Kafein</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.caffeine}</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Lemak Jenuh</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.saturatedFat}</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Lemak Trans</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.transFat}</Text>
                    </View>
                    <View style={personalStyles.limitRow}>
                        <Text style={personalStyles.limitLabel}>Kolesterol</Text>
                        <Text style={personalStyles.limitValue}>{nutritionPlan.limits.cholesterol}</Text>
                    </View>
                </View>
            </View>

            {/* Hydration Needs */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Kebutuhan Cairan</Text>
                <View style={personalStyles.hydrationCard}>
                    <View style={personalStyles.hydrationItem}>
                        <Text style={personalStyles.hydrationValue}>{nutritionPlan.hydration.liters}L</Text>
                        <Text style={personalStyles.hydrationLabel}>per hari</Text>
                    </View>
                    <Text style={personalStyles.hydrationOr}>atau</Text>
                    <View style={personalStyles.hydrationItem}>
                        <Text style={personalStyles.hydrationValue}>{nutritionPlan.hydration.glasses}</Text>
                        <Text style={personalStyles.hydrationLabel}>gelas per hari</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            <View style={personalStyles.section}>
                <Text style={personalStyles.sectionTitle}>Catatan</Text>
                <View style={personalStyles.card}>
                    <Text style={personalStyles.notesText}>{nutritionPlan.notes}</Text>
                </View>
            </View>
        </>
    );
};
