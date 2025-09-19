import * as ImagePicker from 'expo-image-picker';
import {
    AlertCircle,
    Camera,
    CheckCircle,
    Info,
    Save,
    Upload,
    X,
    Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ScanType, useFoodScanner } from '../../hooks/useFoodScanner';
import { nutritionScannerStyles } from '../../styles/tabs/nutritionScannerStyles';

interface NutritionScannerProps {
    visible: boolean;
    onClose: () => void;
    onSaveFood?: () => void;
}

export default function NutritionScanner({ visible, onClose, onSaveFood }: NutritionScannerProps) {
    const [activeTab, setActiveTab] = useState<ScanType>('meal');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Use the food scanner hook
    const {
        scanFood,
        isScanning,
        scanResult,
        scanError,
        clearResult,
        clearError } = useFoodScanner();

    // Get formatted nutrition data

    const handleImagePicker = async () => {
        try {
            console.log('Image picker triggered');

            // Check if we're in a web environment or if ImagePicker is not available
            const isWeb = typeof window !== 'undefined' && window.document;

            if (isWeb || !ImagePicker) {
                console.log('Using web fallback for image picking');
                handleWebImagePicker();
                return;
            }

            // Show options for camera or gallery
            Alert.alert(
                'Select Image',
                'Choose how you want to select an image',
                [
                    { text: 'Camera', onPress: () => handleCamera() },
                    { text: 'Gallery', onPress: () => handleGallery() },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } catch (error) {
            console.error('Error in handleImagePicker:', error);
            // Fallback to web picker
            handleWebImagePicker();
        }
    };

    const handleWebImagePicker = () => {
        try {
            console.log('Using web file input');

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                    console.log('File selected:', file);

                    setSelectedImage(file);

                    // Create preview URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        console.log('Preview created');
                        setImagePreview(result);
                    };
                    reader.readAsDataURL(file);
                }
            };

            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        } catch (error) {
            console.error('Error in web image picker:', error);
            Alert.alert('Error', 'Failed to open file picker. Please try again.');
        }
    }; const handleCamera = async () => {
        try {
            console.log('Camera option selected');

            // Request permission to access camera
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            console.log('Camera permission result:', permissionResult);

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                // Force JPEG format for better API compatibility
                allowsMultipleSelection: false,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            console.log('Camera result:', result);

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                await processImageAsset(asset);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleGallery = async () => {
        try {
            console.log('Gallery option selected');

            // Request permission to access media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Media library permission result:', permissionResult);

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library to select images.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                // Ensure we get the best quality image for API processing
                allowsMultipleSelection: false,
            });

            console.log('Gallery result:', result);

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                await processImageAsset(asset);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const processImageAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            console.log('Processing image asset:', asset);
            console.log('Asset URI:', asset.uri);
            console.log('Asset type:', asset.type);

            // Convert to File object for API with proper JPEG format
            const response = await fetch(asset.uri);
            const blob = await response.blob();

            console.log('🔍 === IMAGE PROCESSING DEBUG ===');
            console.log('📱 Asset details:', {
                uri: asset.uri,
                type: asset.type,
                width: asset.width,
                height: asset.height,
                fileSize: asset.fileSize
            });
            console.log('🌐 Fetch response details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                contentType: response.headers.get('content-type')
            });
            console.log('📦 Blob details:', {
                size: blob.size,
                type: blob.type,
                isValid: blob.size > 0
            });

            // For React Native, we'll trust the blob type and ensure JPEG MIME type
            let fileName = 'image.jpg';
            let mimeType = 'image/jpeg';

            // Create file with proper JPEG MIME type regardless of original format
            // The API expects JPEG format, so we'll ensure the MIME type is correct
            let finalBlob = blob;

            // If the blob type is not JPEG, create a new blob with JPEG MIME type
            if (blob.type && !blob.type.includes('jpeg') && !blob.type.includes('jpg')) {
                console.log(`🔄 Adjusting MIME type from ${blob.type} to image/jpeg`);
                finalBlob = new Blob([blob], { type: 'image/jpeg' });
                console.log('📦 Adjusted blob details:', {
                    originalType: blob.type,
                    newType: finalBlob.type,
                    sizeMatch: blob.size === finalBlob.size
                });
            }

            const file = new File([finalBlob], fileName, { type: mimeType });

            console.log('📄 Final File object details:', {
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024).toFixed(2)}KB`,
                lastModified: file.lastModified,
                webkitRelativePath: file.webkitRelativePath
            });
            console.log('🔍 === END IMAGE PROCESSING DEBUG ==='); console.log('File created:', {
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024).toFixed(2)}KB`
            });

            // Additional validation: verify the file is readable
            try {
                const testReader = new FileReader();
                await new Promise<void>((resolve, reject) => {
                    testReader.onload = () => {
                        console.log('✅ Image file validation successful');
                        resolve();
                    };
                    testReader.onerror = () => {
                        reject(new Error('Image file validation failed'));
                    };
                    testReader.readAsDataURL(file);
                });
            } catch (validationError) {
                console.error('🚨 Image validation failed:', validationError);
                Alert.alert('Error', 'The selected image appears to be corrupted. Please try a different image.');
                return;
            }

            setSelectedImage(file);
            setImagePreview(asset.uri);

            console.log('Image set successfully');
        } catch (error) {
            console.error('Error processing image:', error);
            Alert.alert('Error', 'Failed to process image. Please try again.');
        }
    };

    const handleScan = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first.');
            return;
        }

        try {
            await scanFood(selectedImage, activeTab);
        } catch (error) {
            console.error('Scan error:', error);
        }
    };

    const handleSaveFood = () => {
        if (scanResult) {
            onSaveFood?.();
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        clearResult();
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleRetry = async () => {
        clearError();
        if (selectedImage) {
            await scanFood(selectedImage, activeTab);
        }
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
                            <Text style={nutritionScannerStyles.headerTitle}>Nutri Scanner</Text>
                            <Text style={nutritionScannerStyles.headerSubtitle}>Powered by NutriAdvisor AI</Text>
                        </View>
                    </View>
                    {scanResult && (
                        <TouchableOpacity onPress={handleReset} style={nutritionScannerStyles.resetButton}>
                            <Text style={nutritionScannerStyles.resetButtonText}>Scan Lagi</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Navigation */}
                {!scanResult && (
                    <View style={nutritionScannerStyles.tabContainer}>
                        <TouchableOpacity
                            style={[nutritionScannerStyles.tab, activeTab === 'meal' && nutritionScannerStyles.activeTab]}
                            onPress={() => setActiveTab('meal')}
                        >
                            <Camera size={16} color={activeTab === 'meal' ? '#111827' : '#6B7280'} />
                            <Text style={[nutritionScannerStyles.tabText, activeTab === 'meal' && nutritionScannerStyles.activeTabText]}>
                                Scan Makanan
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[nutritionScannerStyles.tab, activeTab === 'label' && nutritionScannerStyles.activeTab]}
                            onPress={() => setActiveTab('label')}
                        >
                            <Info size={16} color={activeTab === 'label' ? '#111827' : '#6B7280'} />
                            <Text style={[nutritionScannerStyles.tabText, activeTab === 'label' && nutritionScannerStyles.activeTabText]}>
                                Scan Label Gizi
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan Content */}
                {!scanResult && !isScanning && (
                    <ScrollView style={nutritionScannerStyles.scanContent} showsVerticalScrollIndicator={false}>
                        {activeTab === 'meal' ? (
                            <View style={nutritionScannerStyles.scanSection}>
                                <View style={nutritionScannerStyles.titleContainer}>
                                    <Zap size={24} color="#10B981" />
                                    <Text style={nutritionScannerStyles.scanTitle}>Scan Makanan</Text>
                                </View>
                                <Text style={nutritionScannerStyles.scanDescription}>
                                    Pindai makanan dengan kamera untuk mendapatkan informasi estimasi gizi termasuk kalori, makronutrisi, dan mikronutrisi
                                </Text>

                                {/* Tips */}
                                <View style={nutritionScannerStyles.tipsContainer}>
                                    <Text style={nutritionScannerStyles.tipsTitle}>Tips untuk pemindaian yang lebih baik:</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Pastikan pencahayaan yang baik</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Pusatkan makanan dalam area</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Jaga kamera tetap stabil</Text>
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
                                        {!imagePreview && (
                                            <View style={nutritionScannerStyles.cameraPlaceholder}>
                                                <Camera size={48} color="#6B7280" />
                                                <Text style={nutritionScannerStyles.cameraText}>Posisikan makanan di area ini</Text>
                                            </View>
                                        )}

                                        {/* Image Preview Section */}
                                        {imagePreview && (
                                            <View style={nutritionScannerStyles.imagePreviewContainer}>
                                                <Text style={nutritionScannerStyles.sectionTitle}>Selected Image</Text>
                                                <View style={nutritionScannerStyles.imageWrapper}>
                                                    <Image
                                                        source={{ uri: imagePreview }}
                                                        style={nutritionScannerStyles.previewImage}
                                                        resizeMode="cover"
                                                    />
                                                    <TouchableOpacity
                                                        style={nutritionScannerStyles.removeImageButton}
                                                        onPress={() => {
                                                            setSelectedImage(null);
                                                            setImagePreview(null);
                                                        }}
                                                    >
                                                        <Text style={nutritionScannerStyles.removeImageText}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Image Picker Button */}
                                        {!selectedImage && (
                                            <>
                                                <TouchableOpacity
                                                    style={[nutritionScannerStyles.scanButton, { backgroundColor: '#3B82F6' }]}
                                                    onPress={handleImagePicker}
                                                >
                                                    <Upload size={20} color="#FFFFFF" />
                                                    <Text style={nutritionScannerStyles.scanButtonText}>Pilih Gambar Makanan</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}                                        {/* Scan Button */}
                                        {selectedImage && (
                                            <TouchableOpacity
                                                style={nutritionScannerStyles.scanButton}
                                                onPress={handleScan}
                                                disabled={isScanning}
                                            >
                                                {isScanning ? (
                                                    <ActivityIndicator size={20} color="#FFFFFF" />
                                                ) : (
                                                    <Zap size={20} color="#FFFFFF" />
                                                )}
                                                <Text style={nutritionScannerStyles.scanButtonText}>
                                                    {isScanning ? 'Analisis...' : 'Foto Makanan'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={nutritionScannerStyles.scanSection}>
                                <View style={nutritionScannerStyles.titleContainer}>
                                    <Info size={24} color="#3B82F6" />
                                    <Text style={nutritionScannerStyles.scanTitle}>Scan Label Gizi</Text>
                                </View>
                                <Text style={nutritionScannerStyles.scanDescription}>
                                    Pindai label fakta gizi pada makanan kemasan untuk mendapatkan informasi gizi yang akurat
                                </Text>

                                {/* Tips */}
                                <View style={nutritionScannerStyles.tipsContainer}>
                                    <Text style={nutritionScannerStyles.tipsTitle}>Tips untuk pemindaian yang lebih baik:</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Pastikan pencahayaan yang baik</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Pusatkan makanan dalam area</Text>
                                    <Text style={nutritionScannerStyles.tipsText}>• Jaga kamera tetap stabil</Text>
                                </View>

                                {/* Camera/Scan Area for Label */}
                                <View style={nutritionScannerStyles.scanArea}>
                                    <View style={nutritionScannerStyles.cameraContainer}>
                                        {/* Show either placeholder nutrition label or selected image */}
                                        {!imagePreview ? (
                                            // Nutrition Label Placeholder
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
                                        ) : (
                                            // Selected Image Preview
                                            <View style={nutritionScannerStyles.imagePreviewContainer}>
                                                <Text style={nutritionScannerStyles.sectionTitle}>Selected Label Image</Text>
                                                <View style={nutritionScannerStyles.imageWrapper}>
                                                    <Image
                                                        source={{ uri: imagePreview }}
                                                        style={nutritionScannerStyles.previewImage}
                                                        resizeMode="cover"
                                                    />
                                                    <TouchableOpacity
                                                        style={nutritionScannerStyles.removeImageButton}
                                                        onPress={() => {
                                                            setSelectedImage(null);
                                                            setImagePreview(null);
                                                        }}
                                                    >
                                                        <Text style={nutritionScannerStyles.removeImageText}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Image Picker Button */}
                                        {!selectedImage && (
                                            <TouchableOpacity
                                                style={[nutritionScannerStyles.scanButton, { backgroundColor: '#3B82F6' }]}
                                                onPress={handleImagePicker}
                                            >
                                                <Upload size={20} color="#FFFFFF" />
                                                <Text style={nutritionScannerStyles.scanButtonText}>Pilih Gambar Label</Text>
                                            </TouchableOpacity>
                                        )}

                                        {/* Scan Button */}
                                        {selectedImage && (
                                            <TouchableOpacity
                                                style={nutritionScannerStyles.scanButton}
                                                onPress={handleScan}
                                                disabled={isScanning}
                                            >
                                                {isScanning ? (
                                                    <ActivityIndicator size={20} color="#FFFFFF" />
                                                ) : (
                                                    <Info size={20} color="#FFFFFF" />
                                                )}
                                                <Text style={nutritionScannerStyles.scanButtonText}>
                                                    {isScanning ? 'Analisis...' : 'Label Gizi'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
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
                            <Text style={nutritionScannerStyles.scanningTitle}>Proses Gambar</Text>
                            <Text style={nutritionScannerStyles.scanningDescription}>
                                NutriAdvisor AI sedang menganalisis gambar dan menghitung fakta nutrisi
                            </Text>
                            <View style={nutritionScannerStyles.progressBar}>
                                <View style={nutritionScannerStyles.progressBarFill} />
                            </View>
                        </View>
                    </View>
                )}

                {/* Error State */}
                {scanError && (
                    <View style={nutritionScannerStyles.scanningContainer}>
                        <View style={nutritionScannerStyles.scanningContent}>
                            <AlertCircle size={48} color="#EF4444" />
                            <Text style={[nutritionScannerStyles.scanningTitle, { color: '#EF4444' }]}>
                                Scan Failed
                            </Text>
                            <Text style={nutritionScannerStyles.scanningDescription}>
                                {scanError}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                                <TouchableOpacity
                                    style={[nutritionScannerStyles.scanButton, { backgroundColor: '#EF4444', flex: 1 }]}
                                    onPress={handleRetry}
                                >
                                    <Text style={nutritionScannerStyles.scanButtonText}>Try Again</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[nutritionScannerStyles.scanButton, { backgroundColor: '#6B7280', flex: 1 }]}
                                    onPress={handleReset}
                                >
                                    <Text style={nutritionScannerStyles.scanButtonText}>Select New Image</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {scanResult && (
                    <ScrollView style={nutritionScannerStyles.resultsContainer} showsVerticalScrollIndicator={false}>
                        <View style={nutritionScannerStyles.resultsHeader}>
                            <CheckCircle size={24} color="#10B981" />
                            <Text style={nutritionScannerStyles.resultsTitle}>Scan Berhasil!</Text>
                        </View>

                        {/* Confidence Score */}
                        <View style={nutritionScannerStyles.confidenceCard}>
                            <Text style={nutritionScannerStyles.confidenceLabel}>Analisis Akurasi</Text>
                            <View style={nutritionScannerStyles.confidenceBar}>
                                <View
                                    style={[
                                        nutritionScannerStyles.confidenceBarFill,
                                        { width: `${Math.round((scanResult.confidence_score || 0.85) * 100)}%` }
                                    ]}
                                />
                            </View>
                            <Text style={nutritionScannerStyles.confidenceText}>
                                {Math.round((scanResult.confidence_score || 0.85) * 100)}% confidence
                            </Text>
                        </View>

                        {/* Quick Summary */}
                        <View style={nutritionScannerStyles.summaryCard}>
                            <Text style={nutritionScannerStyles.summaryTitle}>Informasi Gizi</Text>
                            <View style={nutritionScannerStyles.summaryRow}>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Kalori</Text>
                                    <Text style={nutritionScannerStyles.summaryValue}>
                                        {scanResult["estimasi_total_kalori_(kcal)"]}
                                    </Text>
                                </View>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Grade</Text>
                                    <View style={nutritionScannerStyles.gradeBadgeSmall}>
                                        <Text style={nutritionScannerStyles.gradeTextSmall}>
                                            {scanResult.nutri_grade}
                                        </Text>
                                    </View>
                                </View>
                                <View style={nutritionScannerStyles.summaryItem}>
                                    <Text style={nutritionScannerStyles.summaryLabel}>Status</Text>
                                    <Text style={nutritionScannerStyles.summaryValueSmall}>
                                        {scanResult.nutri_status}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Nama Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Nama Makanan</Text>
                            <Text style={nutritionScannerStyles.sectionValue}>
                                {scanResult.nama_makanan}
                            </Text>
                        </View>

                        {/* Foto Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Foto Makanan</Text>
                            <Text style={nutritionScannerStyles.sectionValue}>
                                {scanResult.foto_makanan}
                            </Text>
                            {imagePreview ? (
                                <View style={nutritionScannerStyles.scannedImageContainer}>
                                    <Text style={nutritionScannerStyles.imageLabel}>Gambar yang Dipindai:</Text>
                                    <Image
                                        source={{ uri: imagePreview }}
                                        style={nutritionScannerStyles.scannedImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : (
                                <View style={nutritionScannerStyles.photoPlaceholder}>
                                    <Camera size={32} color="#9CA3AF" />
                                    <Text style={nutritionScannerStyles.photoPlaceholderText}>No image available</Text>
                                </View>
                            )}
                        </View>

                        {/* Estimasi Komposisi Makanan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Estimasi Komposisi Makanan</Text>
                            {Object.entries(scanResult.estimasi_komposisi_makanan).map(([key, value], index) => (
                                <Text key={index} style={nutritionScannerStyles.compositionText}>
                                    {key.replace('_(g)', '')}: {value} gram
                                </Text>
                            ))}
                        </View>

                        {/* Kandungan Makronutrisi */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Makronutrisi</Text>
                            <Text style={nutritionScannerStyles.nutrientText}>
                                Karbohidrat ({scanResult.estimasi_kandungan_makronutrisi["karbohidrat_(g)"]} gram)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientText}>
                                Protein ({scanResult.estimasi_kandungan_makronutrisi["protein_(g)"]} gram)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientText}>
                                Lemak ({scanResult.estimasi_kandungan_makronutrisi["lemak_(g)"]} gram)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientText}>
                                Serat ({scanResult.estimasi_kandungan_makronutrisi["serat_(g)"]} gram)
                            </Text>
                        </View>

                        {/* Kandungan Mikronutrisi */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Mikronutrisi</Text>

                            <Text style={nutritionScannerStyles.microSectionTitle}>Vitamin</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin A ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_a_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin B Kompleks ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_b_kompleks_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin C ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_c_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin D ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_d_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin E ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_e_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Vitamin K ({scanResult.estimasi_kandungan_mikronutrisi["vitamin_(mg)"]["vitamin_k_(mg)"]} mg)
                            </Text>

                            <Text style={[nutritionScannerStyles.microSectionTitle, { marginTop: 16 }]}>Mineral</Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Kalsium ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["kalsium_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Zat Besi ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["zat_besi_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Magnesium ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["magnesium_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Kalium ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["kalium_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Natrium ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["natrium_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Zinc ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["zinc_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.microNutrientName}>
                                Yodium ({scanResult.estimasi_kandungan_mikronutrisi["mineral_(mg)"]["yodium_(mg)"]} mg)
                            </Text>
                        </View>

                        {/* Kandungan Tambahan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.sectionTitle}>Kandungan Tambahan</Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Gula ({scanResult.estimasi_kandungan_tambahan["gula_(g)"]} g)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Garam ({scanResult.estimasi_kandungan_tambahan["garam_(g)"]} g)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Lemak Jenuh ({scanResult.estimasi_kandungan_tambahan["lemak_jenuh_(g)"]} g)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Lemak Trans ({scanResult.estimasi_kandungan_tambahan["lemak_trans_(g)"]} g)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Kafein ({scanResult.estimasi_kandungan_tambahan["kafein_(mg)"]} mg)
                            </Text>
                            <Text style={nutritionScannerStyles.nutrientName}>
                                Kolesterol ({scanResult.estimasi_kandungan_tambahan["kolesterol_(mg)"]} mg)
                            </Text>
                        </View>

                        {/* Total Kalori, Nutri Grade, Nutri Status, dan Keterangan */}
                        <View style={nutritionScannerStyles.card}>
                            <Text style={nutritionScannerStyles.totalCaloriesText}>
                                Total Kalori: {scanResult["estimasi_total_kalori_(kcal)"]} kcal
                            </Text>

                            <Text style={nutritionScannerStyles.gradeTextSimple}>
                                Nutri Grade: {scanResult.nutri_grade}
                            </Text>

                            <Text style={nutritionScannerStyles.statusText}>
                                Nutri Status: {scanResult.nutri_status}
                            </Text>

                            <Text style={nutritionScannerStyles.descriptionLabel}>Keterangan:</Text>
                            <Text style={nutritionScannerStyles.descriptionText}>
                                {scanResult.keterangan}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={nutritionScannerStyles.actionButtons}>
                            <TouchableOpacity style={nutritionScannerStyles.saveButton} onPress={handleSaveFood}>
                                <Save size={20} color="#FFFFFF" />
                                <Text style={nutritionScannerStyles.saveButtonText}>Simpan Makanan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={nutritionScannerStyles.cancelButton} onPress={onClose}>
                                <Text style={nutritionScannerStyles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={nutritionScannerStyles.bottomSpacing} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
}

