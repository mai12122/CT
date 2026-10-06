import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { MD3Colors } from '@/constants/MaterialTheme';

export default function TabLayout() {
  const colors = MD3Colors.dark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.outlineVariant + '33',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-14 rounded-full items-center justify-center ${
                focused ? 'bg-md-secondaryContainer' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'musical-notes' : 'musical-notes-outline'}
                size={22}
                color={focused ? colors.onSecondaryContainer : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-14 rounded-full items-center justify-center ${
                focused ? 'bg-md-secondaryContainer' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'ticket' : 'ticket-outline'}
                size={22}
                color={focused ? colors.onSecondaryContainer : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-14 rounded-full items-center justify-center ${
                focused ? 'bg-md-secondaryContainer' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? colors.onSecondaryContainer : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
