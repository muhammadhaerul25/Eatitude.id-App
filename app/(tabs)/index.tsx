import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Plus,
  Scan,
  ShoppingCart
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
import { AddMealModal } from '../../components/nutrition';
import NutritionScanner from '../../components/nutrition/NutritionScanner';
import { OrderPage } from '../../components/order';
import { demoDataService } from '../../services/demoDataService';
import { IndividualMealItem, individualMealPlanService } from '../../services/individualMealPlanAPI';
import { unifiedCache } from '../../services/unifiedCacheService';
import { indexTabStyles } from '../../styles/tabs/indexStyles';

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
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showOrderPage, setShowOrderPage] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [personalPlan, setPersonalPlan] = useState<any>(null);
  const [mealCache, setMealCache] = useState<{ [mealId: string]: any }>({});
  const [selectedFoodChoice, setSelectedFoodChoice] = useState<{ [mealId: string]: any }>({});
  const [individualMeals, setIndividualMeals] = useState<IndividualMealItem[]>([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize app on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 IndexScreen: Initializing app...');

        // Initialize the unified cache
        await unifiedCache.initializeCache();

        setIsAppInitialized(true);
        console.log('✅ IndexScreen: App initialized successfully');
      } catch (error) {
        console.error('❌ IndexScreen: App initialization failed:', error);
        setInitializationError('Failed to initialize app');
        setIsAppInitialized(true); // Allow partial functionality
      }
    };

    initializeApp();
  }, []);

  // Load personal plan for calorie target
  useEffect(() => {
    const loadPersonalPlan = async () => {
      try {
        await unifiedCache.initializeCache();
        const cache = await unifiedCache.getCache();
        if (cache.personal_plan) {
          setPersonalPlan(cache.personal_plan);
          // Get daily calorie target from personal plan
          const dailyTarget = cache.personal_plan.kebutuhan_kalori?.["total_kalori_per_hari_(kcal)"] || 2000;
          console.log('📊 Daily calorie target from personal plan:', dailyTarget);
        }
      } catch (error) {
        console.error('Failed to load personal plan:', error);
      }
    };

    loadPersonalPlan();
  }, []);

  // Load individual meals when selected date changes
  useEffect(() => {
    const loadIndividualMeals = async () => {
      try {
        const meals = await individualMealPlanService.getIndividualMealsForDate(selectedDate);
        setIndividualMeals(meals);
      } catch (error) {
        console.error('Failed to load individual meals:', error);
      }
    };

    loadIndividualMeals();
  }, [selectedDate]);

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

  // Helper function to get individual meal data
  const getIndividualMealData = (mealId: string) => {
    return individualMeals.find(meal => meal.id === mealId);
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
      // Update unified cache
      await unifiedCache.initializeCache();
      const dayCache = await unifiedCache.getDayCache(selectedDate);

      if (dayCache.meal_plan[mealId]) {
        if (status === 'completed' && selectedFoodChoice[mealId]) {
          // Use logMeal to properly update progress data
          const selectedFood = selectedFoodChoice[mealId];
          const actualCalories = selectedFood.calories || 0;

          // Create basic nutrition data from selected food
          const actualNutrition = {
            protein: Math.round(actualCalories * 0.15 / 4), // Estimate 15% protein
            carbs: Math.round(actualCalories * 0.55 / 4),   // Estimate 55% carbs
            fat: Math.round(actualCalories * 0.30 / 9),     // Estimate 30% fat
            fiber: Math.round(actualCalories * 0.01)        // Estimate 1% fiber
          };

          await unifiedCache.logMeal(selectedDate, mealId, actualCalories, actualNutrition);
          console.log(`✅ Logged meal with ${actualCalories} calories and nutrition data`);
        } else {
          // For skipped or other status, just update the meal plan
          dayCache.meal_plan[mealId].status = status === 'completed' ? 'eaten' : status === 'skipped' ? 'skipped' : 'planned';
          dayCache.meal_plan[mealId].logged_at = new Date().toISOString();
          await unifiedCache.updateMealPlan(selectedDate, dayCache.meal_plan);
        }
      }

      // Also update individual meal status
      await individualMealPlanService.updateMealStatus(mealId, status === 'completed' ? 'completed' : status === 'skipped' ? 'skipped' : 'planned', selectedDate);

      // Reload individual meals to refresh the UI
      const updatedMeals = await individualMealPlanService.getIndividualMealsForDate(selectedDate);
      setIndividualMeals(updatedMeals);

      // Also reload meal cache to reflect the changes
      const newMealCache: { [mealId: string]: any } = {};
      const updatedDayCache = await unifiedCache.getDayCache(selectedDate);

      for (const mId in updatedDayCache.meal_plan) {
        const cachedMeal = updatedDayCache.meal_plan[mId];
        newMealCache[mId] = {
          actualCalories: cachedMeal.actual_calories || 0,
          scannedItems: cachedMeal.scanned_items || [],
          status: cachedMeal.status,
          notes: cachedMeal.logged_at ? `Logged at ${new Date(cachedMeal.logged_at).toLocaleTimeString()}` : ''
        };
      }

      setMealCache(newMealCache);

      console.log(`✅ Updated meal status: ${mealId} -> ${status}`);
    } catch (error) {
      console.error('Failed to update meal status with cache:', error);
    }
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

              // Reinitialize the cache
              await unifiedCache.initializeCache();

              // Demo data setup complete - meals will be loaded automatically
              console.log('✅ Demo data setup complete');
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

  const handleAddMeal = async (mealData: any) => {
    setIsAddingMeal(true);
    try {
      console.log('Adding new meal:', mealData);

      // Generate individual meal plan
      const mealPlan = await individualMealPlanService.generateIndividualMealPlan(mealData);

      // Convert to meal item
      const mealItem = individualMealPlanService.convertToMealItem(mealPlan, selectedDate);

      // Save to cache
      await individualMealPlanService.saveIndividualMeal(mealItem, selectedDate);

      // Reload meals
      const updatedMeals = await individualMealPlanService.getIndividualMealsForDate(selectedDate);
      setIndividualMeals(updatedMeals);

      console.log('✅ Meal added successfully:', mealItem);

    } catch (error) {
      console.error('Failed to add meal:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleOrderFood = (foodItem: any) => {
    setSelectedOrderItem(foodItem);
    setShowOrderPage(true);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Calculate calories - prioritize personal plan, fallback to individual meals
  const totalCalories = personalPlan?.kebutuhan_kalori?.["total_kalori_per_hari_(kcal)"] ||
    individualMeals.reduce((total, meal) => total + (meal.targetCalories || 0), 0) || 2000;
  const completedCalories = individualMeals
    .filter(meal => meal.status === 'completed')
    .reduce((total, meal) => total + (meal.selectedOption?.calories || meal.targetCalories || 0), 0);

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

      {/* Reminders */}
      <View style={indexTabStyles.reminderContainer}>
        <Bell size={16} color="#F59E0B" />
        <Text style={indexTabStyles.reminderText}>
          {isToday
            ? `Target Kalori: ${completedCalories || 0}/${totalCalories} kcal • Jangan lupa minum air!`
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

        {/* Empty State for No Meal Plan - Only show when no individual meals */}
        {individualMeals.length === 0 && (
          <View style={indexTabStyles.emptyState}>
            <Text style={indexTabStyles.emptyStateTitle}>Belum Ada Jadwal Makan</Text>
            <Text style={indexTabStyles.emptyStateText}>
              Tambahkan menu makanan sesuai dengan preferensi dan budget Anda.
              Dapatkan rekomendasi makanan yang sehat dan sesuai kebutuhan kalori harian.
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
              padding: 12,
              backgroundColor: '#F0F9FF',
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#0284C7'
            }}>
              <Text style={{
                fontSize: 14,
                color: '#0369A1',
                textAlign: 'center',
                lineHeight: 20
              }}>
                💡 Gunakan tombol &quot;Tambah Menu&quot; untuk menambahkan sarapan, makan siang, makan malam, atau snack
              </Text>
            </View>
          </View>
        )}

        {/* Show added individual meals */}
        {individualMeals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={[
              indexTabStyles.mealCard,
              meal.status === 'completed' && indexTabStyles.mealCardCompleted
            ]}
            onPress={() => {
              // Convert individual meal to compatible format for modal
              const compatibleMeal = {
                id: meal.id,
                type: meal.type,
                timeRange: meal.timeRange,
                rekomendasi_menu: meal.description || "Menu sesuai preferensi",
                targetKalori: meal.targetCalories,
                status: meal.status === 'completed' ? 'completed' as const :
                  meal.status === 'skipped' ? 'skipped' as const : 'upcoming' as const,
                details: {
                  deskripsi: meal.description,
                  pilihan_menu: meal.menuOptions.map(option => option.name),
                  asupan_cairan: meal.waterIntake
                }
              };
              openMealModal(compatibleMeal);
            }}
          >
            <View style={indexTabStyles.mealHeader}>
              <View style={indexTabStyles.mealInfo}>
                <Text style={indexTabStyles.mealIcon}>{getMealIcon(meal.type)}</Text>
                <View style={indexTabStyles.mealTextContainer}>
                  <View style={indexTabStyles.mealTitleRow}>
                    <Text style={indexTabStyles.mealType}>
                      {getMealTitle(meal.type)}
                    </Text>
                  </View>
                  <Text style={indexTabStyles.mealTime}>{meal.timeRange}</Text>
                </View>
              </View>

              <View style={indexTabStyles.mealDetails}>
                <Text style={[
                  indexTabStyles.mealFood,
                  meal.status === 'completed' && indexTabStyles.completedText
                ]}>
                  {meal.description || "Menu berdasarkan preferensi Anda"}
                </Text>
                <Text style={indexTabStyles.mealCalories}>
                  Target: {meal.targetCalories} kcal
                </Text>
                {meal.menuOptions.length > 0 && (
                  <Text style={{
                    fontSize: 12,
                    color: '#10B981',
                    marginTop: 2
                  }}>
                    {meal.menuOptions.length} pilihan menu • Mulai dari Rp {Math.min(...meal.menuOptions.map(m => m.price)).toLocaleString()}
                  </Text>
                )}
                <View style={indexTabStyles.statusContainer}>
                  <View style={[
                    indexTabStyles.statusIndicator,
                    { backgroundColor: getStatusColor(meal.status === 'completed' ? 'completed' : meal.status === 'skipped' ? 'skipped' : 'upcoming') }
                  ]} />
                  <Text style={[
                    indexTabStyles.statusText,
                    { color: getStatusColor(meal.status === 'completed' ? 'completed' : meal.status === 'skipped' ? 'skipped' : 'upcoming') }
                  ]}>
                    {getStatusText(meal.status === 'completed' ? 'completed' : meal.status === 'skipped' ? 'skipped' : 'upcoming')}
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
            <TouchableOpacity
              style={[indexTabStyles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => setShowAddMealModal(true)}
              disabled={isAddingMeal}
            >
              {isAddingMeal ? (
                <ActivityIndicator size={20} color="#FFFFFF" />
              ) : (
                <Plus size={20} color="#FFFFFF" />
              )}
              <Text style={indexTabStyles.actionButtonText}>
                {isAddingMeal ? 'Menambah...' : 'Tambah Menu'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[indexTabStyles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => setShowNutritionScanner(true)}
            >
              <Scan size={20} color="#FFFFFF" />
              <Text style={indexTabStyles.actionButtonText}>Scan Makanan</Text>
            </TouchableOpacity>
          </View>
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
                {(() => {
                  const individualMealData = getIndividualMealData(selectedMeal?.id);

                  // Show individual meal options with price
                  return individualMealData?.menuOptions.map((option, index) => {
                    const isSelected = selectedFoodChoice[selectedMeal?.id]?.name === option.name;
                    return (
                      <View
                        key={index}
                        style={[
                          indexTabStyles.foodChoiceItem,
                          isSelected && { backgroundColor: '#E0F2FE', borderColor: '#0284C7', borderWidth: 2 }
                        ]}
                      >
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={async () => {
                            const foodChoice = {
                              name: option.name,
                              calories: option.calories,
                              price: option.price,
                              description: option.description
                            };
                            await saveMealChoice(selectedMeal?.id, foodChoice);
                            // Also save to individual meal service
                            await individualMealPlanService.selectMenuOption(selectedMeal?.id, foodChoice, selectedDate);
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[
                              indexTabStyles.foodChoiceText,
                              isSelected && { color: '#0284C7', fontWeight: '600' }
                            ]}>
                              {option.name} {isSelected && '✓'}
                            </Text>
                            <Text style={{
                              fontSize: 12,
                              color: '#6B7280',
                              marginTop: 2,
                              lineHeight: 16
                            }}>
                              {option.description}
                            </Text>
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: 4
                            }}>
                              <Text style={[
                                indexTabStyles.foodChoiceCalories,
                                isSelected && { color: '#0284C7', fontWeight: '600' }
                              ]}>
                                {option.calories} kcal
                              </Text>

                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                                <Text style={{
                                  fontSize: 14,
                                  fontWeight: '600',
                                  color: isSelected ? '#0284C7' : '#059669'
                                }}>
                                  Rp {option.price.toLocaleString()}
                                </Text>

                                {/* Order Button */}
                                <TouchableOpacity
                                  style={{
                                    marginLeft: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: '#059669',
                                    borderRadius: 6,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 70
                                  }}
                                  onPress={() => handleOrderFood(option)}
                                >
                                  <ShoppingCart size={14} color="#FFFFFF" />
                                  <Text style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    marginLeft: 4
                                  }}>
                                    Order
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>


                      </View>
                    );
                  });

                })()}
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
                    {selectedFoodChoice[selectedMeal?.id].price &&
                      ` • Rp ${selectedFoodChoice[selectedMeal?.id].price.toLocaleString()}`
                    }
                  </Text>
                  {selectedFoodChoice[selectedMeal?.id].description && (
                    <Text style={{ fontSize: 12, color: '#0369A1', marginTop: 2, fontStyle: 'italic' }}>
                      {selectedFoodChoice[selectedMeal?.id].description}
                    </Text>
                  )}
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

      {/* Add Meal Modal */}
      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddMeal}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isAddingMeal}
        title={isAddingMeal ? 'Menambah menu...' : 'Loading...'}
        subtitle={isAddingMeal
          ? 'AI sedang membuat rekomendasi menu berdasarkan preferensi Anda...'
          : undefined
        }
      />

      {/* Order Page Modal */}
      <OrderPage
        visible={showOrderPage}
        onClose={() => setShowOrderPage(false)}
        foodItem={selectedOrderItem}
      />
    </SafeAreaView>
  );
}
