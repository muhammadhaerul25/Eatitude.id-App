import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Droplet,
  Target
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  // Sample data - in a real app this would come from the nutrition plan and daily tracking
  const dailyTargets = {
    calories: { current: 1650, target: 2000 },
    macros: {
      carbs: { current: 180, target: 250 },
      protein: { current: 120, target: 150 },
      fat: { current: 45, target: 67 },
      fiber: { current: 18, target: 25 },
    },
    vitamins: {
      vitaminA: { current: 720, target: 900 },
      vitaminB: { current: 2.1, target: 2.4 },
      vitaminC: { current: 108, target: 90 },
      vitaminD: { current: 15, target: 20 },
      vitaminE: { current: 12, target: 15 },
      vitaminK: { current: 145, target: 120 },
    },
    minerals: {
      calcium: { current: 1100, target: 1000 },
      iron: { current: 16, target: 18 },
      magnesium: { current: 280, target: 400 },
      potassium: { current: 2100, target: 3500 },
      sodium: { current: 2000, target: 2300 },
      zinc: { current: 13, target: 11 },
      iodine: { current: 135, target: 150 },
    },
    limits: {
      sugar: { current: 35, target: 50 }, // grams
      salt: { current: 2.8, target: 5 }, // grams
      saturatedFat: { current: 25, target: 20 }, // grams
      transFat: { current: 3, target: 2 }, // grams
      caffeine: { current: 320, target: 400 }, // mg
      cholesterol: { current: 180, target: 300 }, // mg
    },
    hydration: { current: 6, target: 10 } // glasses
  };

  const getProgressPercentage = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const getMicronutrientStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 80) return { status: 'Kurang', color: '#EF4444', icon: AlertTriangle };
    if (percentage > 120) return { status: 'Berlebih', color: '#F59E0B', icon: AlertCircle };
    return { status: 'Cukup', color: '#10B981', icon: CheckCircle };
  };

  const getLimitStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 70) return { status: 'Aman', color: '#10B981', bgColor: '#D1FAE5' };
    if (percentage <= 100) return { status: 'Waspada', color: '#F59E0B', bgColor: '#FEF3C7' };
    return { status: 'Bahaya', color: '#EF4444', bgColor: '#FEE2E2' };
  };

  const ProgressBar = ({ current, target, color = '#10B981' }: { current: number, target: number, color?: string }) => {
    const percentage = Math.min(getProgressPercentage(current, target), 100);

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  const StatusIndicator = ({ status, color }: { status: string, color: string }) => (
    <View style={[styles.statusIndicator, { backgroundColor: color }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <View style={styles.periodSelector}>
          {['day', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calorie Target Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Kalori</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Target size={24} color="#10B981" />
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Kalori</Text>
                <Text style={styles.cardSubtitle}>
                  {dailyTargets.calories.current} kcal / {dailyTargets.calories.target} kcal
                </Text>
              </View>
            </View>
            <ProgressBar
              current={dailyTargets.calories.current}
              target={dailyTargets.calories.target}
              color="#10B981"
            />
          </View>
        </View>

        {/* Macronutrients Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Makronutrisi</Text>
          <View style={styles.card}>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Karbohidrat</Text>
                <Text style={styles.macroValue}>
                  {dailyTargets.macros.carbs.current} g / {dailyTargets.macros.carbs.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.carbs.current}
                  target={dailyTargets.macros.carbs.target}
                  color="#F59E0B"
                />
              </View>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>
                  {dailyTargets.macros.protein.current} g / {dailyTargets.macros.protein.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.protein.current}
                  target={dailyTargets.macros.protein.target}
                  color="#3B82F6"
                />
              </View>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Lemak</Text>
                <Text style={styles.macroValue}>
                  {dailyTargets.macros.fat.current} g / {dailyTargets.macros.fat.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.fat.current}
                  target={dailyTargets.macros.fat.target}
                  color="#8B5CF6"
                />
              </View>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Serat</Text>
                <Text style={styles.macroValue}>
                  {dailyTargets.macros.fiber.current} g / {dailyTargets.macros.fiber.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.fiber.current}
                  target={dailyTargets.macros.fiber.target}
                  color="#06B6D4"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Micronutrient Status Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Mikronutrisi</Text>
          <View style={styles.card}>
            {/* Vitamins */}
            <Text style={styles.subSectionTitle}>Vitamin</Text>
            {Object.entries(dailyTargets.vitamins).map(([vitamin, data]) => {
              const status = getMicronutrientStatus(data.current, data.target);
              const IconComponent = status.icon;
              const vitaminLabels = {
                vitaminA: 'Vitamin A',
                vitaminB: 'Vitamin B',
                vitaminC: 'Vitamin C',
                vitaminD: 'Vitamin D',
                vitaminE: 'Vitamin E',
                vitaminK: 'Vitamin K',
              };
              return (
                <View key={vitamin} style={styles.microRow}>
                  <View style={styles.microInfo}>
                    <Text style={styles.microLabel}>
                      {vitaminLabels[vitamin as keyof typeof vitaminLabels]}
                    </Text>
                  </View>
                  <View style={styles.microStatus}>
                    <IconComponent size={16} color={status.color} />
                    <Text style={[styles.microStatusText, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Minerals */}
            <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>Mineral</Text>
            {Object.entries(dailyTargets.minerals).map(([mineral, data]) => {
              const status = getMicronutrientStatus(data.current, data.target);
              const IconComponent = status.icon;
              const mineralLabels = {
                calcium: 'Kalsium',
                iron: 'Zat Besi',
                magnesium: 'Magnesium',
                potassium: 'Kalium',
                sodium: 'Natrium',
                zinc: 'Zinc',
                iodine: 'Yodium',
              };
              return (
                <View key={mineral} style={styles.microRow}>
                  <View style={styles.microInfo}>
                    <Text style={styles.microLabel}>
                      {mineralLabels[mineral as keyof typeof mineralLabels]}
                    </Text>
                  </View>
                  <View style={styles.microStatus}>
                    <IconComponent size={16} color={status.color} />
                    <Text style={[styles.microStatusText, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Indicator Legend */}
            <View style={styles.indicatorLegend}>
              <Text style={styles.indicatorTitle}>Indikator</Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#EF4444' }]}>Kurang</Text> → &lt; 80% kebutuhan harian
              </Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#10B981' }]}>Cukup</Text> → 80% – 120% kebutuhan harian
              </Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#F59E0B' }]}>Berlebih</Text> → &gt; 120% kebutuhan harian
              </Text>
            </View>
          </View>
        </View>

        {/* Consumption Limits Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batas Konsumsi</Text>
          <View style={styles.card}>
            <Text style={styles.subSectionTitle}>Batas Konsumsi</Text>
            {Object.entries(dailyTargets.limits).map(([limit, data]) => {
              const status = getLimitStatus(data.current, data.target);
              const limitLabels = {
                sugar: 'Gula',
                salt: 'Garam',
                saturatedFat: 'Lemak Jenuh',
                transFat: 'Lemak Trans',
                caffeine: 'Kafein',
                cholesterol: 'Kolesterol',
              };

              return (
                <View key={limit} style={styles.limitRow}>
                  <View style={styles.limitInfo}>
                    <Text style={styles.limitLabel}>
                      {limitLabels[limit as keyof typeof limitLabels]}
                    </Text>
                  </View>
                  <View style={[styles.limitAlert, { backgroundColor: status.bgColor }]}>
                    <AlertTriangle size={16} color={status.color} />
                    <Text style={[styles.limitStatus, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Alert Legend */}
            <View style={styles.alertLegend}>
              <Text style={styles.indicatorTitle}>Alert</Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#10B981' }]}>Aman</Text> → &lt; 70% dari batas maksimal
              </Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#F59E0B' }]}>Waspada</Text> → 70% – 100% dari batas maksimal
              </Text>
              <Text style={styles.indicatorText}>
                <Text style={[styles.indicatorLabel, { color: '#EF4444' }]}>Bahaya</Text> → &gt; 100% dari batas maksimal
              </Text>
            </View>
          </View>
        </View>

        {/* Hydration Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asupan Cairan</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Droplet size={24} color="#3B82F6" />
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Asupan Air</Text>
                <Text style={styles.cardSubtitle}>
                  {dailyTargets.hydration.current} gelas / {dailyTargets.hydration.target} gelas
                </Text>
              </View>
            </View>
            <View style={styles.hydrationVisual}>
              {Array.from({ length: dailyTargets.hydration.target }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.waterGlass,
                    index < dailyTargets.hydration.current && styles.waterGlassFilled
                  ]}
                >
                  <Droplet
                    size={20}
                    color={index < dailyTargets.hydration.current ? '#3B82F6' : '#D1D5DB'}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 35,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  macroRow: {
    marginBottom: 16,
  },
  macroItem: {
    gap: 8,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  macroValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  microInfo: {
    flex: 1,
  },
  microLabel: {
    fontSize: 14,
    color: '#374151',
  },
  microValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  microStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  microStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  limitInfo: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  limitValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  limitAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  limitStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  hydrationVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  waterGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassFilled: {
    backgroundColor: '#DBEAFE',
  },
  bottomSpacing: {
    height: 24,
  },
  indicatorLegend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  alertLegend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  indicatorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  indicatorLabel: {
    fontWeight: '600',
  },
});