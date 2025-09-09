import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { welcomeStyles } from './welcome/styles';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Mark that user has seen welcome
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      // Navigate to onboarding flow
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error navigating to onboarding:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={welcomeStyles.container}>
      <View style={welcomeStyles.content}>
        {/* Welcome Section */}
        <View style={welcomeStyles.welcomeSection}>
          <Text style={welcomeStyles.welcomeTitle}>Welcome</Text>

          <Image
            source={require('../assets/images/logo text tag vertical.png')}
            style={welcomeStyles.logo}
            resizeMode="contain"
          />

          <Text style={welcomeStyles.welcomeMessage}>
            Your personalized nutrition journey starts here. Let's help you achieve your health goals with AI-powered meal planning and expert guidance.
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={welcomeStyles.getStartedButton} onPress={handleGetStarted}>
          <Text style={welcomeStyles.getStartedText}>Get Started</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}