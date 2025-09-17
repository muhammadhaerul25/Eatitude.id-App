import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { ActivityRestStep } from '../components/onboarding/ActivityRestStep';
import { BodyMetricsStep } from '../components/onboarding/BodyMetricsStep';
import { GoalsObjectivesStep } from '../components/onboarding/GoalsObjectivesStep';
import { PersonalInfoStep } from '../components/onboarding/PersonalInfoStep';


import { useRouter } from 'expo-router';
import { steps } from '../hooks/onboardingTypes';
import { useOnboardingLogic } from '../hooks/useOnboardingLogic';
import { onboardingStyles } from '../styles/tabs/onboardingStyles';


export default function OnboardingScreen() {
  const {
    currentStep,
    profile,
    isGeneratingPlan,
    validateCurrentStep,
    nextStep,
    prevStep,
    selectGoal,
    updateProfile,
    completeOnboarding,
  } = useOnboardingLogic();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top whenever the step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep profile={profile} updateProfile={updateProfile} />;
      case 1:
        return <BodyMetricsStep profile={profile} updateProfile={updateProfile} />;
      case 2:
        return <ActivityRestStep profile={profile} updateProfile={updateProfile} />;
      case 3:
        return <GoalsObjectivesStep profile={profile} updateProfile={updateProfile} selectGoal={selectGoal} />;
      default:
        return null;
    }
  };


  // No need for custom handleFinish; use completeOnboarding from logic

  return (
    <SafeAreaView style={onboardingStyles.container}>
      {/* Loading Overlay for Plan Generation */}
      <LoadingOverlay
        visible={isGeneratingPlan}
        title="NutriAdvisor AI sedang menyusun rencana nutrisi Anda!"
        subtitle="Proses ini mungkin membutuhkan waktu hingga 1-3 menit"
      />

      {/* Header */}
      <View style={onboardingStyles.header}>
        <Image
          source={require('../assets/images/logo-no-bg-horizontal.png')}
          style={onboardingStyles.appLogo}
          resizeMode="contain"
        />
        <Text style={onboardingStyles.welcomeText}>Personalisasi pengalaman Anda</Text>

        {/* Progress Indicator */}
        <View style={onboardingStyles.progressContainer}>
          <View style={onboardingStyles.progressBar}>
            <View style={[
              onboardingStyles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` }
            ]} />
          </View>
          <Text style={onboardingStyles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>

      {/* Step Content */}
      <ScrollView
        ref={scrollViewRef}
        style={onboardingStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={onboardingStyles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={onboardingStyles.backButton} onPress={prevStep}>
            <Text style={onboardingStyles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            onboardingStyles.nextButton,
            currentStep === 0 && onboardingStyles.nextButtonFull,
            (!validateCurrentStep() || isGeneratingPlan) && onboardingStyles.nextButtonDisabled
          ]}
          onPress={async () => {
            if (isGeneratingPlan) return;
            if (currentStep === steps.length - 1) {
              const result = await completeOnboarding();
              if (result === 'success') {
                router.replace('/(tabs)/personal');
              }
            } else {
              nextStep();
            }
          }}
          disabled={isGeneratingPlan}
        >
          <Text style={[
            onboardingStyles.nextButtonText,
            (!validateCurrentStep() || isGeneratingPlan) && onboardingStyles.nextButtonTextDisabled
          ]}>
            {isGeneratingPlan
              ? 'Generating Plan...'
              : currentStep === steps.length - 1
                ? 'Selesaikan'
                : 'Selanjutnya'
            }
          </Text>
          {!isGeneratingPlan && (
            <ChevronRight size={20} color={(!validateCurrentStep() || isGeneratingPlan) ? "#9CA3AF" : "#FFFFFF"} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}