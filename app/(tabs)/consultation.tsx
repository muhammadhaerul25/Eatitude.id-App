import { TriangleAlert as AlertTriangle, Bell, Bot, Send, TrendingUp, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { consultationTabStyles } from '../../styles/tabs/consultationStyles';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  generatedBy?: 'ai' | 'nutritionist';
  nutritionistName?: string;
}

interface Insight {
  id: string;
  type: 'insight' | 'recommendation' | 'reminder' | 'alert';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ConsultScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your nutrition assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      generatedBy: 'ai',
    },
    {
      id: '2',
      text: 'Based on your recent food intake, I recommend increasing your vegetable portions to meet your daily fiber requirements.',
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
      generatedBy: 'nutritionist',
      nutritionistName: 'Dr. Sarah Fitri, S.Gz',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const insights: Insight[] = [
    {
      id: '1',
      type: 'insight',
      title: 'Calorie Balance Analysis',
      description: 'Great job! You\'ve reached 82% of your daily calorie goal with balanced macronutrients.',
      icon: <TrendingUp size={20} color="#10B981" />,
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Protein Optimization',
      description: 'Consider adding lean protein sources like fish or tofu to your next meal for better muscle recovery.',
      icon: <User size={20} color="#3B82F6" />,
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Hydration Check',
      description: 'Don\'t forget to drink water! You\'re 2 glasses behind your daily hydration goal.',
      icon: <Bell size={20} color="#F59E0B" />,
    },
    {
      id: '4',
      type: 'alert',
      title: 'High Sodium Intake',
      description: 'You\'ve exceeded your daily sodium limit by 15%. Consider reducing salt intake for better heart health.',
      icon: <AlertTriangle size={20} color="#EF4444" />,
    },
  ];

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const isNutritionist = Math.random() > 0.7; // 30% chance for nutritionist response

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
        generatedBy: isNutritionist ? 'nutritionist' : 'ai',
        nutritionistName: isNutritionist ? 'Dr. Maya Sari, S.Gz' : undefined,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      'Based on your current nutrition intake, I recommend increasing your vegetable consumption to meet your fiber goals.',
      'Your protein intake looks good! Try to maintain this level throughout the week.',
      'I notice you might be consuming too much sodium. Would you like some low-sodium meal suggestions?',
      'Your hydration levels could use improvement. Setting regular water reminders might help.',
      'Great question! Let me analyze your eating patterns and provide personalized recommendations.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

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
        <Text style={consultationTabStyles.headerTitle}>NutriAdvisor</Text>
      </View>

      <KeyboardAvoidingView
        style={consultationTabStyles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={consultationTabStyles.content} showsVerticalScrollIndicator={false}>
          {/* Today's Insights */}
          <View style={consultationTabStyles.section}>
            <Text style={consultationTabStyles.sectionTitle}>Today's Analysis</Text>

            {insights.map((insight) => (
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
            ))}
          </View>

          {/* Chat Messages */}
          <View style={consultationTabStyles.section}>
            <Text style={consultationTabStyles.sectionTitle}>NutriBot</Text>

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
                      {message.generatedBy === 'ai' ? (
                        <Text style={consultationTabStyles.aiAttribution}>Generated by AI</Text>
                      ) : (
                        <Text style={consultationTabStyles.nutritionistAttribution}>
                          Answer by {message.nutritionistName}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Chat Input */}
        <View style={consultationTabStyles.inputContainer}>
          <TextInput
            style={consultationTabStyles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about nutrition, meal plans, or health tips..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={consultationTabStyles.sendButton}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

