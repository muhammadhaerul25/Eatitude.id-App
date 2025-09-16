import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Scan,
  Utensils
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Import the enhanced meal planner hook for automatic daily meal generation
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import NutritionScanner from '../../components/nutrition/NutritionScanner';
import { useEnhancedMealPlanner } from '../../hooks/tabs/useEnhancedMealPlanner';
import { unifiedCache } from '../../services/unifiedCacheService';
import { indexTabStyles } from '../../styles/tabs/indexStyles';
// Import app initialization service
import { useRouter } from 'expo-router';
import { appInitService } from '../../services/appInitializationService';
import { demoDataService } from '../../services/demoDataService';

/**
 * Enhanced Meal Planner Index Screen
 * 
 * This component integrates the enhanced meal planner with automatic daily meal plan generation.
 * 
 * AUTOMATIC MEAL PLAN GENERATION:
 * - The useEnhancedMealPlanner hook automatically detects when a new day starts
 * - It generates fresh meal plans for today if none exists
 * - It preserves existing meal plans for past/future dates
 * - Generation is triggered by: new day detection, date change, manual refresh
 * 
 * WHEN MEAL PLANS ARE GENERATED:
 * 1. First time user opens the app (no last login date)
 * 2. User opens app on a new day (last login date != today)
 * 3. User navigates to a date with no existing meal plan
 * 4. User manually triggers generation via "Generate Meal Plan" button
 * 5. User forces new plan generation via "New Plan" button
 * 
 * The meal plan service handles all the logic for determining when to generate
 * new plans vs. loading cached plans, ensuring optimal performance and UX.
 */

interface MealItem {
  id: string;
  type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
  timeRange: string;
  rekomendasi_menu: string;
  targetKalori: number;
  status: 'not_planned' | 'upcoming' | 'completed' | 'skipped';
  isOptional?: boolean;
  details?: {
    deskripsi: string;
    pilihan_menu: string[];
    asupan_cairan: number;
  };
}

