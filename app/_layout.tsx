import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkInitialState = async () => {
      try {
        console.log('🔍 Checking app initialization state...');

        const [welcomeStatus, onboardingStatus] = await Promise.all([
          AsyncStorage.getItem('hasSeenWelcome'),
          AsyncStorage.getItem('hasCompletedOnboarding')
        ]);

        const seenWelcome = welcomeStatus === 'true';
        const completedOnboarding = onboardingStatus === 'true';

        console.log('📊 App state:', {
          hasSeenWelcome: seenWelcome,
          hasCompletedOnboarding: completedOnboarding,
          currentSegments: segments
        });

        setIsLoading(false);

        // Handle navigation based on state
        setTimeout(() => {
          const inAuthGroup = segments[0] === '(tabs)';

          if (completedOnboarding) {
            // User has completed onboarding, should be in tabs
            if (!inAuthGroup) {
              console.log('🚀 Redirecting to tabs (main app)');
              router.replace('/(tabs)');
            }
          } else if (seenWelcome) {
            // User has seen welcome but not completed onboarding
            if (segments[0] !== 'onboarding') {
              console.log('🚀 Redirecting to onboarding');
              router.replace('/onboarding');
            }
          } else {
            // First time user, show welcome (index is the root route)
            if (segments.length > 0 && segments[0] !== undefined) {
              console.log('🚀 Redirecting to welcome');
              router.replace('/');
            }
          }
        }, 100); // Small delay to ensure router is ready
      } catch (error) {
        console.error('❌ Error checking initial state:', error);
        setIsLoading(false);
      }
    };

    checkInitialState();
  }, [router, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="debug" />
      <Stack.Screen name="debug-data" />
    </Stack>
  );
}