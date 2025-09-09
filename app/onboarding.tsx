import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ActivityRestStep } from './onboarding/ActivityRestStep';
import { BodyMetricsStep } from './onboarding/BodyMetricsStep';
import { GoalsObjectivesStep } from './onboarding/GoalsObjectivesStep';
import { PersonalInfoStep } from './onboarding/PersonalInfoStep';
import { onboardingStyles } from './onboarding/styles';
import { steps } from './onboarding/types';
import { useOnboardingLogic } from './onboarding/useOnboardingLogic';

export default function OnboardingScreen() {
  const {
    currentStep,
    profile,
    validateCurrentStep,
    nextStep,
    prevStep,
    selectGoal,
    updateProfile,
  } = useOnboardingLogic();

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

  return (
    <SafeAreaView style={onboardingStyles.container}>
      {/* Header */}
      <View style={onboardingStyles.header}>
        <Text style={onboardingStyles.appName}>Eatitude</Text>
        <Text style={onboardingStyles.welcomeText}>Let's personalize your experience</Text>

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
      <ScrollView style={onboardingStyles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={onboardingStyles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={onboardingStyles.backButton} onPress={prevStep}>
            <Text style={onboardingStyles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            onboardingStyles.nextButton,
            currentStep === 0 && onboardingStyles.nextButtonFull,
            !validateCurrentStep() && onboardingStyles.nextButtonDisabled
          ]}
          onPress={nextStep}
        >
          <Text style={[
            onboardingStyles.nextButtonText,
            !validateCurrentStep() && onboardingStyles.nextButtonTextDisabled
          ]}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ChevronRight size={20} color={!validateCurrentStep() ? "#9CA3AF" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}