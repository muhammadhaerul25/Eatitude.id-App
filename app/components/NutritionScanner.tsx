import {
    Camera,
    CheckCircle,
    Info,
    Save,
    X,
    Zap
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

interface NutritionScannerProps {
    visible: boolean;
    onClose: () => void;
    onSaveFood?: () => void;
}

export default function NutritionScanner({ visible, onClose, onSaveFood }: NutritionScannerProps) {
    const [showResults, setShowResults] = useState(false);
    const [activeTab, setActiveTab] = useState<'meal' | 'label'>('meal');
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate scanning process
        setTimeout(() => {
            setIsScanning(false);
            setShowResults(true);
        }, 2000);
    };

    const handleSaveFood = () => {
        onSaveFood?.();
        onClose();
    };

    const resetScanner = () => {
        setShowResults(false);
        setIsScanning(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>AI Food Scanner</Text>
                            <Text style={styles.headerSubtitle}>Powered by Eatitude AI</Text>
                        </View>
                    </View>
                    {showResults && (
                        <TouchableOpacity onPress={resetScanner} style={styles.resetButton}>
                            <Text style={styles.resetButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Navigation */}
                {!showResults && (
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'meal' && styles.activeTab]}
                            onPress={() => setActiveTab('meal')}
                        >
                            <Camera size={16} color={activeTab === 'meal' ? '#111827' : '#6B7280'} />
                            <Text style={[styles.tabText, activeTab === 'meal' && styles.activeTabText]}>
                                Scan Meal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'label' && styles.activeTab]}
                            onPress={() => setActiveTab('label')}
                        >
                            <Info size={16} color={activeTab === 'label' ? '#111827' : '#6B7280'} />
                            <Text style={[styles.tabText, activeTab === 'label' && styles.activeTabText]}>
                                Scan Label
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan Content */}
                {!showResults && !isScanning && (
                    <ScrollView style={styles.scanContent} showsVerticalScrollIndicator={false}>
                        {activeTab === 'meal' ? (
                            <View style={styles.scanSection}>
                                <View style={styles.titleContainer}>
                                    <Zap size={24} color="#10B981" />
                                    <Text style={styles.scanTitle}>Scan Your Meal</Text>
                                </View>
                                <Text style={styles.scanDescription}>
                                    Point your camera at any food to instantly get complete nutrition facts including calories, macros, and micronutrients.
                                </Text>

                                {/* Tips */}
                                <View style={styles.tipsContainer}>
                                    <Text style={styles.tipsTitle}>Tips for better scanning:</Text>
                                    <Text style={styles.tipsText}>• Ensure good lighting</Text>
                                    <Text style={styles.tipsText}>• Center the food in frame</Text>
                                    <Text style={styles.tipsText}>• Keep camera steady</Text>
                                </View>

                                {/* Camera/Scan Area */}
                                <View style={styles.scanArea}>
                                    <View style={styles.cameraContainer}>
                                        <View style={styles.cameraFrame}>
                                            <View style={styles.cornerTL} />
                                            <View style={styles.cornerTR} />
                                            <View style={styles.cornerBL} />
                                            <View style={styles.cornerBR} />
                                        </View>
                                        <View style={styles.cameraPlaceholder}>
                                            <Camera size={48} color="#6B7280" />
                                            <Text style={styles.cameraText}>Position food in center</Text>
                                        </View>

                                        {/* Scan Button */}
                                        <TouchableOpacity
                                            style={styles.scanButton}
                                            onPress={handleScan}
                                        >
                                            <Zap size={20} color="#FFFFFF" />
                                            <Text style={styles.scanButtonText}>Scan Food</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.scanSection}>
                                <View style={styles.titleContainer}>
                                    <Info size={24} color="#3B82F6" />
                                    <Text style={styles.scanTitle}>Scan Nutrition Label</Text>
                                </View>
                                <Text style={styles.scanDescription}>
                                    Scan the nutrition facts label on packaged foods to get accurate nutritional information.
                                </Text>

                                {/* Camera/Scan Area for Label */}
                                <View style={styles.scanArea}>
                                    <View style={styles.cameraContainer}>
                                        {/* Nutrition Label Overlay */}
                                        <View style={styles.nutritionLabel}>
                                            <View style={styles.nutritionHeader}>
                                                <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
                                                <Text style={styles.servingSize}>Serving Size 1/2 cup (114g)</Text>
                                                <Text style={styles.servingSize}>Servings Per Container 4</Text>
                                            </View>

                                            <View style={styles.caloriesSection}>
                                                <View style={styles.caloriesRow}>
                                                    <Text style={styles.caloriesLabel}>Calories</Text>
                                                    <Text style={styles.caloriesValue}>200</Text>
                                                </View>
                                            </View>

                                            <View style={styles.nutritionDetails}>
                                                <View style={styles.dailyValueHeader}>
                                                    <Text style={styles.dailyValueText}>% Daily Value*</Text>
                                                </View>
                                                <View style={styles.nutritionRow}>
                                                    <Text style={styles.nutritionBold}>Total Fat</Text>
                                                    <Text style={styles.nutritionBold}>8%</Text>
                                                </View>
                                                <View style={styles.nutritionRowIndent}>
                                                    <Text style={styles.nutritionText}>Saturated Fat 1g</Text>
                                                    <Text style={styles.nutritionBold}>5%</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Scan Button */}
                                        <TouchableOpacity
                                            style={styles.scanButton}
                                            onPress={handleScan}
                                        >
                                            <Info size={20} color="#FFFFFF" />
                                            <Text style={styles.scanButtonText}>Analyze Label</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Bottom spacing for scroll */}
                        <View style={styles.scanBottomSpacing} />
                    </ScrollView>
                )}

                {/* Scanning State */}
                {isScanning && (
                    <View style={styles.scanningContainer}>
                        <View style={styles.scanningContent}>
                            <View style={styles.scanningAnimation}>
                                <Zap size={48} color="#10B981" />
                            </View>
                            <Text style={styles.scanningTitle}>Analyzing your food...</Text>
                            <Text style={styles.scanningDescription}>
                                Our AI is processing the image and calculating nutrition facts
                            </Text>
                            <View style={styles.progressBar}>
                                <View style={styles.progressBarFill} />
                            </View>
                        </View>
                    </View>
                )}

                {showResults && (
                    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.resultsHeader}>
                            <CheckCircle size={24} color="#10B981" />
                            <Text style={styles.resultsTitle}>Scan Complete!</Text>
                        </View>

                        {/* Confidence Score */}
                        <View style={styles.confidenceCard}>
                            <Text style={styles.confidenceLabel}>Analysis Confidence</Text>
                            <View style={styles.confidenceBar}>
                                <View style={[styles.confidenceBarFill, { width: '92%' }]} />
                            </View>
                            <Text style={styles.confidenceText}>92% accurate</Text>
                        </View>

                        {/* Quick Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Quick Summary</Text>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Calories</Text>
                                    <Text style={styles.summaryValue}>
                                        {activeTab === 'meal' ? '485' : '220'}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Grade</Text>
                                    <View style={styles.gradeBadgeSmall}>
                                        <Text style={styles.gradeTextSmall}>
                                            {activeTab === 'meal' ? 'B+' : 'B'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Protein</Text>
                                    <Text style={styles.summaryValue}>
                                        {activeTab === 'meal' ? '25g' : '8g'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Nama Makanan */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Nama Makanan</Text>
                            <Text style={styles.sectionValue}>
                                {activeTab === 'meal' ? 'Nasi Goreng Ayam' : 'Sereal Gandum dengan Susu'}
                            </Text>
                        </View>

                        {/* Foto Makanan */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Foto Makanan</Text>
                            <View style={styles.photoPlaceholder}>
                                <Camera size={32} color="#9CA3AF" />
                            </View>
                        </View>

                        {/* Estimasi Komposisi Makanan */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Estimasi Komposisi Makanan</Text>
                            {activeTab === 'meal' ? (
                                <>
                                    <Text style={styles.compositionText}>Nasi Putih (150 gram)</Text>
                                    <Text style={styles.compositionText}>Ayam Goreng (80 gram)</Text>
                                    <Text style={styles.compositionText}>Telur (50 gram)</Text>
                                    <Text style={styles.compositionText}>Sayuran Campur (30 gram)</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.compositionText}>Sereal Gandum (50 gram)</Text>
                                    <Text style={styles.compositionText}>Susu Sapi (120 gram)</Text>
                                </>
                            )}
                        </View>

                        {/* Kandungan Makronutrisi */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Kandungan Makronutrisi</Text>
                            {activeTab === 'meal' ? (
                                <>
                                    <Text style={styles.nutrientText}>Karbohidrat (68 gram)</Text>
                                    <Text style={styles.nutrientText}>Protein (25 gram)</Text>
                                    <Text style={styles.nutrientText}>Lemak (12 gram)</Text>
                                    <Text style={styles.nutrientText}>Serat (3 gram)</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.nutrientText}>Karbohidrat (42 gram)</Text>
                                    <Text style={styles.nutrientText}>Protein (8 gram)</Text>
                                    <Text style={styles.nutrientText}>Lemak (3 gram)</Text>
                                    <Text style={styles.nutrientText}>Serat (4 gram)</Text>
                                </>
                            )}
                        </View>

                        {/* Kandungan Mikronutrisi */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Kandungan Mikronutrisi</Text>

                            <Text style={styles.microSectionTitle}>Vitamin</Text>
                            <Text style={styles.microNutrientName}>Vitamin A (0.2 mg)</Text>
                            <Text style={styles.microNutrientName}>Vitamin B Kompleks (1.5 mg)</Text>
                            <Text style={styles.microNutrientName}>Vitamin C (0.8 mg)</Text>
                            <Text style={styles.microNutrientName}>Vitamin D (2.1 mg)</Text>
                            <Text style={styles.microNutrientName}>Vitamin E (0.5 mg)</Text>
                            <Text style={styles.microNutrientName}>Vitamin K (0.1 mg)</Text>

                            <Text style={[styles.microSectionTitle, { marginTop: 16 }]}>Mineral</Text>
                            <Text style={styles.microNutrientName}>Kalsium (120 mg)</Text>
                            <Text style={styles.microNutrientName}>Zat Besi (2.1 mg)</Text>
                            <Text style={styles.microNutrientName}>Magnesium (45 mg)</Text>
                            <Text style={styles.microNutrientName}>Kalium (180 mg)</Text>
                            <Text style={styles.microNutrientName}>Natrium (160 mg)</Text>
                            <Text style={styles.microNutrientName}>Zinc (1.2 mg)</Text>
                            <Text style={styles.microNutrientName}>Yodium (0.05 mg)</Text>
                        </View>

                        {/* Kandungan Tambahan */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Kandungan Tambahan</Text>
                            <Text style={styles.nutrientName}>Gula (12 g)</Text>
                            <Text style={styles.nutrientName}>Garam (0.4 g)</Text>
                            <Text style={styles.nutrientName}>Lemak Jenuh (1 g)</Text>
                            <Text style={styles.nutrientName}>Lemak Trans (0 g)</Text>
                            <Text style={styles.nutrientName}>Kafein (0 mg)</Text>
                            <Text style={styles.nutrientName}>Kolesterol (5 mg)</Text>
                        </View>

                        {/* Total Kalori, Nutri Grade, Nutri Status, dan Keterangan */}
                        <View style={styles.card}>
                            <Text style={styles.totalCaloriesText}>
                                Total Kalori: {activeTab === 'meal' ? '485' : '220'} kcal
                            </Text>

                            <Text style={styles.gradeTextSimple}>
                                Nutri Grade: {activeTab === 'meal' ? 'B+' : 'B'}
                            </Text>

                            <Text style={styles.statusText}>
                                Nutri Status: {activeTab === 'meal' ? 'Seimbang untuk Makan Siang' : 'Baik untuk Sarapan'}
                            </Text>

                            <Text style={styles.descriptionLabel}>Keterangan:</Text>
                            <Text style={styles.descriptionText}>
                                {activeTab === 'meal'
                                    ? 'Nasi goreng ayam ini mengandung karbohidrat yang cukup untuk energi, protein dari ayam dan telur untuk pertumbuhan otot. Perhatikan kandungan lemak dan garam yang cukup tinggi.'
                                    : 'Makanan ini mengandung karbohidrat kompleks yang baik untuk energi pagi hari. Kandungan protein dan kalsium dari susu mendukung pertumbuhan. Perhatikan kandungan gula yang cukup tinggi.'
                                }
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFood}>
                                <Save size={20} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Save Food</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomSpacing} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
        marginVertical: 16,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '600',
    },
    scanContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scanSection: {
        marginBottom: 24,
    },
    scanTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    scanDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 24,
    },
    scanArea: {
        marginBottom: 20,
    },
    cameraContainer: {
        height: 300,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        position: 'relative',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cameraText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 12,
        textAlign: 'center',
    },
    scanButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    nutritionLabel: {
        width: '100%',
        height: 250,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#111827',
        padding: 16,
    },
    nutritionHeader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    nutritionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
    },
    servingSize: {
        fontSize: 10,
        color: '#111827',
    },
    caloriesSection: {
        borderTopWidth: 8,
        borderTopColor: '#111827',
        paddingTop: 4,
        marginBottom: 8,
    },
    caloriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    caloriesLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    caloriesValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    nutritionDetails: {
        // fontSize: 10, // Remove this invalid property for ViewStyle
    },
    dailyValueHeader: {
        borderTopWidth: 1,
        borderTopColor: '#111827',
        paddingTop: 4,
        alignItems: 'flex-end',
    },
    dailyValueText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nutritionRowIndent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16,
    },
    nutritionBold: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
    },
    nutritionText: {
        fontSize: 10,
        color: '#111827',
    },
    doneButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#111827',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
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
    cardContent: {
        gap: 12,
    },
    section: {
        gap: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    sectionValue: {
        fontSize: 16,
        color: '#374151',
    },
    photoPlaceholder: {
        width: '100%',
        height: 128,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compositionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    compositionText: {
        fontSize: 14,
        color: '#111827',
    },
    compositionAmount: {
        fontSize: 14,
        color: '#6B7280',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    nutrientName: {
        fontSize: 14,
        color: '#111827',
    },
    nutrientValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    microSection: {
        marginBottom: 16,
    },
    microSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    microNutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    microNutrientName: {
        fontSize: 14,
        color: '#111827',
    },
    microNutrientValue: {
        fontSize: 14,
        color: '#111827',
    },
    totalCaloriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalCaloriesLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    totalCaloriesValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#EA580C',
    },
    gradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gradeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    gradeBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    gradeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    statusSection: {
        marginBottom: 12,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
    },
    descriptionSection: {
        gap: 4,
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    descriptionText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#059669',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomNavigation: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    bottomButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    bottomSpacing: {
        height: 20,
    },
    nutrientText: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 8,
    },
    totalCaloriesText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EA580C',
        marginBottom: 12,
    },
    gradeTextSimple: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10B981',
        marginBottom: 12,
    },
    // Header styles
    closeButton: {
        padding: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    resetButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    // Scan interface styles
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    tipsContainer: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065F46',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 13,
        color: '#047857',
        marginBottom: 4,
    },
    cameraFrame: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 60,
        borderRadius: 12,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#10B981',
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 20,
        height: 20,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: '#10B981',
        borderTopRightRadius: 12,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 20,
        height: 20,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#10B981',
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: '#10B981',
        borderBottomRightRadius: 12,
    },
    // Scanning state styles
    scanningContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    scanningContent: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 32,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    scanningAnimation: {
        marginBottom: 24,
    },
    scanningTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    scanningDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    progressBar: {
        width: 200,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 2,
        width: '70%',
    },
    // Results styles
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    confidenceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    confidenceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    confidenceBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    confidenceBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 3,
    },
    confidenceText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        textAlign: 'right',
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    gradeBadgeSmall: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    gradeTextSmall: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    scanBottomSpacing: {
        height: 40,
    },
});
