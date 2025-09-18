/**
 * Enhanced Nutrition Advisor Component
 * 
 * This component demonstrates how to integrate the nutrition advisor API
 * into a React Native chat interface. It shows real AI-powered responses
 * based on user data, personal plans, and progress.
 */

import { Bot, Send, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNutritionAdvisor, useNutritionAdvisorErrorMessages } from '../../hooks/useNutritionAdvisor';
import { MealPlan, PersonalPlan, UserData, UserProgress } from '../../services/nutritionAdvisorAPI';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isAIGenerated?: boolean;
}

interface NutritionAdvisorChatProps {
    userData: UserData;
    personalPlan: PersonalPlan;
    mealPlan: MealPlan;
    userProgress?: UserProgress;
    style?: any;
}

/**
 * Chat component with real nutrition advisor integration
 */
export function NutritionAdvisorChat({
    userData,
    personalPlan,
    mealPlan,
    userProgress,
    style
}: NutritionAdvisorChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello ${userData.nama}! I'm your AI nutrition advisor. I've analyzed your profile and nutrition plan. How can I help you today?`,
            isUser: false,
            timestamp: new Date(),
            isAIGenerated: false,
        },
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const {
        generateAdvice,
        isLoading,
        nutritionAdvice,
        error,
        clearError,
        retry,
    } = useNutritionAdvisor();

    const { getErrorMessage, getErrorTitle } = useNutritionAdvisorErrorMessages();

    /**
     * Handle new nutrition advice from API
     */
    useEffect(() => {
        if (nutritionAdvice) {
            const adviceText = formatNutritionAdvice(nutritionAdvice);

            const aiMessage: Message = {
                id: Date.now().toString(),
                text: adviceText,
                isUser: false,
                timestamp: new Date(),
                isAIGenerated: true,
            };

            setMessages(prev => [...prev, aiMessage]);

            // Scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [nutritionAdvice]);

    /**
     * Handle API errors
     */
    useEffect(() => {
        if (error) {
            Alert.alert(
                getErrorTitle(error),
                getErrorMessage(error),
                [
                    { text: 'Cancel', style: 'cancel', onPress: clearError },
                    { text: 'Retry', onPress: retry },
                ]
            );
        }
    }, [error, getErrorTitle, getErrorMessage, clearError, retry]);

    /**
     * Format nutrition advice for display
     */
    const formatNutritionAdvice = (advice: any): string => {
        if (typeof advice === 'string') {
            return advice;
        }

        if (typeof advice === 'object') {
            // Try to extract meaningful text from the advice object
            let formatted = '';

            if (advice.greeting) {
                formatted += `${advice.greeting}\n\n`;
            }

            if (advice.analysis) {
                formatted += 'Analysis:\n';
                Object.entries(advice.analysis).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        formatted += `• ${value}\n`;
                    }
                });
                formatted += '\n';
            }

            if (advice.recommendations) {
                formatted += 'Recommendations:\n';
                if (Array.isArray(advice.recommendations.immediate_actions)) {
                    advice.recommendations.immediate_actions.forEach((action: string) => {
                        formatted += `• ${action}\n`;
                    });
                }
                formatted += '\n';
            }

            if (advice.encouragement) {
                formatted += `${advice.encouragement}\n`;
            }

            return formatted || JSON.stringify(advice, null, 2);
        }

        return "I've analyzed your nutrition data and have some personalized advice for you!";
    };

    /**
     * Send user message and get AI response
     */
    const sendMessage = async () => {
        if (inputText.trim() === '' || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        // Generate AI response
        await generateAdvice(userData, personalPlan, mealPlan, userProgress);
    };

    /**
     * Get a quick nutrition analysis
     */
    const getQuickAnalysis = async () => {
        const analysisMessage: Message = {
            id: Date.now().toString(),
            text: 'Please give me a quick analysis of my current nutrition status.',
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, analysisMessage]);
        await generateAdvice(userData, personalPlan, mealPlan, userProgress);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={[{ flex: 1, backgroundColor: '#f9fafb' }, style]}>
            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1, padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={{
                            marginBottom: 16,
                            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: message.isUser ? '#3b82f6' : '#ffffff',
                                borderRadius: 12,
                                padding: 12,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                {message.isUser ? (
                                    <User size={16} color="#ffffff" />
                                ) : (
                                    <Bot size={16} color="#10b981" />
                                )}
                                <Text
                                    style={{
                                        marginLeft: 6,
                                        fontSize: 12,
                                        color: message.isUser ? '#ffffff' : '#6b7280',
                                    }}
                                >
                                    {formatTime(message.timestamp)}
                                </Text>
                                {message.isAIGenerated && (
                                    <Text
                                        style={{
                                            marginLeft: 6,
                                            fontSize: 10,
                                            color: '#10b981',
                                            fontStyle: 'italic',
                                        }}
                                    >
                                        AI Generated
                                    </Text>
                                )}
                            </View>
                            <Text
                                style={{
                                    color: message.isUser ? '#ffffff' : '#1f2937',
                                    fontSize: 14,
                                    lineHeight: 20,
                                }}
                            >
                                {message.text}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <View
                        style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#10b981" />
                            <Text style={{ marginLeft: 8, color: '#6b7280' }}>
                                Analisis data nutrisi harianmu...
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#10b981',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                    }}
                    onPress={getQuickAnalysis}
                    disabled={isLoading}
                >
                    <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>
                        Get Quick Nutrition Analysis
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chat Input */}
            <View
                style={{
                    flexDirection: 'row',
                    padding: 16,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                }}
            >
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginRight: 8,
                        maxHeight: 100,
                    }}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask about nutrition, meal plans, or health tips..."
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={{
                        backgroundColor: inputText.trim() && !isLoading ? '#3b82f6' : '#d1d5db',
                        borderRadius: 8,
                        padding: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={sendMessage}
                    disabled={inputText.trim() === '' || isLoading}
                >
                    <Send size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/**
 * Example usage component showing how to implement the nutrition advisor
 */
export function NutritionAdvisorExample() {
    // Example data - in a real app, this would come from your app's state/context
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
        alergi_makanan: 'Tidak ada alergi',
        kondisi_kesehatan: 'Sehat',
        tujuan: 'Meningkatkan kesehatan'
    };

    const personalPlan: PersonalPlan = {
        kebutuhan_kalori: { total_kalori_per_hari_kcal: 2150 },
        kebutuhan_makronutrisi: {
            karbohidrat_per_hari_g: 295,
            protein_per_hari_g: 107,
            lemak_per_hari_g: 60,
            serat_per_hari_g: 30
        },
        kebutuhan_mikronutrisi: {
            vitamin_a_per_hari_mg: 0.9,
            vitamin_c_per_hari_mg: 90,
            kalsium_per_hari_mg: 1000,
            zat_besi_per_hari_mg: 8
        },
        batasi_konsumsi: {
            gula_per_hari_sdm: 4,
            garam_per_hari_sdt: 1,
            kafein_per_hari_cangkir: 4
        },
        kebutuhan_cairan: {
            air_per_hari_liter: 2.2,
            air_per_hari_gelas: 9
        },
        catatan: 'Plan makan disusun untuk meningkatkan kesehatan dengan total kalori 2150 kkal.'
    };

    const mealPlan: MealPlan = {
        sarapan: {
            range_waktu: '07.00–08.00',
            target_kalori_kcal: 430,
            list_pilihan_menu: ['Nasi merah + Telur dadar + Tumis sayuran']
        },
        makan_siang: {
            range_waktu: '12.00–13.00',
            target_kalori_kcal: 650,
            list_pilihan_menu: ['Nasi merah + Ikan bakar + Sayuran']
        },
        makan_malam: {
            range_waktu: '18.30–19.30',
            target_kalori_kcal: 600,
            list_pilihan_menu: ['Nasi merah + Ayam panggang + Salad']
        }
    };

    const userProgress: UserProgress = {
        target_kalori: '1520 kcal / 2000 kcal',
        target_makronutrisi: {
            karbohidrat: '220 g / 275 g',
            protein: '95 g / 120 g',
            lemak: '60 g / 70 g',
            serat: '24 g / 30 g'
        },
        status_mikronutrisi: {
            vitamin: {
                vitamin_a: 'Cukup',
                vitamin_b: 'Kurang',
                vitamin_c: 'Berlebih',
                vitamin_d: 'Kurang',
                vitamin_e: 'Cukup',
                vitamin_k: 'Cukup'
            },
            mineral: {
                kalsium: 'Cukup',
                zat_besi: 'Kurang',
                magnesium: 'Cukup',
                kalium: 'Kurang',
                natrium: 'Berlebih',
                zinc: 'Cukup',
                yodium: 'Cukup'
            }
        },
        batas_konsumsi: {
            gula: 'Waspada',
            garam: 'Berlebih',
            lemak_jenuh: 'Bahaya',
            lemak_trans: 'Aman',
            kafein: 'Aman',
            kolestrol: 'Cukup'
        },
        asupan_cairan: {
            air: '7 gelas / 10 gelas'
        }
    };

    return (
        <NutritionAdvisorChat
            userData={userData}
            personalPlan={personalPlan}
            mealPlan={mealPlan}
            userProgress={userProgress}
        />
    );
}
