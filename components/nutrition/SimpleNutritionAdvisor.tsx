/**
 * Simple Nutrition Advisor Integration Example
 * 
 * This component shows how to add nutrition advisor functionality
 * to an existing chat interface with minimal changes.
 */

import { Bot, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNutritionAdvisor } from '../../hooks/useNutritionAdvisor';
import { MealPlan, PersonalPlan, UserData, UserProgress } from '../../services/nutritionAdvisorAPI';

interface NutritionAdvisorButtonProps {
    userData: UserData;
    personalPlan: PersonalPlan;
    mealPlan: MealPlan;
    userProgress?: UserProgress;
    onAdviceReceived: (advice: string) => void;
    style?: any;
}

/**
 * A simple button component that generates nutrition advice
 * Can be easily integrated into existing chat interfaces
 */
export function NutritionAdvisorButton({
    userData,
    personalPlan,
    mealPlan,
    userProgress,
    onAdviceReceived,
    style
}: NutritionAdvisorButtonProps) {
    const { generateAdvice, isLoading, nutritionAdvice, error } = useNutritionAdvisor();

    const handleGenerateAdvice = async () => {
        try {
            await generateAdvice(userData, personalPlan, mealPlan, userProgress);

            if (nutritionAdvice) {
                // Format and send advice to parent component
                const formattedAdvice = formatAdviceForChat(nutritionAdvice.insight);
                onAdviceReceived(formattedAdvice);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to generate nutrition advice. Please try again.');
        }
    };

    const formatAdviceForChat = (advice: any): string => {
        if (typeof advice === 'string') {
            return advice;
        }

        if (typeof advice === 'object') {
            let formatted = '';

            if (advice.greeting) {
                formatted += `${advice.greeting}\n\n`;
            }

            if (advice.analysis) {
                formatted += '📊 Analysis:\n';
                Object.values(advice.analysis).forEach((item: any) => {
                    if (typeof item === 'string') {
                        formatted += `• ${item}\n`;
                    }
                });
                formatted += '\n';
            }

            if (advice.recommendations) {
                formatted += '💡 Recommendations:\n';
                if (advice.recommendations.immediate_actions) {
                    advice.recommendations.immediate_actions.forEach((action: string) => {
                        formatted += `• ${action}\n`;
                    });
                }
                formatted += '\n';
            }

            if (advice.encouragement) {
                formatted += `🌟 ${advice.encouragement}`;
            }

            return formatted || 'I have some personalized nutrition advice for you based on your current data!';
        }

        return 'Here\'s your personalized nutrition advice!';
    };

    return (
        <TouchableOpacity
            style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#10b981',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                marginVertical: 8,
            }, style]}
            onPress={handleGenerateAdvice}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
            ) : (
                <Bot size={20} color="#ffffff" />
            )}
            <Text style={{
                color: '#ffffff',
                marginLeft: 8,
                fontWeight: 'bold',
            }}>
                {isLoading ? 'Generating Advice...' : 'Get AI Nutrition Advice'}
            </Text>
            <Zap size={16} color="#ffffff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
    );
}

/**
 * Example of how to integrate into existing consultation component
 */
export function ConsultationWithNutritionAdvisor() {
    const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: Date }>>([
        {
            id: '1',
            text: 'Hello! I\'m your nutrition assistant. How can I help you today?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);

    // Example user data - replace with actual data from your app
    const userData: UserData = {
        nama: 'Muhammad Haerul',
        usia: 22,
        jenis_kelamin: 'Laki-laki',
        berat_badan: 62,
        tinggi_badan: 167,
        tingkat_aktivitas: 'Ringan',
        catatan_aktivitas: 'Olahraga ringan 3x seminggu',
        waktu_bangun: '07.00',
        waktu_tidur: '22.00',
        preferensi_makanan: 'Makanan sehat',
        alergi_makanan: null,
        kondisi_kesehatan: 'Sehat',
        tujuan: 'Meningkatkan kesehatan'
    };

    const personalPlan: PersonalPlan = {
        kebutuhan_kalori: { total_kalori_per_hari_kcal: 2150 },
        kebutuhan_makronutrisi: {},
        kebutuhan_mikronutrisi: {},
        batasi_konsumsi: {},
        kebutuhan_cairan: {},
        catatan: 'Nutrition plan for health improvement'
    };

    const mealPlan: MealPlan = {
        sarapan: { menu: 'Healthy breakfast options' },
        makan_siang: { menu: 'Balanced lunch' },
        makan_malam: { menu: 'Light dinner' }
    };

    const handleAdviceReceived = (advice: string) => {
        const aiMessage = {
            id: Date.now().toString(),
            text: advice,
            isUser: false,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                Nutrition Consultation
            </Text>

            {/* Add the nutrition advisor button to your existing interface */}
            <NutritionAdvisorButton
                userData={userData}
                personalPlan={personalPlan}
                mealPlan={mealPlan}
                onAdviceReceived={handleAdviceReceived}
            />

            {/* Your existing chat messages */}
            <View style={{ flex: 1, marginTop: 16 }}>
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={{
                            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                            backgroundColor: message.isUser ? '#3b82f6' : '#f3f4f6',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 8,
                            maxWidth: '80%',
                        }}
                    >
                        <Text style={{
                            color: message.isUser ? '#ffffff' : '#1f2937',
                        }}>
                            {message.text}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
