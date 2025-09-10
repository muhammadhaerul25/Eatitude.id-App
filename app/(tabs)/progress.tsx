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
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { progressTabStyles } from '../../styles/tabs/progressStyles';

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
      <View style={progressTabStyles.progressBarContainer}>
        <View style={progressTabStyles.progressBarBackground}>
          <View
            style={[
              progressTabStyles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color }
            ]}
          />
        </View>
        <Text style={progressTabStyles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  const StatusIndicator = ({ status, color }: { status: string, color: string }) => (
    <View style={[progressTabStyles.statusIndicator, { backgroundColor: color }]}>
      <Text style={progressTabStyles.statusText}>{status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={progressTabStyles.container}>
      {/* Header */}
      <View style={progressTabStyles.header}>
        <Text style={progressTabStyles.headerTitle}>Progress Tracking</Text>
        <View style={progressTabStyles.periodSelector}>
          {['day', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                progressTabStyles.periodButton,
                selectedPeriod === period && progressTabStyles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[
                progressTabStyles.periodButtonText,
                selectedPeriod === period && progressTabStyles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={progressTabStyles.content} showsVerticalScrollIndicator={false}>
        {/* Calorie Target Card */}
        <View style={progressTabStyles.section}>
          <Text style={progressTabStyles.sectionTitle}>Target Kalori</Text>
          <View style={progressTabStyles.card}>
            <View style={progressTabStyles.cardHeader}>
              <Target size={24} color="#10B981" />
              <View style={progressTabStyles.cardHeaderText}>
                <Text style={progressTabStyles.cardTitle}>Kalori</Text>
                <Text style={progressTabStyles.cardSubtitle}>
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
        <View style={progressTabStyles.section}>
          <Text style={progressTabStyles.sectionTitle}>Target Makronutrisi</Text>
          <View style={progressTabStyles.card}>
            <View style={progressTabStyles.macroRow}>
              <View style={progressTabStyles.macroItem}>
                <Text style={progressTabStyles.macroLabel}>Karbohidrat</Text>
                <Text style={progressTabStyles.macroValue}>
                  {dailyTargets.macros.carbs.current} g / {dailyTargets.macros.carbs.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.carbs.current}
                  target={dailyTargets.macros.carbs.target}
                  color="#F59E0B"
                />
              </View>
            </View>
            <View style={progressTabStyles.macroRow}>
              <View style={progressTabStyles.macroItem}>
                <Text style={progressTabStyles.macroLabel}>Protein</Text>
                <Text style={progressTabStyles.macroValue}>
                  {dailyTargets.macros.protein.current} g / {dailyTargets.macros.protein.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.protein.current}
                  target={dailyTargets.macros.protein.target}
                  color="#3B82F6"
                />
              </View>
            </View>
            <View style={progressTabStyles.macroRow}>
              <View style={progressTabStyles.macroItem}>
                <Text style={progressTabStyles.macroLabel}>Lemak</Text>
                <Text style={progressTabStyles.macroValue}>
                  {dailyTargets.macros.fat.current} g / {dailyTargets.macros.fat.target} g
                </Text>
                <ProgressBar
                  current={dailyTargets.macros.fat.current}
                  target={dailyTargets.macros.fat.target}
                  color="#8B5CF6"
                />
              </View>
            </View>
            <View style={progressTabStyles.macroRow}>
              <View style={progressTabStyles.macroItem}>
                <Text style={progressTabStyles.macroLabel}>Serat</Text>
                <Text style={progressTabStyles.macroValue}>
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
        <View style={progressTabStyles.section}>
          <Text style={progressTabStyles.sectionTitle}>Status Mikronutrisi</Text>
          <View style={progressTabStyles.card}>
            {/* Vitamins */}
            <Text style={progressTabStyles.subSectionTitle}>Vitamin</Text>
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
                <View key={vitamin} style={progressTabStyles.microRow}>
                  <View style={progressTabStyles.microInfo}>
                    <Text style={progressTabStyles.microLabel}>
                      {vitaminLabels[vitamin as keyof typeof vitaminLabels]}
                    </Text>
                  </View>
                  <View style={progressTabStyles.microStatus}>
                    <IconComponent size={16} color={status.color} />
                    <Text style={[progressTabStyles.microStatusText, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Minerals */}
            <Text style={[progressTabStyles.subSectionTitle, { marginTop: 16 }]}>Mineral</Text>
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
                <View key={mineral} style={progressTabStyles.microRow}>
                  <View style={progressTabStyles.microInfo}>
                    <Text style={progressTabStyles.microLabel}>
                      {mineralLabels[mineral as keyof typeof mineralLabels]}
                    </Text>
                  </View>
                  <View style={progressTabStyles.microStatus}>
                    <IconComponent size={16} color={status.color} />
                    <Text style={[progressTabStyles.microStatusText, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Indicator Legend */}
            <View style={progressTabStyles.indicatorLegend}>
              <Text style={progressTabStyles.indicatorTitle}>Indikator</Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#EF4444' }]}>Kurang</Text> → &lt; 80% kebutuhan harian
              </Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#10B981' }]}>Cukup</Text> → 80% – 120% kebutuhan harian
              </Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#F59E0B' }]}>Berlebih</Text> → &gt; 120% kebutuhan harian
              </Text>
            </View>
          </View>
        </View>

        {/* Consumption Limits Card */}
        <View style={progressTabStyles.section}>
          <Text style={progressTabStyles.sectionTitle}>Batas Konsumsi</Text>
          <View style={progressTabStyles.card}>
            <Text style={progressTabStyles.subSectionTitle}>Batas Konsumsi</Text>
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
                <View key={limit} style={progressTabStyles.limitRow}>
                  <View style={progressTabStyles.limitInfo}>
                    <Text style={progressTabStyles.limitLabel}>
                      {limitLabels[limit as keyof typeof limitLabels]}
                    </Text>
                  </View>
                  <View style={[progressTabStyles.limitAlert, { backgroundColor: status.bgColor }]}>
                    <AlertTriangle size={16} color={status.color} />
                    <Text style={[progressTabStyles.limitStatus, { color: status.color }]}>
                      ({status.status})
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Alert Legend */}
            <View style={progressTabStyles.alertLegend}>
              <Text style={progressTabStyles.indicatorTitle}>Alert</Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#10B981' }]}>Aman</Text> → &lt; 70% dari batas maksimal
              </Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#F59E0B' }]}>Waspada</Text> → 70% – 100% dari batas maksimal
              </Text>
              <Text style={progressTabStyles.indicatorText}>
                <Text style={[progressTabStyles.indicatorLabel, { color: '#EF4444' }]}>Bahaya</Text> → &gt; 100% dari batas maksimal
              </Text>
            </View>
          </View>
        </View>

        {/* Hydration Card */}
        <View style={progressTabStyles.section}>
          <Text style={progressTabStyles.sectionTitle}>Asupan Cairan</Text>
          <View style={progressTabStyles.card}>
            <View style={progressTabStyles.cardHeader}>
              <Droplet size={24} color="#3B82F6" />
              <View style={progressTabStyles.cardHeaderText}>
                <Text style={progressTabStyles.cardTitle}>Asupan Air</Text>
                <Text style={progressTabStyles.cardSubtitle}>
                  {dailyTargets.hydration.current} gelas / {dailyTargets.hydration.target} gelas
                </Text>
              </View>
            </View>
            <View style={progressTabStyles.hydrationVisual}>
              {Array.from({ length: dailyTargets.hydration.target }, (_, index) => (
                <View
                  key={index}
                  style={[
                    progressTabStyles.waterGlass,
                    index < dailyTargets.hydration.current && progressTabStyles.waterGlassFilled
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

        <View style={progressTabStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
