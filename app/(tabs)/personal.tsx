import { Edit3 } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { NutritionSections } from '../personal/NutritionSections';
import { ProfileSection } from '../personal/ProfileSection';
import { StatusSection } from '../personal/StatusSection';
import { personalStyles } from '../personal/styles';
import { usePersonalLogic } from '../personal/usePersonalLogic';

export default function PersonalScreen() {
  const {
    profile,
    nutritionPlan,
    getStatusColor,
    getStatusText,
    getBMI,
    getBMICategory,
    getSleepDuration,
  } = usePersonalLogic();

  if (!profile || !nutritionPlan) {
    return (
      <SafeAreaView style={personalStyles.container}>
        <View style={personalStyles.loadingContainer}>
          <Text style={personalStyles.loadingText}>Memuat rencana personal Anda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={personalStyles.container}>
      {/* Header */}
      <View style={personalStyles.header}>
        <Text style={personalStyles.headerTitle}>Rencana Personal</Text>
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

        {/* Action Button */}
        <TouchableOpacity style={personalStyles.actionButton}>
          <Text style={personalStyles.actionButtonText}>Lihat Progress</Text>
        </TouchableOpacity>

        <View style={personalStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}