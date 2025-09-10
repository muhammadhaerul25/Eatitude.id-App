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
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { nutritionScannerStyles } from '../../styles/tabs/nutritionScannerStyles';

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
            <SafeAreaView style={nutritionScannerStyles.container}>
                {/* Header */}
                <View style={nutritionScannerStyles.header}>
                    <View style={nutritionScannerStyles.headerLeft}>
                        <TouchableOpacity onPress={onClose} style={nutritionScannerStyles.closeButton}>
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                        <View>
                            <Text style={nutritionScannerStyles.headerTitle}>AI Food Scanner</Text>
                            <Text style={nutritionScannerStyles.headerSubtitle}>Powered by Eatitude AI</Text>
                        </View>
                    </View>
                    {showResults && (
                        <TouchableOpacity onPress={resetScanner} style={nutritionScannerStyles.resetButton}>
                            <Text style={nutritionScannerStyles.resetButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Navigation */}
                {!showResults && (
                    <View style={nutritionScannerStyles.tabContainer}>
                        <TouchableOpacity
                            style={[nutritionScannerStyles.tab, activeTab === 'meal' && nutritionScannerStyles.activeTab]}
                            onPress={() => setActiveTab('meal')}
                        >
                            <Camera size={16} color={activeTab === 'meal' ? '#111827' : '#6B7280'} />
                            <Text style={[nutritionScannerStyles.tabText, activeTab === 'meal' && nutritionScannerStyles.activeTabText]}>
                                Scan Meal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[nutritionScannerStyles.tab, activeTab === 'label' && nutritionScannerStyles.activeTab]}
                            onPress={() => setActiveTab('label')}
                        >
                            <Info size={16} color={activeTab === 'label' ? '#111827' : '#6B7280'} />
                            <Text style={[nutritionScannerStyles.tabText, activeTab === 'label' && nutritionScannerStyles.activeTabText]}>
                                Scan Label
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan Content */}
                {!showResults && !isScanning && (
                    <ScrollView style={nutritionScannerStyles.scanContent} showsVerticalScrollIndicator={false}>
                        {activeTab === 'meal' ? (
                            <View style={nutritionScannerStyles.scanSection}>
                                <View style={nutritionScannerStyles.titleContainer}>
                                    <Zap size={24} color="#10B981" />
                                    <Text style={nutritionScannerStyles.scanTitle}>Scan Your Meal</Text>
                                </View>
                                <Text style={nutritionScannerStyles.scanDescription}>
                                    Point your camera at any food to instantly get complete nutrition facts including calories, macros, and micronutrients.
                                </Text>

                                {/* Tips */}
                                <View style={nutritionScannerStyles.tipsContainer}>
                                    <Text style={nutritionScannerStyles.tipsTitle}>Tips for better scanning:</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Ensure good lighting</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Center the food in frame</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Keep camera steady</Text>
                                </View>

                                {/* Camera/Scan Area */}
                                <View style={nutritionScannerStyles.scanArea}>
                                    <View style={nutritionScannerStyles.cameraContainer}>
                                        <View style={nutritionScannerStyles.cameraFrame}>
                                            <View style={nutritionScannerStyles.cornerTL} />
                                            <View style={nutritionScannerStyles.cornerTR} />
                                            <View style={nutritionScannerStyles.cornerBL} />
                                            <View style={nutritionScannerStyles.cornerBR} />
                                        </View>
                                        <View style={nutritionScannerStyles.cameraPlaceholder}>
                                            <Camera size={48} color="#6B7280" />
                                            <Text style={nutritionScannerStyles.cameraText}>Position food in center</Text>
                                        </View>

                                        {/* Scan Button */}
                                        <TouchableOpacity
                                            style={nutritionScannerStyles.scanButton}
                                            onPress={handleScan}
                                        >
                                            <Zap size={20} color="#FFFFFF" />
                                            <Text style={nutritionScannerStyles.scanButtonText}>Scan Food</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={nutritionScannerStyles.scanSection}>
                                <View style={nutritionScannerStyles.titleContainer}>
                                    <Info size={24} color="#3B82F6" />
                                    <Text style={nutritionScannerStyles.scanTitle}>Scan Nutrition Label</Text>
                                </View>
                                <Text style={nutritionScannerStyles.scanDescription}>
                                    Scan the nutrition facts label on packaged foods to get accurate nutritional information.
                                </Text>

                                {/* Camera/Scan Area for Label */}
                                <View style={nutritionScannerStyles.scanArea}>
                                    <View style={nutritionScannerStyles.cameraContainer}>
                                        {/* Nutrition Label Overlay */}
                                        <View style={nutritionScannerStyles.nutritionLabel}>
                                            <View style={nutritionScannerStyles.nutritionHeader}>
                                                <Text style={nutritionScannerStyles.nutritionTitle}>Nutrition Facts</Text>
                                                <Text style={nutritionScannerStyles.servingSize}>Serving Size 1/2 cup (114g)</Text>
                                                <Text style={nutritionScannerStyles.servingSize}>Servings Per Container 4</Text>
                                            </View>

                                            <View style={nutritionScannerStyles.caloriesSection}>
                                                <View style={nutritionScannerStyles.caloriesRow}>
                                                    <Text style={nutritionScannerStyles.caloriesLabel}>Calories</Text>
                                                    <Text style={nutritionScannerStyles.caloriesValue}>200</Text>
                                                </View>
                                            </View>

                                            <View style={nutritionScannerStyles.nutritionDetails}>
                                                <View style={nutritionScannerStyles.dailyValueHeader}>
                                                    <Text style={nutritionScannerStyles.dailyValueText}>% Daily Value*</Text>
                                                </View>
                                                <View style={nutritionScannerStyles.nutritionRow}>
                                                    <Text style={nutritionScannerStyles.nutritionBold}>Total Fat</Text>
                                                    <Text style={nutritionScannerStyles.nutritionBold}>8%</Text>
                                                </View>
                                                <View style={nutritionScannerStyles.nutritionRowIndent}>
                                                    <Text style={nutritionScannerStyles.nutritionText}>Saturated Fat 1g</Text>
                                                    <Text style={nutritionScannerStyles.nutritionBold}>5%</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Scan Button */}
                                        <TouchableOpacity
                                            style={nutritionScannerStyles.scanButton}
                                            onPress={handleScan}
                                        >
                                            <Info size={20} color="#FFFFFF" />
                                            <Text style={nutritionScannerStyles.scanButtonText}>Analyze Label</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Bottom spacing for scroll */}
                        <View style={nutritionScannerStyles.scanBottomSpacing} />
                    </ScrollView>
                )}

                {/* Scanning State */}
                {isScanning && (
                    <View style={nutritionScannerStyles.scanningContainer}>
                        <View style={nutritionScannerStyles.scanningContent}>
                            <View style={nutritionScannerStyles.scanningAnimation}>
                                <Zap size={48} color="#10B981" />
                            </View>
                            <Text style={nutritionScannerStyles.scanningTitle}>Analyzing your food...</Text>
                            <Text style={nutritionScannerStyles.scanningDescription}>
                                Our AI is processing the image and calculating nutrition facts
                            </Text>
                            <View style={nutritionScannerStyles.progressBar}>
                                <View style={nutritionScannerStyles.progressBarFill} />
                            </View>
                        </View>
                    </View>
                )}

                {showResults && (
                    <ScrollView style={nutritionScannerStyles.resultsContainer} showsVerticalScrollIndicator={false}>
                        <View style={nutritionScannerStyles.resultsHeader}>
                            <CheckCircle size={24} color="#10B981" />
                            <Text style={nutritionScannerStyles.resultsTitle}>Scan Complete!</Text>
                        </View>

                        {/* Confidence Score */}
                        <View style={nutritionScannerStyles.confidenceCard}>
                            <Text style={nutritionScannerStyles.confidenceLabel}>Analysis Confidence</Text>
                            <View style={nutritionScannerStyles.confidenceBar}>
                                <View style={[nutritionScannerStyles.confidenceBarFill, { width: '92%' }]} />
                            </View>
                            <Text style={nutritionScannerStyles.confidenceText}>92% accurate</Text>
                        </View>

                        {/* Quick Summary */}
                        <View style={nutritionScannerStyles.summaryCard}>
                            <Text style={nutritionScannerStyles.summaryTitle}>Quick Summary</Text>
                            <View style={nutritionScannerStyles.summaryRow}>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Calories</Text>
                                    <Text style={nutritionScannerStyles.summaryValue}>
                                        {activeTab === 'meal' ? '485' : '220'}
                                    </Text>
                                </View>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Grade</Text>
                                    <View style={nutritionScannerStyles.gradeBadgeSmall}>
                                        <Text style={nutritionScannerStyles.gradeTextSmall}>
                                            {activeTab === 'meal' ? 'B+' : 'B'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Protein</Text>
                                    <Text style={nutritionScannerStyles.summaryValue}>
                                        {activeTab === 'meal' ? '25g' : '8g'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Nama Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Nama Makanan</Text>
                            <Text style={nutritionScannerStyles.sectionValue}>
                                {activeTab === 'meal' ? 'Nasi Goreng Ayam' : 'Sereal Gandum dengan Susu'}
                            </Text>
                        </View>

                        {/* Foto Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Foto Makanan</Text>
                            <View style={nutritionScannerStyles.photoPlaceholder}>
                                <Camera size={32} color="#9CA3AF" />
                            </View>
                        </View>

                        {/* Estimasi Komposisi Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Estimasi Komposisi Makanan</Text>
                            {activeTab === 'meal' ? (
                                <>
                                    <Text style={nutritionScannerStyles.compositionText}>Nasi Putih (150 gram)</Text>
                                    <Text style={nutritionScannerStyles.compositionText}>Ayam Goreng (80 gram)</Text>
                                    <Text style={nutritionScannerStyles.compositionText}>Telur (50 gram)</Text>
                                    <Text style={nutritionScannerStyles.compositionText}>Sayuran Campur (30 gram)</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={nutritionScannerStyles.compositionText}>Sereal Gandum (50 gram)</Text>
                                    <Text style={nutritionScannerStyles.compositionText}>Susu Sapi (120 gram)</Text>
                                </>
                            )}
                        </View>

                        {/* Kandungan Makronutrisi */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Makronutrisi</Text>
                            {activeTab === 'meal' ? (
                                <>
                                    <Text style={nutritionScannerStyles.nutrientText}>Karbohidrat (68 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Protein (25 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Lemak (12 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Serat (3 gram)</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={nutritionScannerStyles.nutrientText}>Karbohidrat (42 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Protein (8 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Lemak (3 gram)</Text>
                                    <Text style={nutritionScannerStyles.nutrientText}>Serat (4 gram)</Text>
                                </>
                            )}
                        </View>

                        {/* Kandungan Mikronutrisi */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Mikronutrisi</Text>

                            <Text style={nutritionScannerStyles.microSectionTitle}>Vitamin</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin A (0.2 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin B Kompleks (1.5 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin C (0.8 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin D (2.1 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin E (0.5 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Vitamin K (0.1 mg)</Text>

                            <Text style={[nutritionScannerStyles.microSectionTitle, { marginTop: 16 }]}>Mineral</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Kalsium (120 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Zat Besi (2.1 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Magnesium (45 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Kalium (180 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Natrium (160 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Zinc (1.2 mg)</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>Yodium (0.05 mg)</Text>
                        </View>

                        {/* Kandungan Tambahan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Tambahan</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Gula (12 g)</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Garam (0.4 g)</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Lemak Jenuh (1 g)</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Lemak Trans (0 g)</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Kafein (0 mg)</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>Kolesterol (5 mg)</Text>
                        </View>

                        {/* Total Kalori, Nutri Grade, Nutri Status, dan Keterangan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.totalCaloriesText}>
                                Total Kalori: {activeTab === 'meal' ? '485' : '220'} kcal
                            </Text>

                            <Text style={nutritionScannerStyles.gradeTextSimple}>
                                Nutri Grade: {activeTab === 'meal' ? 'B+' : 'B'}
                            </Text>

                            <Text style={nutritionScannerStyles.statusText}>
                                Nutri Status: {activeTab === 'meal' ? 'Seimbang untuk Makan Siang' : 'Baik untuk Sarapan'}
                            </Text>

                            <Text style={nutritionScannerStyles.descriptionLabel}>Keterangan:</Text>
                            <Text style={nutritionScannerStyles.descriptionText}>
                                {activeTab === 'meal'
                                    ? 'Nasi goreng ayam ini mengandung karbohidrat yang cukup untuk energi, protein dari ayam dan telur untuk pertumbuhan otot. Perhatikan kandungan lemak dan garam yang cukup tinggi.'
                                    : 'Makanan ini mengandung karbohidrat kompleks yang baik untuk energi pagi hari. Kandungan protein dan kalsium dari susu mendukung pertumbuhan. Perhatikan kandungan gula yang cukup tinggi.'
                                }
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={nutritionScannerStyles.actionButtons}>
                            <TouchableOpacity style={nutritionScannerStyles.saveButton} onPress={handleSaveFood}>
                                <Save size={20} color="#FFFFFF" />
                                <Text style={nutritionScannerStyles.saveButtonText}>Save Food</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={nutritionScannerStyles.cancelButton} onPress={onClose}>
                                <Text style={nutritionScannerStyles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={nutritionScannerStyles.bottomSpacing} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
}

