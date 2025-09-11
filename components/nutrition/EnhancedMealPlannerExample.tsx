/**
 * Enhanced Meal Planner Component Example
 * 
 * This component demonstrates how to use the enhanced meal planner API
 * with automatic daily meal plan generation and smart caching.
 */

import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    RefreshCw,
    Utensils
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useEnhancedMealPlanner } from '../../hooks/tabs/useEnhancedMealPlanner';
import { MealItem } from '../../services/mealPlanAPI';

/**
 * Enhanced Meal Planner Screen Component
 */
export default function EnhancedMealPlannerScreen() {
    const [showMealModal, setShowMealModal] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);

    // Use the enhanced meal planner hook
    const {
        meals,
        selectedDate,
        isGeneratingMealPlan,
        isLoadingMealPlan,
        lastError,
        setSelectedDate,
        generateMealPlan,
        refreshMealPlan,
        forceNewMealPlan,
        updateMealStatus,
        getTotalCalories,
        getCompletedCalories,
        clearError,
    } = useEnhancedMealPlanner();

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
            case 'not_planned': return 'Belum Direncanakan';
            case 'upcoming': return 'Akan Datang';
            case 'completed': return 'Selesai';
            case 'skipped': return 'Dilewati';
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

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const totalCalories = getTotalCalories();
    const completedCalories = getCompletedCalories();
    const calorieProgress = totalCalories > 0 ? (completedCalories / totalCalories) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Enhanced Meal Planner</Text>
                <View style={styles.timeContainer}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.currentTime}>{currentTime}</Text>
                </View>
            </View>

            {/* Error Display */}
            {lastError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {lastError}</Text>
                    <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
                        <Text style={styles.errorCloseText}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

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

            {/* Calorie Progress */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Daily Calorie Progress</Text>
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${Math.min(calorieProgress, 100)}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {completedCalories} / {totalCalories} kcal ({Math.round(calorieProgress)}%)
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.refreshButton]}
                    onPress={refreshMealPlan}
                    disabled={isLoadingMealPlan}
                >
                    <RefreshCw size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Refresh</Text>
                </TouchableOpacity>

                {isToday && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.generateButton]}
                        onPress={handleGenerateNewPlan}
                        disabled={isGeneratingMealPlan}
                    >
                        <Utensils size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>New Plan</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Loading State */}
            {(isLoadingMealPlan || isGeneratingMealPlan) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>
                        {isGeneratingMealPlan ? 'Generating meal plan...' : 'Loading meal plan...'}
                    </Text>
                </View>
            )}

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoadingMealPlan}
                        onRefresh={refreshMealPlan}
                        colors={['#3B82F6']}
                    />
                }
            >
                {/* Today's Meals Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {isToday ? "Menu Hari Ini" : `Menu ${formatDate(selectedDate)}`}
                    </Text>
                </View>

                {meals.map((meal: MealItem) => (
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

                {/* Empty State */}
                {meals.length === 0 && !isLoadingMealPlan && (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>No Meal Plan Available</Text>
                        <Text style={styles.emptyStateText}>
                            Generate a meal plan to see your daily recommendations
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={generateMealPlan}
                        >
                            <Text style={styles.emptyStateButtonText}>Generate Meal Plan</Text>
                        </TouchableOpacity>
                    </View>
                )}
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

                    <ScrollView style={styles.modalContent}>
                        {selectedMeal && (
                            <>
                                {/* Meal Info */}
                                <View style={styles.mealInfoCard}>
                                    <Text style={styles.mealDetailTitle}>Waktu</Text>
                                    <Text style={styles.mealDetailValue}>{selectedMeal.timeRange}</Text>

                                    <Text style={styles.mealDetailTitle}>Target Kalori</Text>
                                    <Text style={styles.mealDetailCalories}>{selectedMeal.targetKalori} kcal</Text>

                                    {selectedMeal.details?.asupan_cairan && (
                                        <>
                                            <Text style={styles.mealDetailTitle}>Asupan Cairan</Text>
                                            <Text style={styles.mealDetailValue}>
                                                {selectedMeal.details.asupan_cairan} gelas air
                                            </Text>
                                        </>
                                    )}
                                </View>

                                {/* Meal Description */}
                                {selectedMeal.details?.deskripsi && (
                                    <View style={styles.recommendationCard}>
                                        <Text style={styles.sectionTitle}>Deskripsi</Text>
                                        <Text style={styles.recommendationDescription}>
                                            {selectedMeal.details.deskripsi}
                                        </Text>
                                    </View>
                                )}

                                {/* Menu Options */}
                                {selectedMeal.details?.pilihan_menu && (
                                    <View style={styles.foodChoicesCard}>
                                        <Text style={styles.sectionTitle}>Pilihan Menu</Text>
                                        <View style={styles.foodChoicesList}>
                                            {selectedMeal.details.pilihan_menu.map((menu: string, index: number) => (
                                                <TouchableOpacity key={index} style={styles.foodChoiceItem}>
                                                    <Text style={styles.foodChoiceText}>{menu}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Status Action Buttons */}
                                <View style={styles.statusButtonsContainer}>
                                    <TouchableOpacity
                                        style={styles.completedButton}
                                        onPress={() => {
                                            if (selectedMeal) {
                                                updateMealStatus(selectedMeal.id, 'completed');
                                                setShowMealModal(false);
                                            }
                                        }}
                                    >
                                        <Text style={styles.completedButtonText}>Mark as Completed</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.skippedButton}
                                        onPress={() => {
                                            if (selectedMeal) {
                                                updateMealStatus(selectedMeal.id, 'skipped');
                                                setShowMealModal(false);
                                            }
                                        }}
                                    >
                                        <Text style={styles.skippedButtonText}>Mark as Skipped</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// Styles for the enhanced meal planner
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currentTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    dateNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    dateButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    selectedDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        flex: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        margin: 16,
    },
    errorText: {
        flex: 1,
        color: '#B91C1C',
        fontSize: 14,
    },
    errorCloseButton: {
        padding: 4,
    },
    errorCloseText: {
        color: '#B91C1C',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: 8,
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    refreshButton: {
        backgroundColor: '#6B7280',
    },
    generateButton: {
        backgroundColor: '#3B82F6',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    mealCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealCardCompleted: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
        borderWidth: 1,
    },
    mealCardOptional: {
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    mealIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    mealTextContainer: {
        flex: 1,
    },
    mealTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mealType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    optionalBadge: {
        fontSize: 12,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    mealTime: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    mealDetails: {
        alignItems: 'flex-end',
    },
    mealFood: {
        fontSize: 14,
        color: '#1F2937',
        textAlign: 'right',
        maxWidth: 120,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#6B7280',
    },
    mealCalories: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
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
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyStateButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyStateButtonText: {
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    mealInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
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
        color: '#1F2937',
    },
    mealDetailCalories: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3B82F6',
    },
    recommendationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
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
        marginTop: 8,
    },
    foodChoicesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    foodChoicesList: {
        marginTop: 8,
    },
    foodChoiceItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    foodChoiceText: {
        fontSize: 14,
        color: '#1F2937',
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 32,
    },
    completedButton: {
        flex: 1,
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 8,
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
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    skippedButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
