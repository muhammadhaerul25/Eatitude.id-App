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
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [showNutritionScanner, setShowNutritionScanner] = useState(false);

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const mockMeals: MealItem[] = [
    {
      id: '1',
      type: 'sarapan',
      timeRange: '06:00 - 08:00',
      rekomendasi_menu: 'Get Recommendation',
      targetKalori: 400,
      status: 'not_planned',
    },
    {
      id: '2',
      type: 'snack_pagi',
      timeRange: '09:30 - 10:30',
      rekomendasi_menu: 'Get Recommendation',
      targetKalori: 150,
      status: 'upcoming',
      isOptional: true,
    },
    {
      id: '3',
      type: 'makan_siang',
      timeRange: '12:00 - 14:00',
      rekomendasi_menu: 'Get Recommendation',
      targetKalori: 500,
      status: 'upcoming',
    },
    {
      id: '4',
      type: 'snack_sore',
      timeRange: '15:30 - 16:30',
      rekomendasi_menu: 'Get Recommendation',
      targetKalori: 150,
      status: 'not_planned',
      isOptional: true,
    },
    {
      id: '5',
      type: 'makan_malam',
      timeRange: '18:00 - 20:00',
      rekomendasi_menu: 'Get Recommendation',
      targetKalori: 450,
      status: 'not_planned',
    },
  ];

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

  const updateMealStatus = (status: 'completed' | 'skipped') => {
    if (selectedMeal) {
      // Here you would typically update the meal status in your state management
      // For now, we'll just close the modal
      setShowMealModal(false);
      // You could also show a success message
      console.log(`Meal ${selectedMeal.type} marked as ${status}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <View style={styles.timeContainer}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.currentTime}>{currentTime}</Text>
        </View>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => navigateDate(-1)}
        >
          <ChevronLeft size={20} color="#6B7280" />
        </TouchableOpacity>

        <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => navigateDate(1)}
        >
          <ChevronRight size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Reminders */}
      <View style={styles.reminderContainer}>
        <Bell size={16} color="#F59E0B" />
        <Text style={styles.reminderText}>
          Next: Lunch in 2 hours • Don't forget to drink water!
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Hari Ini */}
        <Text style={styles.sectionTitle}>Menu Hari Ini</Text>

        {mockMeals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={[
              styles.mealCard,
              meal.status === 'completed' && styles.mealCardCompleted,
              meal.isOptional && styles.mealCardOptional
            ]}
            onPress={() => openMealModal(meal)}
          >
            <View style={styles.mealHeader}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealIcon}>{getMealIcon(meal.type)}</Text>
                <View style={styles.mealTextContainer}>
                  <View style={styles.mealTitleRow}>
                    <Text style={styles.mealType}>
                      {getMealTitle(meal.type)}
                    </Text>
                    {meal.isOptional && (
                      <Text style={styles.optionalBadge}>Opsional</Text>
                    )}
                  </View>
                  <Text style={styles.mealTime}>{meal.timeRange}</Text>
                </View>
              </View>

              <View style={styles.mealDetails}>
                <Text style={[
                  styles.mealFood,
                  meal.status === 'completed' && styles.completedText
                ]}>
                  {meal.rekomendasi_menu}
                </Text>
                <Text style={styles.mealCalories}>
                  Target: {meal.targetKalori} kcal
                </Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(meal.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
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
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.scanButton]} onPress={() => setShowNutritionScanner(true)}>
            <Scan size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Scan Food</Text>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {getMealTitle(selectedMeal?.type || '')} Detail
            </Text>
            <TouchableOpacity onPress={() => setShowMealModal(false)}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Meal Info Card */}
            <View style={styles.mealInfoCard}>
              <Text style={styles.mealDetailTitle}>Jenis Makanan</Text>
              <Text style={styles.mealDetailValue}>{getMealTitle(selectedMeal?.type || '')}</Text>

              <Text style={styles.mealDetailTitle}>Waktu</Text>
              <Text style={styles.mealDetailValue}>{selectedMeal?.timeRange}</Text>

              <Text style={styles.mealDetailTitle}>Target Kalori</Text>
              <Text style={styles.mealDetailCalories}>{selectedMeal?.targetKalori} kcal</Text>
            </View>

            {/* Rekomendasi Makanan */}
            <View style={styles.recommendationCard}>
              <Text style={styles.sectionTitle}>Rekomendasi Makanan</Text>
              <Text style={styles.recommendationDescription}>
                {getMealRecommendation(selectedMeal?.type || '')}
              </Text>
            </View>

            {/* Pilihan Makanan */}
            <View style={styles.foodChoicesCard}>
              <Text style={styles.sectionTitle}>Pilihan Makanan</Text>
              <View style={styles.foodChoicesList}>
                {getFoodChoices(selectedMeal?.type || '').map((food, index) => (
                  <TouchableOpacity key={index} style={styles.foodChoiceItem}>
                    <Text style={styles.foodChoiceText}>{food.name}</Text>
                    <Text style={styles.foodChoiceCalories}>{food.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Asupan Cairan */}
            <View style={styles.fluidIntakeCard}>
              <Text style={styles.sectionTitle}>Asupan Cairan</Text>
              <View style={styles.fluidIntakeRow}>
                <Text style={styles.fluidIntakeIcon}>💧</Text>
                <Text style={styles.fluidIntakeText}>2 gelas air</Text>
                <Text style={styles.fluidIntakeSubtext}>(400ml)</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.modalScanButton} onPress={() => setShowNutritionScanner(true)}>
                <Scan size={20} color="#FFFFFF" />
                <Text style={styles.modalScanButtonText}>Scan Food</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adjustButton}>
                <Plus size={20} color="#3B82F6" />
                <Text style={styles.adjustButtonText}>Adjust Food</Text>
              </TouchableOpacity>
            </View>

            {/* Status Action Buttons */}
            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity
                style={styles.completedButton}
                onPress={() => updateMealStatus('completed')}
              >
                <Text style={styles.completedButtonText}>Completed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skippedButton}
                onPress={() => updateMealStatus('skipped')}
              >
                <Text style={styles.skippedButtonText}>Skipped</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBottomSpacing} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  mealCardOptional: {
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  optionalBadge: {
    fontSize: 9,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '500',
    flexShrink: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0, // Allows shrinking below content size
  },
  mealTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  mealIcon: {
    fontSize: 24,
    flexShrink: 0,
  },
  mealType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
  },
  mealTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  mealDetails: {
    alignItems: 'flex-end',
    flexShrink: 0,
    maxWidth: '45%',
  },
  mealFood: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'right',
  },
  mealCalories: {
    fontSize: 12,
    color: '#6B7280',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  completedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  mealPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  mealPlanTime: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  mealPlanFood: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  mealPlanCalories: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 8,
  },
  modalActionText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationSection: {
    marginBottom: 24,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  foodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodOptionCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Meal Detail Modal Styles
  mealInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  mealDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  mealDetailCalories: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  foodChoicesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodChoicesList: {
    gap: 8,
  },
  foodChoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodChoiceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  foodChoiceCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  fluidIntakeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fluidIntakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fluidIntakeIcon: {
    fontSize: 20,
  },
  fluidIntakeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  fluidIntakeSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalScanButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  adjustButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    gap: 8,
  },
  adjustButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  completedButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skippedButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skippedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBottomSpacing: {
    height: 20,
  },
});