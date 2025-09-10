/**
 * Example React Component: Personal Plan Generator
 * 
 * This component demonstrates how to use the Personal Plan API integration
 * in a React Native component with proper TypeScript types and error handling.
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    createUserData,
    generatePersonalPlan,
    generatePersonalPlanWithRetry,
    PersonalPlanAPIError,
    type PersonalPlan,
    type UserData,
} from '../services/personalPlanAPI';

interface PersonalPlanGeneratorProps {
    userData: UserData;
    onPlanGenerated?: (plan: PersonalPlan) => void;
    onError?: (error: PersonalPlanAPIError) => void;
}

export const PersonalPlanGenerator: React.FC<PersonalPlanGeneratorProps> = ({
    userData,
    onPlanGenerated,
    onError,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<PersonalPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handle personal plan generation with basic error handling
     */
    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Generate personal plan using the API
            const plan = await generatePersonalPlan(userData);

            // Update local state
            setGeneratedPlan(plan);

            // Call optional callback
            onPlanGenerated?.(plan);

            // Show success message
            Alert.alert(
                'Success!',
                'Your personal nutrition plan has been generated successfully.',
                [{ text: 'OK' }]
            );

        } catch (err) {
            const apiError = err as PersonalPlanAPIError;
            const errorMessage = apiError.message || 'Failed to generate personal plan';

            setError(errorMessage);
            onError?.(apiError);

            // Show user-friendly error message
            Alert.alert(
                'Error',
                errorMessage,
                [{ text: 'OK' }]
            );

        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle personal plan generation with retry logic
     */
    const handleGeneratePlanWithRetry = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Generate personal plan with automatic retry
            const plan = await generatePersonalPlanWithRetry(userData, 3, 2000);

            setGeneratedPlan(plan);
            onPlanGenerated?.(plan);

            Alert.alert(
                'Success!',
                'Your personal nutrition plan has been generated successfully.',
                [{ text: 'OK' }]
            );

        } catch (err) {
            const apiError = err as PersonalPlanAPIError;
            let userMessage = 'Failed to generate personal plan';

            // Provide specific messages based on error type
            switch (apiError.code) {
                case 'VALIDATION_ERROR':
                    userMessage = 'Please check your input data and try again.';
                    break;
                case 'NETWORK_ERROR':
                    userMessage = 'Network connection issue. Please check your internet connection.';
                    break;
                case 'TIMEOUT_ERROR':
                    userMessage = 'The server is taking too long to respond. Please try again.';
                    break;
                case 'SERVER_ERROR':
                    userMessage = 'Server error occurred. Please try again later.';
                    break;
                default:
                    userMessage = apiError.message;
            }

            setError(userMessage);
            onError?.(apiError);

            Alert.alert('Error', userMessage, [{ text: 'OK' }]);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personal Plan Generator</Text>

            {/* User Info Summary */}
            <View style={styles.userInfo}>
                <Text style={styles.userInfoTitle}>User Information:</Text>
                <Text style={styles.userInfoText}>Name: {userData.nama}</Text>
                <Text style={styles.userInfoText}>Age: {userData.usia} years</Text>
                <Text style={styles.userInfoText}>Gender: {userData.jenis_kelamin}</Text>
                <Text style={styles.userInfoText}>Goal: {userData.tujuan}</Text>
            </View>

            {/* Generate Plan Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleGeneratePlan}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Generate Plan</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary, isLoading && styles.buttonDisabled]}
                    onPress={handleGeneratePlanWithRetry}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                            Generate with Retry
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Error Display */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Plan Display */}
            {generatedPlan && (
                <View style={styles.planContainer}>
                    <Text style={styles.planTitle}>Generated Plan:</Text>
                    <Text style={styles.planText}>
                        {generatedPlan.catatan || 'Personal nutrition plan generated successfully!'}
                    </Text>
                    {/* Add more plan details as needed */}
                </View>
            )}
        </View>
    );
};

/**
 * Example usage in a parent component
 */
export const ExampleUsage: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);

    // Example of creating user data
    const handleCreateUserData = () => {
        const exampleUserData = createUserData({
            nama: 'John Doe',
            usia: 25,
            jenis_kelamin: 'Laki-laki',
            berat_badan: 70,
            tinggi_badan: 175,
            tingkat_aktivitas: 'Sedang',
            waktu_bangun: '06:00',
            waktu_tidur: '22:00',
            tujuan: 'Menurunkan berat badan',
            preferensi_makanan: 'Vegetarian',
            alergi_makanan: null,
            kondisi_kesehatan: null,
        });

        setUserData(exampleUserData);
    };

    const handlePlanGenerated = (plan: PersonalPlan) => {
        console.log('✅ Plan generated successfully:', plan);
        // Handle the generated plan (save to storage, navigate, etc.)
    };

    const handleError = (error: PersonalPlanAPIError) => {
        console.error('❌ Plan generation failed:', error);
        // Handle the error (show retry option, log analytics, etc.)
    };

    if (!userData) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={handleCreateUserData}>
                    <Text style={styles.buttonText}>Create Example User Data</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <PersonalPlanGenerator
            userData={userData}
            onPlanGenerated={handlePlanGenerated}
            onError={handleError}
        />
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
    userInfo: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    userInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    userInfoText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
    },
    buttonContainer: {
        gap: 15,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#007AFF',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    errorText: {
        color: '#C62828',
        fontSize: 14,
    },
    planContainer: {
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    planTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2E7D32',
    },
    planText: {
        color: '#388E3C',
        fontSize: 14,
    },
});
