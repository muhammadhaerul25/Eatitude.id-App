import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Scan
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useMealPlanner } from '../../hooks/tabs/useMealPlanner';
import { indexTabStyles } from '../../styles/tabs/indexStyles';
import NutritionScanner from '../components/NutritionScanner';

interface MealItem {
  id: string;
  type: 'sarapan' | 'snack_pagi' | 'makan_siang' | 'snack_sore' | 'makan_malam';
  timeRange: string;
  rekomendasi_menu: string;
  targetKalori: number;
  status: 'not_planned' | 'upcoming' | 'completed' | 'skipped';
  isOptional?: boolean;
}

export default function IndexScreen() {
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showNutritionScanner, setShowNutritionScanner] = useState(false);

  const {
    meals,
    selectedDate,
    setSelectedDate,
    isGeneratingMealPlan,
    generateMealPlan,
    updateMealStatus,
    getTotalCalories,
    getCompletedCalories,
  } = useMealPlanner();

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

  const getMealRecommendation = (type: string) => {
    switch (type) {
      case 'sarapan':
        return 'Mulai hari dengan makanan bergizi tinggi yang mengandung karbohidrat kompleks, protein, dan serat untuk memberikan energi tahan lama.';
      case 'snack_pagi':
        return 'Cemilan sehat yang mengandung vitamin dan mineral untuk menjaga metabolisme tubuh tetap aktif.';
      case 'makan_siang':
        return 'Makanan utama yang seimbang dengan porsi protein yang cukup, sayuran, dan karbohidrat untuk memenuhi kebutuhan energi siang hari.';
      case 'snack_sore':
        return 'Cemilan ringan yang mengandung protein atau serat untuk menjaga rasa kenyang hingga makan malam.';
      case 'makan_malam':
        return 'Makanan yang mudah dicerna dengan protein berkualitas dan sayuran, hindari karbohidrat berlebih menjelang tidur.';
      default:
        return 'Pilih makanan bergizi seimbang sesuai dengan kebutuhan kalori dan gizi harian Anda.';
    }
  };

  const getFoodChoices = (type: string) => {
    switch (type) {
      case 'sarapan':
        return [
          { name: 'Oatmeal dengan Buah', calories: 350 },
          { name: 'Nasi Uduk', calories: 400 },
          { name: 'Roti Gandum + Telur', calories: 320 },
          { name: 'Bubur Ayam', calories: 380 },
        ];
      case 'snack_pagi':
        return [
          { name: 'Pisang', calories: 100 },
          { name: 'Yogurt', calories: 120 },
          { name: 'Kacang Almond', calories: 160 },
        ];
      case 'makan_siang':
        return [
          { name: 'Nasi + Ayam + Sayur', calories: 550 },
          { name: 'Gado-gado', calories: 450 },
          { name: 'Soto Ayam', calories: 400 },
          { name: 'Nasi Padang', calories: 650 },
        ];
      case 'snack_sore':
        return [
          { name: 'Buah Potong', calories: 80 },
          { name: 'Keripik Singkong', calories: 140 },
          { name: 'Teh + Biskuit', calories: 120 },
        ];
      case 'makan_malam':
        return [
          { name: 'Ikan Bakar + Nasi', calories: 480 },
          { name: 'Sup Sayuran', calories: 200 },
          { name: 'Pecel Lele', calories: 520 },
          { name: 'Capcay', calories: 300 },
        ];
      default:
        return [];
    }
  };

  const openMealModal = (meal: MealItem) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };



  return (
    <SafeAreaView style={indexTabStyles.container}>
      {/* Header */}
      <View style={indexTabStyles.header}>
        <Text style={indexTabStyles.headerTitle}>Meal Planner</Text>
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
          Next: Lunch in 2 hours • Don't forget to drink water!
        </Text>
      </View>

      <ScrollView style={indexTabStyles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Hari Ini */}
        <View style={indexTabStyles.sectionHeader}>
          <Text style={indexTabStyles.sectionTitle}>Menu Hari Ini</Text>
        </View>

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
                  {meal.rekomendasi_menu}
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
        <View style={indexTabStyles.quickActions}>
          <TouchableOpacity style={indexTabStyles.actionButton}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={indexTabStyles.actionButtonText}>Add Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[indexTabStyles.actionButton, indexTabStyles.scanButton]} onPress={() => setShowNutritionScanner(true)}>
            <Scan size={20} color="#FFFFFF" />
            <Text style={indexTabStyles.actionButtonText}>Scan Food</Text>
          </TouchableOpacity>
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
              {getMealTitle(selectedMeal?.type || '')} Detail
            </Text>
            <TouchableOpacity onPress={() => setShowMealModal(false)}>
              <Text style={indexTabStyles.closeButton}>Done</Text>
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
                {getMealRecommendation(selectedMeal?.type || '')}
              </Text>
            </View>

            {/* Pilihan Makanan */}
            <View style={indexTabStyles.foodChoicesCard}>
              <Text style={indexTabStyles.sectionTitle}>Pilihan Makanan</Text>
              <View style={indexTabStyles.foodChoicesList}>
                {getFoodChoices(selectedMeal?.type || '').map((food, index) => (
                  <TouchableOpacity key={index} style={indexTabStyles.foodChoiceItem}>
                    <Text style={indexTabStyles.foodChoiceText}>{food.name}</Text>
                    <Text style={indexTabStyles.foodChoiceCalories}>{food.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Asupan Cairan */}
            <View style={indexTabStyles.fluidIntakeCard}>
              <Text style={indexTabStyles.sectionTitle}>Asupan Cairan</Text>
              <View style={indexTabStyles.fluidIntakeRow}>
                <Text style={indexTabStyles.fluidIntakeIcon}>💧</Text>
                <Text style={indexTabStyles.fluidIntakeText}>2 gelas air</Text>
                <Text style={indexTabStyles.fluidIntakeSubtext}>(400ml)</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={indexTabStyles.actionButtonsContainer}>
              <TouchableOpacity style={indexTabStyles.modalScanButton} onPress={() => setShowNutritionScanner(true)}>
                <Scan size={20} color="#FFFFFF" />
                <Text style={indexTabStyles.modalScanButtonText}>Scan Food</Text>
              </TouchableOpacity>

              <TouchableOpacity style={indexTabStyles.adjustButton}>
                <Plus size={20} color="#3B82F6" />
                <Text style={indexTabStyles.adjustButtonText}>Adjust Food</Text>
              </TouchableOpacity>
            </View>

            {/* Status Action Buttons */}
            <View style={indexTabStyles.statusButtonsContainer}>
              <TouchableOpacity
                style={indexTabStyles.completedButton}
                onPress={() => {
                  if (selectedMeal) {
                    updateMealStatus(selectedMeal.id, 'completed');
                    setShowMealModal(false);
                  }
                }}
              >
                <Text style={indexTabStyles.completedButtonText}>Completed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={indexTabStyles.skippedButton}
                onPress={() => {
                  if (selectedMeal) {
                    updateMealStatus(selectedMeal.id, 'skipped');
                    setShowMealModal(false);
                  }
                }}
              >
                <Text style={indexTabStyles.skippedButtonText}>Skipped</Text>
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
          // Handle save food logic here
          console.log('Food saved from nutrition scanner');
        }}
      />
    </SafeAreaView>
  );
}
