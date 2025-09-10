/**
 * API Debug Component
 * 
 * This component helps debug API connectivity and request/response issues.
 * Use this to test the API connection and see detailed error information.
 */

import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { apiService } from '../services/api';
import { createUserData, generatePersonalPlan } from '../services/personalPlanAPI';

export const APIDebugComponent: React.FC = () => {
    const [debugLog, setDebugLog] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addToLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(message);
    };

    const clearLog = () => {
        setDebugLog([]);
    };

    const testConnection = async () => {
        setIsLoading(true);
        addToLog('🔗 Testing API connection...');

        try {
            const isConnected = await apiService.testConnection();
            addToLog(`📡 Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
        } catch (error) {
            addToLog(`❌ Connection test error: ${error}`);
        }

        setIsLoading(false);
    };

    const testHealthCheck = async () => {
        setIsLoading(true);
        addToLog('🏥 Testing API health check...');

        try {
            const health = await apiService.checkHealth();
            addToLog(`✅ Health check success: ${JSON.stringify(health)}`);
        } catch (error) {
            addToLog(`❌ Health check failed: ${error}`);
        }

        setIsLoading(false);
    };

    const testPersonalPlanAPI = async () => {
        setIsLoading(true);
        addToLog('🧪 Testing Personal Plan API...');

        try {
            // Create test user data
            const testUserData = createUserData({
                nama: 'Test User',
                usia: 25,
                jenis_kelamin: 'Laki-laki',
                berat_badan: 70,
                tinggi_badan: 175,
                tingkat_aktivitas: 'sedang',
                waktu_bangun: '06:00',
                waktu_tidur: '22:00',
                tujuan: 'meningkatkan_kesehatan',
            });

            addToLog(`📋 Test user data: ${JSON.stringify(testUserData, null, 2)}`);

            const plan = await generatePersonalPlan(testUserData);
            addToLog(`✅ Personal plan generated successfully!`);
            addToLog(`📊 Plan result: ${JSON.stringify(plan, null, 2)}`);

        } catch (error) {
            addToLog(`❌ Personal plan generation failed: ${error}`);

            // Additional error details
            if (error instanceof Error) {
                addToLog(`❌ Error name: ${error.name}`);
                addToLog(`❌ Error message: ${error.message}`);
                addToLog(`❌ Error stack: ${error.stack}`);
            }
        }

        setIsLoading(false);
    };

    const testRawAPICall = async () => {
        setIsLoading(true);
        addToLog('🔧 Testing raw API call...');

        try {
            const testData = {
                user_data: {
                    nama: 'Raw Test User',
                    usia: 30,
                    jenis_kelamin: 'Laki-laki',
                    berat_badan: 75,
                    tinggi_badan: 180,
                    tingkat_aktivitas: 'sedang',
                    catatan_aktivitas: '',
                    waktu_bangun: '07:00',
                    waktu_tidur: '23:00',
                    preferensi_makanan: '',
                    alergi_makanan: '',
                    kondisi_kesehatan: '',
                    tujuan: 'meningkatkan_kesehatan',
                }
            };

            addToLog(`📋 Raw request data: ${JSON.stringify(testData, null, 2)}`);

            const response = await fetch('http://localhost:8000/generate_personal_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            addToLog(`📡 Raw response status: ${response.status}`);
            addToLog(`📡 Raw response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

            if (!response.ok) {
                const errorText = await response.text();
                addToLog(`❌ Raw response error text: ${errorText}`);

                try {
                    const errorJson = JSON.parse(errorText);
                    addToLog(`❌ Raw response error JSON: ${JSON.stringify(errorJson, null, 2)}`);
                } catch (parseError) {
                    addToLog(`❌ Could not parse error as JSON: ${parseError}`);
                }
            } else {
                const successData = await response.json();
                addToLog(`✅ Raw response success: ${JSON.stringify(successData, null, 2)}`);
            }

        } catch (error) {
            addToLog(`❌ Raw API call failed: ${error}`);
        }

        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>API Debug Tools</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={testConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={testHealthCheck}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test Health</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={testPersonalPlanAPI}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test Personal Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={testRawAPICall}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Test Raw API</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={clearLog}
                >
                    <Text style={[styles.buttonText, styles.clearButtonText]}>Clear Log</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.logTitle}>Debug Log:</Text>
            <ScrollView style={styles.logContainer}>
                {debugLog.map((entry, index) => (
                    <Text key={index} style={styles.logEntry}>
                        {entry}
                    </Text>
                ))}
                {debugLog.length === 0 && (
                    <Text style={styles.emptyLog}>No debug entries yet. Run a test to see logs.</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333333',
    },
    buttonContainer: {
        gap: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    clearButtonText: {
        color: '#FFFFFF',
    },
    logTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    logContainer: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 8,
    },
    logEntry: {
        color: '#00FF00',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    emptyLog: {
        color: '#666666',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
});
