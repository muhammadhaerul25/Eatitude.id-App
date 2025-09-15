import { Edit3 } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { router } from 'expo-router';

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

        {/* Action Buttons */}
        {/* <View style={personalStyles.actionContainer}>
          <TouchableOpacity
            style={[personalStyles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={generateNutritionPlan}
            disabled={isGeneratingPlan}
          >
            <Text style={personalStyles.actionButtonText}>
              {isGeneratingPlan ? 'Menghasilkan Rencana...' : 'Generate Rencana Nutrisi AI'}
            </Text>
          </TouchableOpacity>

            <TouchableOpacity 
            style={personalStyles.actionButton}
            onPress={() => router.push('/(tabs)/progress')}
            >
            <Text style={personalStyles.actionButtonText}>Lihat Progress</Text>
            </TouchableOpacity>
        </View> */}

        <View style={personalStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}