import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveHallFab } from '@/components/LiveHallFab';

// Tab bar content height (icon + label + padding), excluding the iOS home indicator
const TAB_BAR_CONTENT = Platform.OS === 'ios' ? 58 : 64;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-night">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#C4B5FD',
          tabBarInactiveTintColor: '#5D6A8C',
          tabBarStyle: {
            backgroundColor: '#0B1020',
            borderTopColor: '#202A45',
            borderTopWidth: 1,
            height: TAB_BAR_CONTENT + (Platform.OS === 'ios' ? insets.bottom : 0),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'musical-notes' : 'musical-notes-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'My Tickets',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'ticket' : 'ticket-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* Floating entry to the CT Live Hall */}
      <View pointerEvents="box-none" className="absolute inset-0">
        <LiveHallFab bottomOffset={TAB_BAR_CONTENT + insets.bottom + 16} />
      </View>
    </View>
  );
}
