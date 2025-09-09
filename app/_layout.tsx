import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  useFrameworkReady();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
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

      if (!hasCompletedOnboarding && showWelcome && !inWelcome && !inOnboarding && segments[0] !== '+not-found') {
        // Show welcome page first for users who haven't completed onboarding and haven't seen welcome
        router.replace('/welcome');
      } else if (!hasCompletedOnboarding && !showWelcome && !inOnboarding && !inWelcome && segments[0] !== '+not-found') {
        // After welcome (or for returning users who didn't complete onboarding), go to onboarding
        router.replace('/onboarding');
      } else if (hasCompletedOnboarding && !inTabsGroup && !inWelcome && !inOnboarding && segments[0] !== '+not-found') {
        // After onboarding completion, go to main app
        router.replace('/(tabs)');
      }
    }
  }, [hasCompletedOnboarding, showWelcome, isLoading, segments]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      const welcomeShown = await AsyncStorage.getItem('hasSeenWelcome');

      setHasCompletedOnboarding(completed === 'true');
      // Show welcome for users who haven't completed onboarding AND haven't seen welcome
      setShowWelcome(completed !== 'true' && welcomeShown !== 'true');
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