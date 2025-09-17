import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Edit3 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { NutritionSections } from '../../components/personal/NutritionSections';
import { ProfileSection } from '../../components/personal/ProfileSection';
import { StatusSection } from '../../components/personal/StatusSection';
import { usePersonalLogic } from '../../hooks/usePersonalLogic';
import { personalStyles } from '../../styles/tabs/personalStyles';

export default function PersonalScreen() {
  const {
    profile,
    nutritionPlan,
    isGeneratingPlan,
    generateNutritionPlan,
    getStatusColor,
    getStatusText,
    getBMI,
    getBMICategory,
    getSleepDuration,
  } = usePersonalLogic();

  const [isFirstTimeVisit, setIsFirstTimeVisit] = useState(false);

  useEffect(() => {
    const checkFirstTimeVisit = async () => {
      try {
        const hasSeenPersonal = await AsyncStorage.getItem('hasSeenPersonal');
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

        // If user completed onboarding but hasn't seen personal tab yet
        if (hasCompletedOnboarding === 'true' && hasSeenPersonal !== 'true') {
          setIsFirstTimeVisit(true);
        }
      } catch (error) {
        console.error('Error checking first time visit:', error);
      }
    };

    checkFirstTimeVisit();
  }, []);

  const handleContinueToApp = async () => {
    try {
      // Mark that user has seen personal tab
      await AsyncStorage.setItem('hasSeenPersonal', 'true');
      console.log('✅ Personal tab completed, navigating to main app');

      // Navigate to main tabs (index)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing personal setup:', error);
      router.replace('/(tabs)');
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={personalStyles.container}>
        <View style={personalStyles.loadingContainer}>
          <Text style={personalStyles.loadingText}>Memuat profil Anda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!nutritionPlan) {
    return (
      <SafeAreaView style={personalStyles.container}>
        <View style={personalStyles.loadingContainer}>
          <Text style={personalStyles.loadingText}>Rencana nutrisi belum tersedia</Text>
          <TouchableOpacity
            style={[personalStyles.actionButton, { backgroundColor: '#10B981', marginTop: 16 }]}
            onPress={generateNutritionPlan}
            disabled={isGeneratingPlan}
          >
            <Text style={personalStyles.actionButtonText}>
              {isGeneratingPlan ? 'Menghasilkan Rencana...' : 'Generate Rencana Nutrisi AI'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={personalStyles.container}>
      {/* Header */}
      <View style={personalStyles.header}>
        <Text style={personalStyles.headerTitle}>Rencana Nutrisi Personal</Text>
        <TouchableOpacity style={personalStyles.editButton}>
          <Edit3 size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={personalStyles.content} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <StatusSection
          nutritionPlan={nutritionPlan}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        {/* Profile Section */}
        <ProfileSection
          profile={profile}
          getBMI={getBMI}
          getBMICategory={getBMICategory}
          getSleepDuration={getSleepDuration}
        />

        {/* Nutrition Sections */}
        <NutritionSections nutritionPlan={nutritionPlan} />

        <View style={personalStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}