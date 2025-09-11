import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';

export default function RootLayout() {
  useFrameworkReady();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Re-check onboarding status when app comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 useFocusEffect triggered - rechecking onboarding status');
      checkOnboardingStatus();
    }, [])
  );

  useEffect(() => {
    if (!isLoading && !isNavigating) {
      // Add a delay to allow AsyncStorage state to sync
      const timeoutId = setTimeout(() => {
        const inTabsGroup = segments[0] === '(tabs)';
        const inOnboarding = segments[0] === 'onboarding';

        console.log('🧭 Navigation check:', {
          hasCompletedOnboarding,
          hasSeenWelcome,
          currentSegment: segments[0],
          inTabsGroup,
          inOnboarding
        });

        // Case 1: User completed onboarding - redirect to tabs
        if (hasCompletedOnboarding && !inTabsGroup) {
          console.log('✅ Redirecting to tabs (onboarding completed)');
          setIsNavigating(true);
          router.replace('/(tabs)');
          setTimeout(() => setIsNavigating(false), 1000);
          return;
        }

        // Case 2: User has seen welcome but not completed onboarding - redirect to onboarding  
        if (!hasCompletedOnboarding && hasSeenWelcome && !inOnboarding && !inTabsGroup) {
          console.log('📝 Redirecting to onboarding (welcome seen, not completed)');
          setIsNavigating(true);
          router.replace('/onboarding');
          setTimeout(() => setIsNavigating(false), 1000);
          return;
        }

        // Case 3: New users stay at root (index/welcome) - no action needed
        // Case 4: Users in correct flow - no action needed
        console.log('� User in correct flow - no redirect needed');
      }, 500); // Reduced delay since logic is much simpler

      return () => clearTimeout(timeoutId);
    }
  }, [hasCompletedOnboarding, hasSeenWelcome, isLoading, segments, isNavigating]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      const welcomeShown = await AsyncStorage.getItem('hasSeenWelcome');

      console.log('📱 Checking onboarding status:', {
        completed: completed === 'true',
        welcomeShown: welcomeShown === 'true'
      });

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