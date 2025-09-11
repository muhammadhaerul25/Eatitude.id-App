import { useState } from 'react';
import { Alert } from 'react-native';
import { apiService, NutritionEstimation } from '../services/api';
import { formatNutritionData } from '../services/dataMapper';

export interface ScanResult {
    type: 'meal' | 'label';
    data: NutritionEstimation | any;
    formatted: string;
}

export const useNutritionScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [showResults, setShowResults] = useState(false);

    const scanImage = async (imageUri: string, type: 'meal' | 'label') => {
        setIsScanning(true);
        try {
            // Convert image URI to File object for API
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

            let result;
            if (type === 'meal') {
                result = await apiService.scanFoodImage(file);
            } else {
                result = await apiService.scanNutritionLabel(file);
            }

            const formatted = type === 'meal'
                ? formatNutritionData((result as any).informasi_nutrisi)
                : formatNutritionData(result);

            const scanResult: ScanResult = {
                type,
                data: result,
                formatted
            };

            setScanResult(scanResult);
            setShowResults(true);
        } catch (error) {
            console.error('Scan error:', error);
            Alert.alert('Error', 'Gagal memindai gambar. Silakan coba lagi.');
        } finally {
            setIsScanning(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setShowResults(false);
        setIsScanning(false);
    };

    const saveFood = async () => {
        if (!scanResult) return;

        try {
            // Save to local storage or send to backend
            // For now, just show success message
            Alert.alert('Berhasil', 'Data makanan telah disimpan!');
            return true;
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Gagal menyimpan data makanan.');
            return false;
        }
    };

    return {
        isScanning,
        scanResult,
        showResults,
        scanImage,
        resetScanner,
        saveFood,
    };
};
