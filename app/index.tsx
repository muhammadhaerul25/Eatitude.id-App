import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { welcomeStyles } from '../styles/tabs/welcomeStyles';

export default function IndexScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserFlow = async () => {
            try {
                const [hasSeenWelcome, hasCompletedOnboarding, hasSeenPersonal] = await Promise.all([
                    AsyncStorage.getItem('hasSeenWelcome'),
                    AsyncStorage.getItem('hasCompletedOnboarding'),
                    AsyncStorage.getItem('hasSeenPersonal')
                ]);

                const seenWelcome = hasSeenWelcome === 'true';
                const completedOnboarding = hasCompletedOnboarding === 'true';
                const seenPersonal = hasSeenPersonal === 'true';

                console.log('🔍 User flow check:', {
                    hasSeenWelcome: seenWelcome,
                    hasCompletedOnboarding: completedOnboarding,
                    hasSeenPersonal: seenPersonal
                });

                if (completedOnboarding && seenPersonal) {
                    // User has completed everything, go to main tabs
                    router.replace('/(tabs)');
                } else if (completedOnboarding && !seenPersonal) {
                    // User completed onboarding but hasn't seen personal tab
                    router.replace('/(tabs)/personal');
                } else if (seenWelcome && !completedOnboarding) {
                    // User has seen welcome but not completed onboarding
                    router.replace('/onboarding');
                } else {
                    // First time user, show welcome screen
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error checking user flow:', error);
                setIsLoading(false);
            }
        };

        checkUserFlow();
    }, [router]);

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

    if (isLoading) {
        return (
            <SafeAreaView style={[welcomeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#10B981" />
            </SafeAreaView>
        );
    }

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
