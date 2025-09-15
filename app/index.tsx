import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { welcomeStyles } from '../styles/tabs/welcomeStyles';

export default function IndexScreen() {
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
                    <Image
                        source={require('../assets/images/logo-no-bg-vertical.png')}
                        style={[welcomeStyles.logo, { width: '80%', height: '80%', aspectRatio: undefined }]}
                        resizeMode="contain"
                    />
                    <Text style={welcomeStyles.taglineText}>Powered by AI, Validated by Nutritionist</Text>
                </View>

                {/* Get Started Button */}
                <TouchableOpacity style={welcomeStyles.getStartedButton} onPress={handleGetStarted}>
                    <Text style={welcomeStyles.getStartedText}>Mulai</Text>
                    <ChevronRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
