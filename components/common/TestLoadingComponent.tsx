/**
 * Test Loading Component
 * 
 * Simple component to test that the loading animation works properly
 * even when the main thread is busy.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoadingOverlay } from './LoadingOverlay';

export const TestLoadingComponent: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const simulateHeavyWork = async () => {
        setIsLoading(true);

        // Simulate a heavy synchronous operation that might block the UI
        const startTime = Date.now();

        // Heavy computation that takes time
        let result = 0;
        for (let i = 0; i < 1000000000; i++) {
            result += Math.random();
        }

        // Also simulate an async operation like an API call
        await new Promise(resolve => setTimeout(resolve, 5000));

        const endTime = Date.now();
        console.log(`Heavy work completed in ${endTime - startTime}ms. Result: ${result}`);

        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay
                visible={isLoading}
                title="Testing Animation"
                subtitle="Running heavy operations to test if animation continues..."
            />

            <Text style={styles.title}>Loading Animation Test</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={simulateHeavyWork}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Testing...' : 'Start Heavy Work Test'}
                </Text>
            </TouchableOpacity>

            <Text style={styles.description}>
                This test runs heavy computations and async operations.
                The loading spinner should continue rotating smoothly.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        maxWidth: 300,
    },
});

export default TestLoadingComponent;
