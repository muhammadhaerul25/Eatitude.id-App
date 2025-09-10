import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';

export default function RootLayout() {
  useFrameworkReady();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inTabsGroup = segments[0] === '(tabs)';
      const inWelcome = segments[0] === 'welcome';
      const inOnboarding = segments[0] === 'onboarding';

      console.log('🧭 Navigation check:', {
        hasCompletedOnboarding,
        hasSeenWelcome,
        currentSegment: segments[0],
        inTabsGroup,
        inWelcome,
        inOnboarding
      });

      // If user completed onboarding, always go to main app
      if (hasCompletedOnboarding && !inTabsGroup && segments[0] !== '+not-found') {
        console.log('✅ Redirecting to tabs (onboarding completed)');
        router.replace('/(tabs)');
      } else if (!hasCompletedOnboarding && !hasSeenWelcome && !inWelcome && !inOnboarding && segments[0] !== '+not-found') {
        // Show welcome page for new users who haven't seen it
        console.log('👋 Redirecting to welcome (new user)');
        router.replace('/welcome');
      } else if (!hasCompletedOnboarding && hasSeenWelcome && !inOnboarding && !inWelcome && segments[0] !== '+not-found') {
        // Show onboarding for users who have seen welcome but not completed onboarding
        console.log('📝 Redirecting to onboarding');
        router.replace('/onboarding');
      }
    }
  }, [hasCompletedOnboarding, hasSeenWelcome, isLoading, segments]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      const welcomeShown = await AsyncStorage.getItem('hasSeenWelcome');

      setHasCompletedOnboarding(completed === 'true');
      setHasSeenWelcome(welcomeShown === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}