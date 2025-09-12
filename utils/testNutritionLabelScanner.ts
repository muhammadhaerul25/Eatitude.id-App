/**
 * Test script for nutrition label scanner debugging
 * Run this to test the API and image processing
 */

import { scanNutritionLabel } from '../services/nutritionLabelScannerAPI';

export const testNutritionLabelScanner = async () => {
    console.log('🧪 Testing Nutrition Label Scanner...');

    try {
        // Create a minimal test image file
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Draw a simple test pattern
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = '#000000';
            ctx.fillText('TEST LABEL', 10, 50);
        }

        // Convert to blob and then to File
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, 'image/jpeg', 0.9);
        });

        const testFile = new File([blob], 'test-label.jpg', { type: 'image/jpeg' });

        console.log('📤 Created test file:', {
            name: testFile.name,
            type: testFile.type,
            size: `${(testFile.size / 1024).toFixed(2)}KB`
        });

        // Test the scanner
        console.log('📤 Testing nutrition label scanner...');
        const result = await scanNutritionLabel(testFile);

        if (result.success && result.data) {
            console.log('✅ Nutrition label scanner test successful!');
            console.log('📊 Response data keys:', Object.keys(result.data));
            return { success: true, result };
        } else {
            console.log('❌ Nutrition label scanner test failed:', result.error);
            return { success: false, error: result.error };
        }

    } catch (error) {
        console.error('🚨 Test error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown test error' };
    }
};

// Export for use in components
export default testNutritionLabelScanner;
