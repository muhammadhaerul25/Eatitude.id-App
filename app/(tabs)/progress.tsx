import { useFocusEffect } from '@react-navigation/native';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Droplet,
  RefreshCw,
  Target
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { unifiedCache } from '../../services/unifiedCacheService';
import { progressTabStyles } from '../../styles/tabs/progressStyles';

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyTargets, setDailyTargets] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Date picker functionality for viewing different days
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Load real progress data from cache
  const loadProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      const cache = await unifiedCache.getCache();
      const dayCache = await unifiedCache.getDayCache(selectedDate);

      if (!cache.personal_plan) {
        console.warn('No personal plan found - using default values');
        setDailyTargets(getDefaultTargets());
        return;
      }

      // Extract targets from personal plan
      const personalPlan = cache.personal_plan;
      const progress = dayCache.progress;

      const targets = {
        calories: {
          current: progress.calories_eaten,
          target: personalPlan.kebutuhan_kalori?.["total_kalori_per_hari_(kcal)"] || progress.calories_target || 2000
        },
        macros: {
          carbs: {
            current: progress.macros_eaten.carbs,
            target: personalPlan.kebutuhan_makronutrisi?.["karbohidrat_per_hari_(g)"] || progress.macros_target.carbs || 250
          },
          protein: {
            current: progress.macros_eaten.protein,
            target: personalPlan.kebutuhan_makronutrisi?.["protein_per_hari_(g)"] || progress.macros_target.protein || 150
          },
          fat: {
            current: progress.macros_eaten.fat,
            target: personalPlan.kebutuhan_makronutrisi?.["lemak_per_hari_(g)"] || progress.macros_target.fat || 67
          },
          fiber: {
            current: progress.macros_eaten.fiber,
            target: personalPlan.kebutuhan_makronutrisi?.["serat_per_hari_(g)"] || progress.macros_target.fiber || 25
          },
        },
        vitamins: {
          vitaminA: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminA'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_a_per_hari_(mg)"] || 0.9
          },
          vitaminB: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminB'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_b_kompleks_per_hari_(mg)"] || 2.4
          },
          vitaminC: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminC'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_c_per_hari_(mg)"] || 90
          },
          vitaminD: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminD'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_d_per_hari_(mg)"] || 0.02
          },
          vitaminE: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminE'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_e_per_hari_(mg)"] || 15
          },
          vitaminK: {
            current: calculateVitaminFromMeals(dayCache, 'vitaminK'),
            target: personalPlan.kebutuhan_mikronutrisi?.["vitamin_k_per_hari_(mg)"] || 0.12
          },
        },
        minerals: {
          calcium: {
            current: calculateMineralFromMeals(dayCache, 'calcium'),
            target: personalPlan.kebutuhan_mikronutrisi?.["kalsium_per_hari_(mg)"] || 1000
          },
          iron: {
            current: calculateMineralFromMeals(dayCache, 'iron'),
            target: personalPlan.kebutuhan_mikronutrisi?.["zat_besi_per_hari_(mg)"] || 18
          },
          magnesium: {
            current: calculateMineralFromMeals(dayCache, 'magnesium'),
            target: personalPlan.kebutuhan_mikronutrisi?.["magnesium_per_hari_(mg)"] || 400
          },
          potassium: {
            current: calculateMineralFromMeals(dayCache, 'potassium'),
            target: personalPlan.kebutuhan_mikronutrisi?.["kalium_per_hari_(mg)"] || 3500
          },
          sodium: {
            current: calculateMineralFromMeals(dayCache, 'sodium'),
            target: personalPlan.kebutuhan_mikronutrisi?.["natrium_per_hari_(mg)"] || 2300
          },
          zinc: {
            current: calculateMineralFromMeals(dayCache, 'zinc'),
            target: personalPlan.kebutuhan_mikronutrisi?.["zinc_per_hari_(mg)"] || 11
          },
          iodine: {
            current: calculateMineralFromMeals(dayCache, 'iodine'),
            target: personalPlan.kebutuhan_mikronutrisi?.["yodium_per_hari_(mg)"] || 0.15
          },
        },
        limits: {
          sugar: {
            current: calculateSugarFromScannedFoods(dayCache.scanned_foods),
            target: personalPlan.batasi_konsumsi?.["gula_per_hari_(g)"] || 50
          },
          salt: {
            current: calculateSaltFromScannedFoods(dayCache.scanned_foods),
            target: personalPlan.batasi_konsumsi?.["garam_per_hari_(g)"] || 5
          },
          saturatedFat: {
            current: calculateSaturatedFatFromMeals(dayCache),
            target: personalPlan.batasi_konsumsi?.["lemak_jenuh_per_hari_(g)"] || 20
          },
          transFat: {
            current: calculateTransFatFromMeals(dayCache),
            target: personalPlan.batasi_konsumsi?.["lemak_trans_per_hari_(g)"] || 2
          },
          caffeine: {
            current: calculateCaffeineFromMeals(dayCache),
            target: personalPlan.batasi_konsumsi?.["kafein_per_hari_(mg)"] || 400
          },
          cholesterol: {
            current: calculateCholesterolFromMeals(dayCache),
            target: personalPlan.batasi_konsumsi?.["kolesterol_per_hari_(mg)"] || 300
          },
        },
        hydration: {
          current: Math.floor(progress.water_intake_ml / 250), // Convert ml to glasses 
          target: personalPlan.kebutuhan_cairan?.["air_per_hari_(gelas)"] || Math.floor(progress.water_target_ml / 250) || 10
        }
      };

      setDailyTargets(targets);

    } catch (error) {
      console.error('Error loading progress data:', error);
      setDailyTargets(getDefaultTargets());
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Calculate sugar from scanned foods
  const calculateSugarFromScannedFoods = (scannedFoods: any[]) => {
    return scannedFoods.reduce((total, food) => total + (food.nutrition?.sugar || 0), 0);
  };

  // Calculate salt from scanned foods  
  const calculateSaltFromScannedFoods = (scannedFoods: any[]) => {
    return scannedFoods.reduce((total, food) => total + ((food.nutrition?.sodium || 0) / 1000), 0); // Convert mg to g
  };

  // Calculate vitamins from completed meals and scanned foods
  const calculateVitaminFromMeals = (dayCache: any, vitaminType: string) => {
    // This is a simplified calculation - in a real app, you'd have a nutrition database
    // For now, we'll estimate based on calories consumed
    const totalCalories = dayCache.progress.calories_eaten;
    const estimates = {
      vitaminA: totalCalories * 0.0004, // Rough estimate per calorie
      vitaminB: totalCalories * 0.001,
      vitaminC: totalCalories * 0.05,
      vitaminD: totalCalories * 0.00001,
      vitaminE: totalCalories * 0.007,
      vitaminK: totalCalories * 0.00007,
    };
    return estimates[vitaminType as keyof typeof estimates] || 0;
  };

  // Calculate minerals from completed meals and scanned foods
  const calculateMineralFromMeals = (dayCache: any, mineralType: string) => {
    const totalCalories = dayCache.progress.calories_eaten;
    const estimates = {
      calcium: totalCalories * 0.5, // Rough estimate per calorie
      iron: totalCalories * 0.008,
      magnesium: totalCalories * 0.14,
      potassium: totalCalories * 1.05,
      sodium: totalCalories * 1.0,
      zinc: totalCalories * 0.0065,
      iodine: totalCalories * 0.000075,
    };
    return estimates[mineralType as keyof typeof estimates] || 0;
  };

  // Calculate saturated fat from meals
  const calculateSaturatedFatFromMeals = (dayCache: any) => {
    const totalFat = dayCache.progress.macros_eaten.fat;
    return totalFat * 0.35; // Estimate 35% of total fat as saturated
  };

  // Calculate trans fat from meals
  const calculateTransFatFromMeals = (dayCache: any) => {
    const totalFat = dayCache.progress.macros_eaten.fat;
    return totalFat * 0.02; // Estimate 2% of total fat as trans fat
  };

  // Calculate caffeine from meals
  const calculateCaffeineFromMeals = (dayCache: any) => {
    // Simple estimation - could be enhanced with meal-specific data
    return dayCache.progress.calories_eaten * 0.15; // Rough estimate
  };

  // Calculate cholesterol from meals
  const calculateCholesterolFromMeals = (dayCache: any) => {
    const totalProtein = dayCache.progress.macros_eaten.protein;
    return totalProtein * 1.2; // Rough estimate based on protein intake
  };

  // Default targets when no personal plan is available
  const getDefaultTargets = () => ({
    calories: { current: 0, target: 2000 },
    macros: {
      carbs: { current: 0, target: 250 },
      protein: { current: 0, target: 150 },
      fat: { current: 0, target: 67 },
      fiber: { current: 0, target: 25 },
    },
    vitamins: {
      vitaminA: { current: 0, target: 900 },
      vitaminB: { current: 0, target: 2.4 },
      vitaminC: { current: 0, target: 90 },
      vitaminD: { current: 0, target: 20 },
      vitaminE: { current: 0, target: 15 },
      vitaminK: { current: 0, target: 120 },
    },
    minerals: {
      calcium: { current: 0, target: 1000 },
      iron: { current: 0, target: 18 },
      magnesium: { current: 0, target: 400 },
      potassium: { current: 0, target: 3500 },
      sodium: { current: 0, target: 2300 },
      zinc: { current: 0, target: 11 },
      iodine: { current: 0, target: 150 },
    },
    limits: {
      sugar: { current: 0, target: 50 },
      salt: { current: 0, target: 5 },
      saturatedFat: { current: 0, target: 20 },
      transFat: { current: 0, target: 2 },
      caffeine: { current: 0, target: 400 },
      cholesterol: { current: 0, target: 300 },
    },
    hydration: { current: 0, target: 10 }
  });

  // Load data on mount and when date changes
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Refresh data when screen is focused (e.g., returning from index tab)
  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [loadProgressData])
  );

  // If still loading or no data, show loading or sample data
  if (isLoading || !dailyTargets) {
    return (
      <SafeAreaView style={progressTabStyles.container}>
        <Text style={progressTabStyles.headerTitle}>Loading Progress...</Text>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={progressTabStyles.container}>
      {/* Header */}
      <View style={progressTabStyles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={progressTabStyles.headerTitle}>Pantau Progres</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={{ padding: 5 }}>
              <Text style={{ fontSize: 18, color: '#10B981' }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 14, color: '#6B7280', marginHorizontal: 10 }}>
              {selectedDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={() => changeDate(1)} style={{ padding: 5 }}>
              <Text style={{ fontSize: 18, color: '#10B981' }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={loadProgressData} style={{ padding: 5, marginLeft: 10 }}>
              <RefreshCw size={18} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={progressTabStyles.periodSelector}>
          {[
            { key: 'day', label: 'Hari' },
            { key: 'week', label: 'Minggu' },
            { key: 'month', label: 'Bulan' }
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                progressTabStyles.periodButton,
                selectedPeriod === period.key && progressTabStyles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                progressTabStyles.periodButtonText,
                selectedPeriod === period.key && progressTabStyles.periodButtonTextActive
              ]}>
                {period.label}
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
            {Object.entries(dailyTargets.vitamins).map(([vitamin, data]: [string, any]) => {
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
            {Object.entries(dailyTargets.minerals).map(([mineral, data]: [string, any]) => {
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
            {Object.entries(dailyTargets.limits).map(([limit, data]: [string, any]) => {
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
