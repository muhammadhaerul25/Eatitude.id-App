/**
 * Network Connectivity Test Utility
 * This helps debug Android network issues
 */

export interface ConnectivityTestResult {
    success: boolean;
    endpoint: string;
    method: string;
    status?: number;
    statusText?: string;
    error?: string;
    timing: number;
}

/**
 * Test basic connectivity to various endpoints
 */
export async function testConnectivity(): Promise<ConnectivityTestResult[]> {
    const tests = [
        { endpoint: 'https://google.com', method: 'GET' },
        { endpoint: 'https://eatitude-id-api.vercel.app', method: 'GET' },
        { endpoint: 'https://eatitude-id-api.vercel.app/docs', method: 'GET' },
        { endpoint: 'https://eatitude-id-api.vercel.app/generate_personal_plan', method: 'OPTIONS' },
        { endpoint: 'https://eatitude-id-api.vercel.app/generate_food_nutrition_estimation', method: 'OPTIONS' },
    ];

    const results: ConnectivityTestResult[] = [];

    for (const test of tests) {
        const startTime = Date.now();
        try {
            console.log(`🧪 Testing ${test.method} ${test.endpoint}...`);

            // Use Promise.race for timeout instead of AbortSignal.timeout
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Test timeout')), 10000)
            );

            const response = await Promise.race([
                fetch(test.endpoint, {
                    method: test.method,
                    headers: {
                        'Accept': 'text/html,application/json',
                    },
                }),
                timeoutPromise
            ]); const timing = Date.now() - startTime;
            console.log(`✅ ${test.endpoint}: ${response.status} ${response.statusText} (${timing}ms)`);

            results.push({
                success: true,
                endpoint: test.endpoint,
                method: test.method,
                status: response.status,
                statusText: response.statusText,
                timing,
            });
        } catch (error) {
            const timing = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ ${test.endpoint}: ${errorMessage} (${timing}ms)`);

            results.push({
                success: false,
                endpoint: test.endpoint,
                method: test.method,
                error: errorMessage,
                timing,
            });
        }
    }

    return results;
}

/**
 * Test if the issue is specific to FormData uploads
 */
export async function testFormDataUpload(): Promise<ConnectivityTestResult> {
    const startTime = Date.now();
    try {
        console.log('🧪 Testing FormData upload to food scanner endpoint...');

        // Create a minimal test FormData
        const formData = new FormData();
        const testFile = new Blob(['test'], { type: 'text/plain' });
        formData.append('file', testFile, 'test.txt');

        // Use Promise.race for timeout instead of AbortSignal.timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('FormData upload timeout')), 30000)
        );

        const response = await Promise.race([
            fetch('https://eatitude-id-api.vercel.app/generate_food_nutrition_estimation', {
                method: 'POST',
                body: formData,
            }),
            timeoutPromise
        ]);

        const timing = Date.now() - startTime;
        console.log(`✅ FormData upload test: ${response.status} ${response.statusText} (${timing}ms)`);

        return {
            success: true,
            endpoint: 'https://eatitude-id-api.vercel.app/generate_food_nutrition_estimation',
            method: 'POST (FormData)',
            status: response.status,
            statusText: response.statusText,
            timing,
        };
    } catch (error) {
        const timing = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ FormData upload test: ${errorMessage} (${timing}ms)`);

        return {
            success: false,
            endpoint: 'https://eatitude-id-api.vercel.app/generate_food_nutrition_estimation',
            method: 'POST (FormData)',
            error: errorMessage,
            timing,
        };
    }
}

export default {
    testConnectivity,
    testFormDataUpload,
};