export default function IndexScreen() {
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showNutritionScanner, setShowNutritionScanner] = useState(false);
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number>(0);
  const [mealCache, setMealCache] = useState<{ [mealId: string]: any }>({});
  const [selectedFoodChoice, setSelectedFoodChoice] = useState<{ [mealId: string]: any }>({});
  const router = useRouter();

  // Initialize app on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 IndexScreen: Initializing app...');
        const result = await appInitService.initializeApp();

        if (result.success) {
          setIsAppInitialized(true);
          if (result.isDemoMode) {
            console.log('🎭 IndexScreen: Running in demo mode');
          }
          if (result.error) {
            console.warn('⚠️ IndexScreen: Initialized with warning:', result.error);
          }
        } else {
          setInitializationError(result.error || 'Failed to initialize app');
          setIsAppInitialized(true); // Allow partial functionality
        }
      } catch (error) {
        console.error('❌ IndexScreen: App initialization failed:', error);
        setInitializationError('Failed to initialize app');
        setIsAppInitialized(true); // Allow partial functionality
      }
    };

    initializeApp();
  }, []);

  const {
    meals,
    selectedDate,
    setSelectedDate,
    isGeneratingMealPlan,
    isLoadingMealPlan,
    lastError,
    generateMealPlan,
    refreshMealPlan,
    forceNewMealPlan,
    updateMealStatus,
    getTotalCalories,
    getCompletedCalories,
    getDailyCalorieTarget,
    clearError,
  } = useEnhancedMealPlanner();

  // Load daily calorie target when meals change
  useEffect(() => {
    const loadCalorieTarget = async () => {
      try {
        const target = await getDailyCalorieTarget();
        console.log('📊 Daily calorie target loaded:', target);
        setDailyCalorieTarget(target);
      } catch (error) {
        console.error('Failed to load daily calorie target:', error);
        const fallback = getTotalCalories();
        console.log('📊 Using fallback calorie target:', fallback);
        setDailyCalorieTarget(fallback); // Fallback to meal total
      }
    };

    if (meals.length > 0) {
      loadCalorieTarget();
    } else {
      // If no meals, set a reasonable default
      setDailyCalorieTarget(2000);
    }
  }, [meals, getDailyCalorieTarget, getTotalCalories]);

  // Load meal cache when selected date changes
  useEffect(() => {
    const loadAllMealCache = async () => {
      try {
        await unifiedCache.initializeCache();
        const dayCache = await unifiedCache.getDayCache(selectedDate);

        const newMealCache: { [mealId: string]: any } = {};
        const newSelectedChoices: { [mealId: string]: any } = {};

        for (const mealId in dayCache.meal_plan) {
          const cachedMeal = dayCache.meal_plan[mealId];
          newMealCache[mealId] = {
            actualCalories: cachedMeal.actual_calories || 0,
            scannedItems: cachedMeal.scanned_items || [],
            status: cachedMeal.status,
            notes: cachedMeal.logged_at ? `Logged at ${new Date(cachedMeal.logged_at).toLocaleTimeString()}` : ''
          };
        }

        setMealCache(newMealCache);
        setSelectedFoodChoice(newSelectedChoices);
      } catch (error) {
        console.error('Failed to load meal cache for date:', error);
      }
    };

    loadAllMealCache();
  }, [selectedDate]);

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'sarapan': return '🌅';
      case 'snack_pagi': return '☕';
      case 'makan_siang': return '🌞';
      case 'snack_sore': return '🍎';
      case 'makan_malam': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTitle = (type: string) => {
    switch (type) {
      case 'sarapan': return 'Sarapan';
      case 'snack_pagi': return 'Snack Pagi';
      case 'makan_siang': return 'Makan Siang';
      case 'snack_sore': return 'Snack Sore';
      case 'makan_malam': return 'Makan Malam';
      default: return 'Meal';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_planned': return 'Not Planned';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'skipped': return 'Skipped';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_planned': return '#6B7280';
      case 'upcoming': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'skipped': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const openMealModal = (meal: MealItem) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
    loadMealCache(meal.id);
  };

  // Cache functions for meal data
  const loadMealCache = async (mealId: string) => {
    try {
      await unifiedCache.initializeCache();
      const dayCache = await unifiedCache.getDayCache(selectedDate);

      if (dayCache.meal_plan[mealId]) {
        const cachedMeal = dayCache.meal_plan[mealId];
        setMealCache(prev => ({
          ...prev,
          [mealId]: {
            selectedFoodChoice: selectedFoodChoice[mealId] || null,
            actualCalories: cachedMeal.actual_calories || 0,
            scannedItems: cachedMeal.scanned_items || [],
            status: cachedMeal.status,
            notes: cachedMeal.logged_at ? `Logged at ${new Date(cachedMeal.logged_at).toLocaleTimeString()}` : ''
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load meal cache:', error);
    }
  };

  const saveMealChoice = async (mealId: string, foodChoice: any) => {
    try {
      await unifiedCache.initializeCache();
      setSelectedFoodChoice(prev => ({
        ...prev,
        [mealId]: foodChoice
      }));

      // Update cache with selected food choice
      setMealCache(prev => ({
        ...prev,
        [mealId]: {
          ...prev[mealId],
          selectedFoodChoice: foodChoice
        }
      }));

      console.log(`💾 Saved food choice for meal ${mealId}:`, foodChoice);
    } catch (error) {
      console.error('Failed to save meal choice:', error);
    }
  };

  const updateMealStatusWithCache = async (mealId: string, status: MealItem['status']) => {
    try {
      // Update the meal status in the hook
      await updateMealStatus(mealId, status);

      // Update unified cache
      await unifiedCache.initializeCache();
      const dayCache = await unifiedCache.getDayCache(selectedDate);

      if (dayCache.meal_plan[mealId]) {
        dayCache.meal_plan[mealId].status = status === 'completed' ? 'eaten' : status === 'skipped' ? 'skipped' : 'planned';
        dayCache.meal_plan[mealId].logged_at = new Date().toISOString();

        // If completed and we have a selected food choice, log calories
        if (status === 'completed' && selectedFoodChoice[mealId]) {
          dayCache.meal_plan[mealId].actual_calories = selectedFoodChoice[mealId].calories;
        }

        await unifiedCache.updateMealPlan(selectedDate, dayCache.meal_plan);
      }

      console.log(`✅ Updated meal status: ${mealId} -> ${status}`);
    } catch (error) {
      console.error('Failed to update meal status with cache:', error);
    }
  };

  const handleGenerateNewPlan = () => {
    Alert.alert(
      'Generate New Meal Plan',
      'Are you sure you want to generate a new meal plan? This will replace the current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: forceNewMealPlan, style: 'default' }
      ]
    );
  };

  const handleSetupDemoData = async () => {
    Alert.alert(
      'Setup Demo Data',
      'This will set up demo user profile and nutrition plan for testing purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Setup',
          onPress: async () => {
            try {
              await demoDataService.setupDemoData();

              // Reinitialize the app
              const result = await appInitService.initializeApp();
              if (result.success) {
                clearError();
                refreshMealPlan();
              }
            } catch (error) {
              console.error('Failed to setup demo data:', error);
              Alert.alert('Error', 'Failed to setup demo data. Please try again.');
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleDebug = async () => {
    try {
      await demoDataService.debugCacheState();
      const status = await demoDataService.getDemoStatus();

      Alert.alert(
        'Debug Info',
        `Demo Mode: ${status.isDemoMode}\nUser Data: ${status.hasUserData}\nPersonal Plan: ${status.hasPersonalPlan}\nMeal Plan: ${status.hasMealPlan}\n\nCheck console for detailed cache state.`,
        [
          { text: 'OK' },
          { text: 'Setup Demo', onPress: handleSetupDemoData }
        ]
      );
    } catch (err) {
      console.error('Failed to get debug info. Check console:', err);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const totalCalories = getTotalCalories();
  const completedCalories = getCompletedCalories();

  // Show loading screen during app initialization
  if (!isAppInitialized) {
    return (
      <SafeAreaView style={indexTabStyles.container}>
        <View style={indexTabStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={indexTabStyles.loadingText}>
            {initializationError ? 'Initialization Error' : 'Initializing Eatitude...'}
          </Text>
          {initializationError && (
            <Text style={indexTabStyles.errorText}>
              {initializationError}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={indexTabStyles.container}>
      {/* Header */}
      <View style={indexTabStyles.header}>
        <TouchableOpacity onLongPress={handleDebug} delayLongPress={2000}>
          <Text style={indexTabStyles.headerTitle}>Jadwal Makan</Text>
        </TouchableOpacity>
        <View style={indexTabStyles.timeContainer}>
          <Clock size={16} color="#6B7280" />
          <Text style={indexTabStyles.currentTime}>{currentTime}</Text>
        </View>
      </View>

      {/* Date Navigation */}
      <View style={indexTabStyles.dateNavigation}>
        <TouchableOpacity
          style={indexTabStyles.dateButton}
          onPress={() => navigateDate(-1)}
        >
          <ChevronLeft size={20} color="#6B7280" />
        </TouchableOpacity>

        <Text style={indexTabStyles.selectedDate}>{formatDate(selectedDate)}</Text>

        <TouchableOpacity
          style={indexTabStyles.dateButton}
          onPress={() => navigateDate(1)}
        >
          <ChevronRight size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {lastError && (
        <View style={indexTabStyles.errorContainer}>
          <Text style={indexTabStyles.errorText}>⚠️ {lastError}</Text>
          <TouchableOpacity onPress={clearError} style={indexTabStyles.errorCloseButton}>
            <Text style={indexTabStyles.errorCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reminders */}
      <View style={indexTabStyles.reminderContainer}>
        <Bell size={16} color="#F59E0B" />
        <Text style={indexTabStyles.reminderText}>
          {isToday
            ? `Target Kalori: ${completedCalories || 0}/${dailyCalorieTarget > 0 ? dailyCalorieTarget : totalCalories || 2000} kcal • Jangan lupa minum air!`
            : 'Lihat rencana makan Anda untuk tanggal ini • Jangan lupa minum air!'
          }
        </Text>
      </View>

      <ScrollView style={indexTabStyles.content} showsVerticalScrollIndicator={false}>
        {/* Section Header with Dynamic Title */}
        <View style={indexTabStyles.sectionHeader}>
          <Text style={indexTabStyles.sectionTitle}>
            {isToday ? "Menu Hari Ini" : `Menu ${formatDate(selectedDate)}`}
          </Text>
        </View>

        {/* Empty State for No Meal Plan */}
        {meals.length === 0 && !isLoadingMealPlan && !isGeneratingMealPlan && (
          <View style={indexTabStyles.emptyState}>
            <Text style={indexTabStyles.emptyStateTitle}>No Meal Plan Available</Text>
            <Text style={indexTabStyles.emptyStateText}>
              {lastError && lastError.includes('onboarding')
                ? "Please complete your profile setup to get personalized meal plans."
                : isToday
                  ? "Let's create your personalized meal plan for today!"
                  : "No meal plan found for this date."
              }
            </Text>

            {lastError && (lastError.includes('user data') || lastError.includes('onboarding') || lastError.includes('profile setup')) && (
              <>
                <TouchableOpacity
                  style={[indexTabStyles.generateButton, { backgroundColor: '#3B82F6', marginBottom: 10 }]}
                  onPress={() => {
                    router.push('/onboarding');
                  }}
                >
                  <Text style={indexTabStyles.generateButtonText}>Complete Profile Setup</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[indexTabStyles.generateButton, { backgroundColor: '#10B981', marginBottom: 10 }]}
                  onPress={handleSetupDemoData}
                >
                  <Text style={indexTabStyles.generateButtonText}>Use Demo Data (Testing)</Text>
                </TouchableOpacity>
              </>
            )}

            {!lastError || (!lastError.includes('onboarding') && !lastError.includes('profile setup')) ? (
              <TouchableOpacity
                style={indexTabStyles.generateButton}
                onPress={generateMealPlan}
              >
                <Text style={indexTabStyles.generateButtonText}>Generate Meal Plan</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {meals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={[
              indexTabStyles.mealCard,
              meal.status === 'completed' && indexTabStyles.mealCardCompleted,
              meal.isOptional && indexTabStyles.mealCardOptional
            ]}
            onPress={() => openMealModal(meal)}
          >
            <View style={indexTabStyles.mealHeader}>
              <View style={indexTabStyles.mealInfo}>
                <Text style={indexTabStyles.mealIcon}>{getMealIcon(meal.type)}</Text>
                <View style={indexTabStyles.mealTextContainer}>
                  <View style={indexTabStyles.mealTitleRow}>
                    <Text style={indexTabStyles.mealType}>
                      {getMealTitle(meal.type)}
                    </Text>
                    {meal.isOptional && (
                      <Text style={indexTabStyles.optionalBadge}>Opsional</Text>
                    )}
                  </View>
                  <Text style={indexTabStyles.mealTime}>{meal.timeRange}</Text>
                </View>
              </View>

              <View style={indexTabStyles.mealDetails}>
                <Text style={[
                  indexTabStyles.mealFood,
                  meal.status === 'completed' && indexTabStyles.completedText
                ]}>
                  {"Dapatkan rekomendasi"}
                </Text>
                <Text style={indexTabStyles.mealCalories}>
                  Target: {meal.targetKalori} kcal
                </Text>
                <View style={indexTabStyles.statusContainer}>
                  <View style={[
                    indexTabStyles.statusIndicator,
                    { backgroundColor: getStatusColor(meal.status) }
                  ]} />
                  <Text style={[
                    indexTabStyles.statusText,
                    { color: getStatusColor(meal.status) }
                  ]}>
                    {getStatusText(meal.status)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={[indexTabStyles.quickActions, { flexDirection: 'column' }]}>
          {/* First row: Add Meal and Scan Food */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity style={[indexTabStyles.actionButton, { backgroundColor: '#10B981' }]}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={indexTabStyles.actionButtonText}>Tambah Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[indexTabStyles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => setShowNutritionScanner(true)}
            >
              <Scan size={20} color="#FFFFFF" />
              <Text style={indexTabStyles.actionButtonText}>Scan Makanan</Text>
            </TouchableOpacity>
          </View>

          {/* Second row: Refresh and New Plan */}
          {/* <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[indexTabStyles.actionButton, { backgroundColor: '#6B7280' }]}
              onPress={refreshMealPlan}
              disabled={isLoadingMealPlan || isGeneratingMealPlan}
            >
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={indexTabStyles.actionButtonText}>Refresh</Text>
            </TouchableOpacity>

            {isToday ? (
              <TouchableOpacity
                style={[indexTabStyles.actionButton, { backgroundColor: '#16A34A' }]}
                onPress={handleGenerateNewPlan}
                disabled={isLoadingMealPlan || isGeneratingMealPlan}
              >
                <Utensils size={16} color="#FFFFFF" />
                <Text style={indexTabStyles.actionButtonText}>New Plan</Text>
              </TouchableOpacity>
            ) : (
              // Empty placeholder to maintain grid layout
              <View style={[indexTabStyles.actionButton, { backgroundColor: '#E5E7EB', opacity: 0.5 }]}>
                <Text style={[indexTabStyles.actionButtonText, { color: '#9CA3AF' }]}>Available Today</Text>
              </View>
            )}
          </View> */}
        </View>
      </ScrollView>

      {/* Meal Detail Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMealModal(false)}
      >
        <SafeAreaView style={indexTabStyles.modalContainer}>
          <View style={indexTabStyles.modalHeader}>
            <Text style={indexTabStyles.modalTitle}>
              {getMealTitle(selectedMeal?.type || '')}
            </Text>
            <TouchableOpacity onPress={() => setShowMealModal(false)}>
              <Text style={indexTabStyles.closeButton}>Tutup</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={indexTabStyles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Meal Info Card */}
            <View style={indexTabStyles.mealInfoCard}>
              <Text style={indexTabStyles.mealDetailTitle}>Jenis Makanan</Text>
              <Text style={indexTabStyles.mealDetailValue}>{getMealTitle(selectedMeal?.type || '')}</Text>

              <Text style={indexTabStyles.mealDetailTitle}>Waktu</Text>
              <Text style={indexTabStyles.mealDetailValue}>{selectedMeal?.timeRange}</Text>

              <Text style={indexTabStyles.mealDetailTitle}>Target Kalori</Text>
              <Text style={indexTabStyles.mealDetailCalories}>{selectedMeal?.targetKalori} kcal</Text>
            </View>

            {/* Rekomendasi Makanan */}
            <View style={indexTabStyles.recommendationCard}>
              <Text style={indexTabStyles.sectionTitle}>Rekomendasi Makanan</Text>
              <Text style={indexTabStyles.recommendationDescription}>
                {selectedMeal?.details?.deskripsi || 'Pilih makanan bergizi seimbang sesuai dengan kebutuhan kalori dan gizi harian Anda.'}
              </Text>
            </View>

            {/* Pilihan Makanan */}
            <View style={indexTabStyles.foodChoicesCard}>
              <Text style={indexTabStyles.sectionTitle}>Pilihan Makanan</Text>
              <View style={indexTabStyles.foodChoicesList}>
                {(selectedMeal?.details?.pilihan_menu && selectedMeal.details.pilihan_menu.length > 0) ? (
                  selectedMeal.details.pilihan_menu.map((menuItem: string, index: number) => {
                    const foodChoice = { name: menuItem, calories: Math.round(selectedMeal?.targetKalori / (selectedMeal?.details?.pilihan_menu?.length || 1) || 0) };
                    const isSelected = selectedFoodChoice[selectedMeal?.id]?.name === foodChoice.name;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          indexTabStyles.foodChoiceItem,
                          isSelected && { backgroundColor: '#E0F2FE', borderColor: '#0284C7', borderWidth: 2 }
                        ]}
                        onPress={() => saveMealChoice(selectedMeal?.id, foodChoice)}
                      >
                        <Text style={[
                          indexTabStyles.foodChoiceText,
                          isSelected && { color: '#0284C7', fontWeight: '600' }
                        ]}>
                          {foodChoice.name} {isSelected && '✓'}
                        </Text>
                        <Text style={[
                          indexTabStyles.foodChoiceCalories,
                          isSelected && { color: '#0284C7', fontWeight: '600' }
                        ]}>
                          {foodChoice.calories} kcal
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={indexTabStyles.foodChoiceItem}>
                    <Text style={indexTabStyles.foodChoiceText}>
                      {selectedMeal?.rekomendasi_menu || 'No food options available'}
                    </Text>
                    <Text style={indexTabStyles.foodChoiceCalories}>
                      {selectedMeal?.targetKalori || 0} kcal
                    </Text>
                  </View>
                )}
              </View>

              {/* Show selected choice summary */}
              {selectedFoodChoice[selectedMeal?.id] && (
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: '#F0F9FF',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#0284C7'
                }}>
                  <Text style={{ fontSize: 14, color: '#0369A1', fontWeight: '600' }}>
                    Selected: {selectedFoodChoice[selectedMeal?.id].name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#0369A1', marginTop: 2 }}>
                    {selectedFoodChoice[selectedMeal?.id].calories} calories
                  </Text>
                </View>
              )}

              {/* Show cached meal info if available */}
              {mealCache[selectedMeal?.id]?.notes && (
                <View style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 6
                }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {mealCache[selectedMeal?.id].notes}
                  </Text>
                </View>
              )}
            </View>

            {/* Asupan Cairan */}
            <View style={indexTabStyles.fluidIntakeCard}>
              <Text style={indexTabStyles.sectionTitle}>Asupan Cairan</Text>
              <View style={indexTabStyles.fluidIntakeRow}>
                <Text style={indexTabStyles.fluidIntakeIcon}>💧</Text>
                <Text style={indexTabStyles.fluidIntakeText}>
                  {selectedMeal?.details?.asupan_cairan || 1} gelas air
                </Text>
                <Text style={indexTabStyles.fluidIntakeSubtext}>
                  ({(selectedMeal?.details?.asupan_cairan || 1) * 200}ml)
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={indexTabStyles.actionButtonsContainer}>
              <TouchableOpacity style={indexTabStyles.modalScanButton} onPress={() => setShowNutritionScanner(true)}>
                <Scan size={20} color="#FFFFFF" />
                <Text style={indexTabStyles.modalScanButtonText}>Scan Makanan</Text>
              </TouchableOpacity>
              {/* TODO ganti icon plus jadi gear/edit/pencil */}
              <TouchableOpacity style={indexTabStyles.adjustButton}>
                <Edit size={20} color="#3B82F6" />
                <Text style={indexTabStyles.adjustButtonText}>Atur Makanan</Text>
              </TouchableOpacity>
            </View>

            {/* Show scanned items if any */}
            {mealCache[selectedMeal?.id]?.scannedItems && mealCache[selectedMeal?.id].scannedItems.length > 0 && (
              <View style={indexTabStyles.foodChoicesCard}>
                <Text style={indexTabStyles.sectionTitle}>Scanned Items</Text>
                {mealCache[selectedMeal?.id].scannedItems.map((item: any, index: number) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#F0FDF4',
                    borderRadius: 8,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: '#22C55E'
                  }}>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#15803D' }}>
                        📷 {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#16A34A' }}>
                        {item.weight_grams}g
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#15803D' }}>
                      {item.calories} kcal
                    </Text>
                  </View>
                ))}
                <View style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: '#F0FDF4',
                  borderRadius: 8
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#15803D' }}>
                    Total Scanned: {mealCache[selectedMeal?.id].actualCalories} calories
                  </Text>
                </View>
              </View>
            )}

            {/* Status Action Buttons */}
            <View style={indexTabStyles.statusButtonsContainer}>
              <TouchableOpacity
                style={[
                  indexTabStyles.completedButton,
                  selectedMeal?.status === 'completed' && { backgroundColor: '#059669' }
                ]}
                onPress={() => {
                  if (selectedMeal) {
                    updateMealStatusWithCache(selectedMeal.id, 'completed');
                    setShowMealModal(false);
                  }
                }}
              >
                <Text style={indexTabStyles.completedButtonText}>
                  {selectedMeal?.status === 'completed' ? 'Completed ✓' : 'Selesai'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  indexTabStyles.skippedButton,
                  selectedMeal?.status === 'skipped' && { backgroundColor: '#DC2626' }
                ]}
                onPress={() => {
                  if (selectedMeal) {
                    updateMealStatusWithCache(selectedMeal.id, 'skipped');
                    setShowMealModal(false);
                  }
                }}
              >
                <Text style={indexTabStyles.skippedButtonText}>
                  {selectedMeal?.status === 'skipped' ? 'Skipped ✗' : 'Batalkan'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={indexTabStyles.modalBottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Nutrition Scanner Modal */}
      <NutritionScanner
        visible={showNutritionScanner}
        onClose={() => setShowNutritionScanner(false)}
        onSaveFood={() => {
          // For now, just handle the save - would need to modify NutritionScanner to pass scanned data
          console.log('Food saved from nutrition scanner');
        }}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoadingMealPlan || isGeneratingMealPlan}
        title={isGeneratingMealPlan ? 'Generate jadwal makan...' : 'Loading...'}
        subtitle={(isGeneratingMealPlan || (isLoadingMealPlan && lastError?.includes('taking longer')))
          ? 'NutriAdvisor AI sedang menyiapkan rekomendasi makanan. Mohon tunggu sebentar...'
          : undefined
        }
      />
    </SafeAreaView>
  );
}
