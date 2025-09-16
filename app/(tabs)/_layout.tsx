import { Tabs } from 'expo-router';
import { ChartBar as BarChart3, Calendar, MessageCircle, User } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          margin: 0,
          marginBottom: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progres',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: 'Konsultasi',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          title: 'Personal',
          tabBarIcon: ({ size, color }) => (
            <User size={18} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}