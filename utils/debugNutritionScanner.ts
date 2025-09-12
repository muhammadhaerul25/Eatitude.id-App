/**
 * Debug utility for nutrition label scanner
 * This helps identify exactly what's being sent to the API
 */

export const debugAPIRequest = (requestData: any, endpoint: string, headers: any) => {
    console.log('🔍 === NUTRITION SCANNER DEBUG ===');
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('🌐 Endpoint:', endpoint);
    console.log('📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('📦 Request Data Keys:', Object.keys(requestData));
    console.log('📊 Request Data Size:', JSON.stringify(requestData).length, 'bytes');

    if (requestData.file) {
        console.log('🖼️ Image Data Analysis:');
        console.log('  - Base64 length:', requestData.file.length);
        console.log('  - Estimated size after decode:', Math.round(requestData.file.length * 0.75), 'bytes');
        console.log('  - First 100 chars:', requestData.file.substring(0, 100));
        console.log('  - Last 50 chars:', requestData.file.substring(requestData.file.length - 50));

        // Check for common image format indicators in base64
        const testDecode = requestData.file.substring(0, 20);
        try {
            const decoded = atob(testDecode);
            const bytes = Array.from(decoded, c => c.charCodeAt(0));
            console.log('  - First bytes (hex):', bytes.map(b => b.toString(16).padStart(2, '0')).join(' '));

            // Check for JPEG magic number (FF D8 FF)
            if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                console.log('  - ✅ JPEG magic number detected');
            } else {
                console.log('  - ⚠️ JPEG magic number NOT detected, bytes:', bytes.slice(0, 3));
            }
        } catch (e) {
            console.log('  - ❌ Cannot decode base64 start:', e);
        }
    }

    console.log('🔍 === END DEBUG ===');
};

/**
 * Test if we can create a valid JPEG file and convert it to base64
 */
export const testJPEGCreation = async (): Promise<{ success: boolean; base64?: string; error?: string }> => {
    try {
        // Create a simple test JPEG using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Cannot get canvas context');
        }

        // Draw a simple test pattern
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#000000';
        ctx.fillText('NUTRITION TEST', 10, 50);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            }, 'image/jpeg', 0.9);
        });

        // Convert to File
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

        // Convert to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = () => reject(new Error('FileReader failed'));
            reader.readAsDataURL(file);
        });

        console.log('✅ Test JPEG creation successful');
        console.log('📊 Test image base64 length:', base64.length);

        return { success: true, base64 };

    } catch (error) {
        console.error('❌ Test JPEG creation failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export default { debugAPIRequest, testJPEGCreation };
