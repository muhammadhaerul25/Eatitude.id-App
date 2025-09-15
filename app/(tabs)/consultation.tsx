import { TriangleAlert as AlertTriangle, Bell, Bot, Send, TrendingUp, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useNutritionAdvisor } from '../../hooks/useNutritionAdvisor';
import { usePersonalLogic } from '../../hooks/usePersonalLogic';
import { MealPlan, PersonalPlan, UserData } from '../../services/nutritionAdvisorAPI';
import { consultationTabStyles } from '../../styles/tabs/consultationStyles';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  generatedBy?: 'ai' | 'nutritionist';
  nutritionistName?: string;
  isRealAI?: boolean; // Flag to distinguish real AI responses
}

interface Insight {
  id: string;
  type: 'insight' | 'recommendation' | 'reminder' | 'alert';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface NutritionAnalysis {
  insight: string;
  recommendation: string;
  reminder: string;
  alert: string;
}

export default function ConsultScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI nutrition assistant. I can provide personalized nutrition advice based on your profile and meal plans. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      generatedBy: 'ai',
    },
    {
      id: '2',
      text: '⚠️ Please note: AI analysis may take 5-10 minutes to complete as our system processes your data thoroughly. Thank you for your patience!',
      isUser: false,
      timestamp: new Date(),
      generatedBy: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [todaysAnalysis, setTodaysAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get user data and nutrition plans
  const { profile, nutritionPlan } = usePersonalLogic();

  // Nutrition advisor hook
  const {
    generateAdvice,
    isLoading: isGeneratingAdvice,
    nutritionAdvice,
    error: adviceError,
    clearError,
    retry
  } = useNutritionAdvisor();

  // Auto-trigger analysis when user first visits the tab (if they have profile data)
  useEffect(() => {
    const shouldAutoTriggerAnalysis = () => {
      // Check if we have user data and no analysis has been generated yet
      const userData = prepareUserDataForAPI();
      const personalPlan = preparePersonalPlanForAPI();

      return userData && personalPlan && !todaysAnalysis && !isGeneratingAdvice;
    };

    if (shouldAutoTriggerAnalysis()) {
      // Auto-trigger analysis for first-time users
      setTimeout(() => {
        getQuickAnalysis();
      }, 1000); // Small delay to let the component settle
    }
  }, [profile, nutritionPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle nutrition advice response
  useEffect(() => {
    if (nutritionAdvice) {
      // Update today's analysis with the new data if it has the expected format
      if (nutritionAdvice && typeof nutritionAdvice === 'object' &&
        'insight' in nutritionAdvice && 'recommendation' in nutritionAdvice &&
        'reminder' in nutritionAdvice && 'alert' in nutritionAdvice) {
        setTodaysAnalysis(nutritionAdvice as NutritionAnalysis);
      }

      const formattedAdvice = formatNutritionAdvice(nutritionAdvice);

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: formattedAdvice,
        isUser: false,
        timestamp: new Date(),
        generatedBy: 'ai',
        isRealAI: true,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [nutritionAdvice]);

  // Handle API errors
  useEffect(() => {
    if (adviceError) {
      Alert.alert(
        'AI Advisor Error',
        `Failed to generate advice: ${adviceError.message}`,
        [
          { text: 'Cancel', style: 'cancel', onPress: clearError },
          { text: 'Retry', onPress: retry },
        ]
      );
    }
  }, [adviceError, clearError, retry]);

  // Format nutrition advice for display
  const formatNutritionAdvice = (advice: any): string => {
    if (typeof advice === 'string') {
      return advice;
    }

    if (typeof advice === 'object' && advice !== null) {
      let formatted = '';

      // Handle the new API response format
      if (advice.insight) {
        formatted += `📊 **Insight:**\n${advice.insight}\n\n`;
      }

      if (advice.recommendation) {
        formatted += `💡 **Recommendation:**\n${advice.recommendation}\n\n`;
      }

      if (advice.reminder) {
        formatted += `⏰ **Reminder:**\n${advice.reminder}\n\n`;
      }

      if (advice.alert) {
        formatted += `⚠️ **Alert:**\n${advice.alert}\n\n`;
      }

      // Fallback for old format if needed
      if (!advice.insight && !advice.recommendation && !advice.reminder && !advice.alert) {
        if (advice.greeting) {
          formatted += `${advice.greeting}\n\n`;
        }

        if (advice.analysis) {
          formatted += '📊 **Analysis:**\n';
          Object.entries(advice.analysis).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim()) {
              formatted += `• ${value}\n`;
            }
          });
          formatted += '\n';
        }

        if (advice.recommendations) {
          formatted += '💡 **Recommendations:**\n';
          if (advice.recommendations.immediate_actions) {
            advice.recommendations.immediate_actions.forEach((action: string) => {
              formatted += `• ${action}\n`;
            });
          }
          if (advice.recommendations.meal_suggestions) {
            advice.recommendations.meal_suggestions.forEach((suggestion: string) => {
              formatted += `• ${suggestion}\n`;
            });
          }
          if (advice.recommendations.lifestyle_tips) {
            advice.recommendations.lifestyle_tips.forEach((tip: string) => {
              formatted += `• ${tip}\n`;
            });
          }
          formatted += '\n';
        }

        if (advice.encouragement) {
          formatted += `🌟 ${advice.encouragement}\n\n`;
        }

        if (advice.next_steps) {
          formatted += '📋 **Next Steps:**\n';
          advice.next_steps.forEach((step: string) => {
            formatted += `• ${step}\n`;
          });
        }
      }

      return formatted.trim() || 'I\'ve analyzed your nutrition data and have personalized advice for you!';
    }

    return 'I\'ve generated personalized nutrition advice based on your current data!';
  };

  // Convert app data to API format
  const prepareUserDataForAPI = useCallback((): UserData | null => {
    if (!profile) return null;

    // Map gender values
    const genderMap = {
      'male': 'Laki-laki',
      'female': 'Perempuan'
    };

    // Map activity levels
    const activityLevelMap = {
      'sedentary': 'Sangat Ringan',
      'light': 'Ringan',
      'moderate': 'Sedang',
      'active': 'Berat',
      'very_active': 'Sangat Berat'
    };

    // Map goals
    const goalMap = {
      'improve_health': 'Meningkatkan kesehatan',
      'maintain_weight': 'Mempertahankan berat badan',
      'lose_weight': 'Menurunkan berat badan',
      'gain_weight': 'Menaikkan berat badan',
      'manage_disease': 'Mengelola penyakit'
    };

    return {
      nama: profile.nama || 'User',
      usia: profile.usia || 25,
      jenis_kelamin: genderMap[profile.jenis_kelamin as keyof typeof genderMap] || 'Laki-laki',
      berat_badan: profile.berat_badan || 70,
      tinggi_badan: profile.tinggi_badan || 170,
      tingkat_aktivitas: activityLevelMap[profile.tingkat_aktivitas as keyof typeof activityLevelMap] || 'Sedang',
      catatan_aktivitas: profile.catatan_aktivitas || null,
      waktu_bangun: profile.waktu_bangun || '07:00',
      waktu_tidur: profile.waktu_tidur || '22:00',
      preferensi_makanan: profile.preferensi_makanan || null,
      alergi_makanan: profile.alergi_makanan || null,
      kondisi_kesehatan: profile.kondisi_kesehatan || null,
      tujuan: goalMap[profile.tujuan as keyof typeof goalMap] || 'Meningkatkan kesehatan'
    };
  }, [profile]);

  const preparePersonalPlanForAPI = useCallback((): PersonalPlan | null => {
    if (!nutritionPlan) return null;

    return {
      kebutuhan_kalori: {
        total_kalori_per_hari_kcal: nutritionPlan.kebutuhan_kalori?.["total_kalori_per_hari_(kcal)"] || 2000
      },
      kebutuhan_makronutrisi: {
        karbohidrat_per_hari_g: nutritionPlan.kebutuhan_makronutrisi?.["karbohidrat_per_hari_(g)"] || 250,
        protein_per_hari_g: nutritionPlan.kebutuhan_makronutrisi?.["protein_per_hari_(g)"] || 100,
        lemak_per_hari_g: nutritionPlan.kebutuhan_makronutrisi?.["lemak_per_hari_(g)"] || 60,
        serat_per_hari_g: nutritionPlan.kebutuhan_makronutrisi?.["serat_per_hari_(g)"] || 25
      },
      kebutuhan_mikronutrisi: {
        vitamin_a_per_hari_mg: nutritionPlan.kebutuhan_mikronutrisi?.["vitamin_a_per_hari_(mg)"] || 0.9,
        vitamin_c_per_hari_mg: nutritionPlan.kebutuhan_mikronutrisi?.["vitamin_c_per_hari_(mg)"] || 90,
        kalsium_per_hari_mg: nutritionPlan.kebutuhan_mikronutrisi?.["kalsium_per_hari_(mg)"] || 1000,
        zat_besi_per_hari_mg: nutritionPlan.kebutuhan_mikronutrisi?.["zat_besi_per_hari_(mg)"] || 8
      },
      batasi_konsumsi: {
        gula_per_hari_sdm: 4,
        garam_per_hari_sdt: 1,
        kafein_per_hari_cangkir: 4
      },
      kebutuhan_cairan: {
        air_per_hari_liter: nutritionPlan.hidrasi?.liter || 2.5,
        air_per_hari_gelas: nutritionPlan.hidrasi?.gelas || 10
      },
      catatan: `Personalized nutrition plan for ${profile?.nama || 'user'} with ${nutritionPlan.kalori || 2000} calories daily target.`
    };
  }, [nutritionPlan, profile?.nama]);

  const prepareMealPlanForAPI = (): MealPlan => {
    // Use sample meal plan if not available
    return {
      sarapan: {
        range_waktu: '07:00-08:00',
        target_kalori_kcal: 400,
        list_pilihan_menu: ['Healthy breakfast options']
      },
      makan_siang: {
        range_waktu: '12:00-13:00',
        target_kalori_kcal: 600,
        list_pilihan_menu: ['Balanced lunch options']
      },
      makan_malam: {
        range_waktu: '18:00-19:00',
        target_kalori_kcal: 500,
        list_pilihan_menu: ['Light dinner options']
      }
    };
  };

  // Convert nutrition analysis to insight format for display
  const getInsightsFromAnalysis = (): Insight[] => {
    if (!todaysAnalysis) return [];

    return [
      {
        id: '1',
        type: 'insight',
        title: 'Insight',
        description: todaysAnalysis.insight,
        icon: <TrendingUp size={20} color="#10B981" />,
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'Rekomendasi',
        description: todaysAnalysis.recommendation,
        icon: <User size={20} color="#3B82F6" />,
      },
      {
        id: '3',
        type: 'reminder',
        title: 'Pengingat Harian',
        description: todaysAnalysis.reminder,
        icon: <Bell size={20} color="#F59E0B" />,
      },
      {
        id: '4',
        type: 'alert',
        title: 'Peringatan Penting',
        description: todaysAnalysis.alert,
        icon: <AlertTriangle size={20} color="#EF4444" />,
      },
    ];
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || isGeneratingAdvice) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll to show user message immediately
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Check if we have the required data
    const userData = prepareUserDataForAPI();
    const personalPlan = preparePersonalPlanForAPI();
    const mealPlan = prepareMealPlanForAPI();

    if (!userData || !personalPlan) {
      // Fallback to simple response if no user data available
      setTimeout(() => {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'd love to help you with personalized nutrition advice! However, I need your profile and nutrition plan to provide the most accurate recommendations. Please complete your profile setup first, and then I can give you AI-powered advice based on your specific needs.",
          isUser: false,
          timestamp: new Date(),
          generatedBy: 'ai',
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
      return;
    }

    // Generate real AI advice
    try {
      await generateAdvice(userData, personalPlan, mealPlan);
    } catch (error) {
      // Error handling is done in useEffect for adviceError
      console.error('Failed to generate advice:', error);
    }
  };

  // Quick analysis function
  const getQuickAnalysis = useCallback(async () => {
    const userData = prepareUserDataForAPI();
    const personalPlan = preparePersonalPlanForAPI();
    const mealPlan = prepareMealPlanForAPI();

    if (!userData || !personalPlan) {
      Alert.alert(
        'Profile Required',
        'Please complete your profile setup to get personalized nutrition analysis.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Clear any previous errors
    setAnalysisError(null);
    setIsLoadingAnalysis(true);

    // Add a quick analysis request message
    const analysisMessage: Message = {
      id: Date.now().toString(),
      text: 'Please provide me with a comprehensive nutrition analysis based on my current profile and meal plan.',
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, analysisMessage]);

    // Generate AI response
    try {
      await generateAdvice(userData, personalPlan, mealPlan);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to generate analysis');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [prepareUserDataForAPI, preparePersonalPlanForAPI, generateAdvice]);

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'insight':
        return { backgroundColor: '#F0FDF4', borderColor: '#10B981' }; // Green
      case 'recommendation':
        return { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }; // Blue
      case 'reminder':
        return { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }; // Yellow
      case 'alert':
        return { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }; // Red
      default:
        return { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={consultationTabStyles.container}>
      {/* Header */}
      <View style={consultationTabStyles.header}>
        <Text style={consultationTabStyles.headerTitle}>Konsultasi</Text>
      </View>

      <KeyboardAvoidingView
        style={consultationTabStyles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={consultationTabStyles.content} showsVerticalScrollIndicator={false}>
          {/* Analisis Hari Ini */}
          <View style={consultationTabStyles.section}>
            <Text style={consultationTabStyles.sectionTitle}>Analisis Hari Ini</Text>

            {isGeneratingAdvice || isLoadingAnalysis ? (
              <View style={[
                consultationTabStyles.insightCard,
                { backgroundColor: '#F0FDF4', borderColor: '#10B981' }
              ]}>
                <View style={consultationTabStyles.insightHeader}>
                  <ActivityIndicator size={20} color="#10B981" />
                  <Text style={consultationTabStyles.insightTitle}>Analisis...</Text>
                </View>
                <Text style={consultationTabStyles.insightDescription}>
                  NutriAdvisor AI sedang menganalisis data nutrisi Anda. Ini mungkin memakan waktu 5-10 menit untuk analisis yang komprehensif
                </Text>
              </View>
            ) : analysisError ? (
              <View style={[
                consultationTabStyles.insightCard,
                { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }
              ]}>
                <View style={consultationTabStyles.insightHeader}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <Text style={consultationTabStyles.insightTitle}>Analysis Failed</Text>
                </View>
                <Text style={consultationTabStyles.insightDescription}>
                  {analysisError}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#EF4444',
                    borderRadius: 6,
                    padding: 8,
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {
                    setAnalysisError(null);
                    getQuickAnalysis();
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : todaysAnalysis ? (
              getInsightsFromAnalysis().map((insight) => (
                <View key={insight.id} style={[
                  consultationTabStyles.insightCard,
                  getInsightStyle(insight.type)
                ]}>
                  <View style={consultationTabStyles.insightHeader}>
                    {insight.icon}
                    <Text style={consultationTabStyles.insightTitle}>{insight.title}</Text>
                  </View>
                  <Text style={consultationTabStyles.insightDescription}>
                    {insight.description}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[
                consultationTabStyles.insightCard,
                { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }
              ]}>
                <View style={consultationTabStyles.insightHeader}>
                  <Bot size={20} color="#6B7280" />
                  <Text style={consultationTabStyles.insightTitle}>No Analysis Available</Text>
                </View>
                <Text style={consultationTabStyles.insightDescription}>
                  Get your personalized nutrition analysis by clicking &quot;Get AI Nutrition Analysis&quot; below.
                  Our AI will analyze your profile and meal plans to provide insights, recommendations, and alerts.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 6,
                    padding: 8,
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {
                    // Trigger the quick analysis
                    getQuickAnalysis();
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                    Generate Analysis
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Chat Messages */}
          <View style={consultationTabStyles.section}>
            <Text style={consultationTabStyles.sectionTitle}>Ahli Gizi</Text>

            <View style={consultationTabStyles.chatContainer}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    consultationTabStyles.messageContainer,
                    message.isUser ? consultationTabStyles.userMessage : consultationTabStyles.aiMessage
                  ]}
                >
                  <View style={consultationTabStyles.messageHeader}>
                    {message.isUser ? (
                      <User size={16} color="#3B82F6" />
                    ) : (
                      <Bot size={16} color="#10B981" />
                    )}
                    <Text style={consultationTabStyles.messageTime}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>

                  <Text style={consultationTabStyles.messageText}>{message.text}</Text>

                  {!message.isUser && (
                    <View style={consultationTabStyles.attributionContainer}>
                      {message.isRealAI ? (
                        <Text style={consultationTabStyles.aiAttribution}>AI-Powered Analysis</Text>
                      ) : message.generatedBy === 'ai' ? (
                        <Text style={consultationTabStyles.aiAttribution}>Generated by NutriAdvisor AI</Text>
                      ) : (
                        <Text style={consultationTabStyles.nutritionistAttribution}>
                          Answer by {message.nutritionistName}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {/* Loading indicator for AI response */}
              {isGeneratingAdvice && (
                <View style={[
                  consultationTabStyles.messageContainer,
                  consultationTabStyles.aiMessage
                ]}>
                  <View style={consultationTabStyles.messageHeader}>
                    <Bot size={16} color="#10B981" />
                    <Text style={consultationTabStyles.messageTime}>
                      {formatTime(new Date())}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                    <ActivityIndicator size="small" color="#10B981" />
                    <Text style={[consultationTabStyles.messageText, { marginLeft: 8, fontStyle: 'italic' }]}>
                      Analyzing your nutrition data with AI... This may take a few minutes.
                    </Text>
                  </View>

                  <View style={consultationTabStyles.attributionContainer}>
                    <Text style={consultationTabStyles.aiAttribution}>AI-Powered Analysis</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Quick Analysis Button */}
            {/* {!isGeneratingAdvice && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={getQuickAnalysis}
              >
                <Bot size={20} color="#FFFFFF" />
                <Text style={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  marginLeft: 8,
                }}>
                  Get AI Nutrition Analysis
                </Text>
              </TouchableOpacity>
            )} */}
          </View>
        </ScrollView>

        {/* Chat Input */}
        <View style={consultationTabStyles.inputContainer}>
          <TextInput
            style={consultationTabStyles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder=""
            multiline
            maxLength={500}
            editable={!isGeneratingAdvice}
          />
          <TouchableOpacity
            style={[
              consultationTabStyles.sendButton,
              (inputText.trim() === '' || isGeneratingAdvice) && { opacity: 0.5 }
            ]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isGeneratingAdvice}
          >
            {isGeneratingAdvice ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

