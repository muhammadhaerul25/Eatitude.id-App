import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dataDebugger } from '../../utils/dataDebugger';
import { mealPlanTester } from '../../utils/testMealPlanAPI';

export default function APITestScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);

    const runQuickTest = async () => {
        setIsLoading(true);
        try {
            await dataDebugger.runCompleteCheck();
            Alert.alert('Success', 'Quick cache test completed successfully! Check console for details.');
        } catch (error) {
            Alert.alert('Error', `Quick test failed: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const runComprehensiveTests = async () => {
        setIsLoading(true);
        try {
            const results = await mealPlanTester.runAllTests();
            setTestResults({ allPassed: results, message: 'Individual meal planning tests completed' });

            Alert.alert(
                results ? 'Success' : 'Some Tests Failed',
                results
                    ? 'All individual meal tests passed!'
                    : 'Some tests failed. Check the console for details.'
            );
        } catch (error) {
            Alert.alert('Error', `Comprehensive tests failed: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const showDataStructures = () => {
        dataDebugger.showCacheContents();
        Alert.alert('Cache Contents', 'Cache contents logged to console. Check your development console.');
    };

    const renderTestResult = (testName: string, result: boolean | { success: boolean; error?: string }) => {
        const isSuccess = typeof result === 'boolean' ? result : result.success;
        const error = typeof result === 'object' ? result.error : null;

        return (
            <View style={styles.testResult}>
                <Text style={styles.testName}>{testName}</Text>
                <Text style={[styles.testStatus, { color: isSuccess ? '#4CAF50' : '#F44336' }]}>
                    {isSuccess ? '✅ PASS' : '❌ FAIL'}
                </Text>
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>API Integration Test</Text>
            <Text style={styles.subtitle}>
                Use this screen to test all API integrations and data flows
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={runQuickTest}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Running...' : 'Quick Test'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={runComprehensiveTests}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Running...' : 'Comprehensive Tests'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.infoButton]}
                    onPress={showDataStructures}
                >
                    <Text style={styles.buttonText}>Show Data Structures</Text>
                </TouchableOpacity>
            </View>

            {testResults && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Test Results:</Text>
                    {renderTestResult('API Connection', testResults.connectionTest)}
                    {renderTestResult('Personal Plan Generation', testResults.personalPlanTest)}
                    {renderTestResult('Meal Plan Generation', testResults.mealPlanTest)}
                    {renderTestResult('Cache Operations', testResults.cacheTest)}
                    {renderTestResult('Data Integration', testResults.integrationTest)}
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Test Information:</Text>
                <Text style={styles.infoText}>
                    • Quick Test: Basic connection and initialization
                </Text>
                <Text style={styles.infoText}>
                    • Comprehensive Tests: All API endpoints and data flows
                </Text>
                <Text style={styles.infoText}>
                    • Data Structures: Shows expected API data formats
                </Text>
                <Text style={styles.infoText}>
                    • Check console output for detailed logs
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: '#2196F3',
    },
    secondaryButton: {
        backgroundColor: '#4CAF50',
    },
    infoButton: {
        backgroundColor: '#FF9800',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    testResult: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    testName: {
        flex: 1,
        fontSize: 14,
    },
    testStatus: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 4,
        flex: 1,
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
});
