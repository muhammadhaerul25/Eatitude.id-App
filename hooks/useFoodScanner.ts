/**
 * React Hook for Food Scanning
 * 
 * This custom hook provides an easy-to-use interface for food and nutrition label scanning
 * in React components. It handles loading states, errors, and provides retry functionality.
 */

import { useCallback, useState } from 'react';
import {
    FoodScannerResult,
    formatNutritionEstimation,
    NutritionEstimation,
    scanFoodNutrition,
} from '../services/foodScannerAPI';
import {
    NutritionLabelEstimation,
    NutritionLabelScannerResult,
    scanNutritionLabel,
} from '../services/nutritionLabelScannerAPI';

export type ScanType = 'meal' | 'label';
export type ScanResult = NutritionEstimation | NutritionLabelEstimation;

interface UseFoodScannerState {
    isScanning: boolean;
    scanResult: ScanResult | null;
    scanError: string | null;
    confidence: number | null;
    scanType: ScanType | null;
}

interface UseFoodScannerReturn extends UseFoodScannerState {
    scanFood: (imageFile: File, type: ScanType) => Promise<void>;
    clearResult: () => void;
    clearError: () => void;
    retry: () => Promise<void>;
}

/**
 * Custom hook for food scanning functionality
 * 
 * @returns Object with state and functions for food scanning
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     scanFood, 
 *     isScanning, 
 *     scanResult, 
 *     scanError,
 *     confidence
 *   } = useFoodScanner();
 * 
 *   const handleScan = async (file: File) => {
 *     await scanFood(file, 'meal');
 *   };
 * 
 *   return (
 *     <div>
 *       {isScanning && <p>Scanning...</p>}
 *       {scanError && <p>Error: {scanError}</p>}
 *       {scanResult && <p>Food: {scanResult.nama_makanan}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useFoodScanner = (): UseFoodScannerReturn => {
    const [state, setState] = useState<UseFoodScannerState>({
        isScanning: false,
        scanResult: null,
        scanError: null,
        confidence: null,
        scanType: null,
    });

    // Store last scan parameters for retry functionality
    const [lastScanParams, setLastScanParams] = useState<{
        file: File;
        type: ScanType;
    } | null>(null);

    /**
     * Scan food image or nutrition label
     * 
     * @param imageFile - Image file to scan
     * @param type - Type of scan: 'meal' for food, 'label' for nutrition label
     */
    const scanFood = useCallback(async (imageFile: File, type: ScanType): Promise<void> => {
        setState(prev => ({
            ...prev,
            isScanning: true,
            scanError: null,
            scanResult: null,
            confidence: null,
            scanType: type,
        }));

        // Store parameters for retry
        setLastScanParams({ file: imageFile, type });

        try {
            let result: FoodScannerResult | NutritionLabelScannerResult;

            if (type === 'meal') {
                console.log('🍽️ Scanning food meal...');
                result = await scanFoodNutrition(imageFile);
            } else {
                console.log('🏷️ Scanning nutrition label...');
                result = await scanNutritionLabel(imageFile);
            }

            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    isScanning: false,
                    scanResult: result.data!,
                    confidence: result.confidence || null,
                }));
                console.log('✅ Scan completed successfully');
            } else {
                setState(prev => ({
                    ...prev,
                    isScanning: false,
                    scanError: result.error || 'Unknown error occurred during scanning',
                }));
                console.error('❌ Scan failed:', result.error);
            }

        } catch (error) {
            let errorMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                // Handle specific error types with user-friendly messages
                if (error.message.includes('Image format not supported') ||
                    error.message.includes('unsupported') ||
                    error.message.includes('UnsupportedImageFormat')) {
                    errorMessage = 'Image format not supported. Please try taking a new photo or selecting a different image.';
                } else if (error.message.includes('InvalidParameter')) {
                    errorMessage = 'Image quality issue. Please try a clearer, better-lit photo of the nutrition label.';
                } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Request timed out. Please try again with a smaller or clearer image.';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Image processing failed. Please try a different image or take a new photo.';
                } else {
                    errorMessage = error.message;
                }
            }

            setState(prev => ({
                ...prev,
                isScanning: false,
                scanError: errorMessage,
            }));
            console.error('❌ Scan error:', error);
        }
    }, []);

    /**
     * Clear scan result and reset state
     */
    const clearResult = useCallback(() => {
        setState(prev => ({
            ...prev,
            scanResult: null,
            scanError: null,
            confidence: null,
            scanType: null,
        }));
        setLastScanParams(null);
    }, []);

    /**
     * Clear only the error state
     */
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            scanError: null,
        }));
    }, []);

    /**
     * Retry the last scan operation
     */
    const retry = useCallback(async (): Promise<void> => {
        if (lastScanParams) {
            await scanFood(lastScanParams.file, lastScanParams.type);
        }
    }, [lastScanParams, scanFood]);

    return {
        ...state,
        scanFood,
        clearResult,
        clearError,
        retry,
    };
};

/**
 * Helper function to get formatted nutrition data for display
 * 
 * @param scanResult - Raw scan result
 * @returns Formatted nutrition data
 */
export const useFormattedNutrition = (scanResult: ScanResult | null) => {
    if (!scanResult) return null;

    return formatNutritionEstimation(scanResult as NutritionEstimation);
};

export default useFoodScanner;
