import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  MaterialTopAppBar,
  MaterialCard,
  MaterialButton,
  MaterialBadge,
  MaterialDivider,
} from '@/components/material';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<{ bookings: number; tickets: number }>({ bookings: 0, tickets: 0 });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api.getMe().then((data) => {
        if (data?._count) {
          setStats({
            bookings: data._count.bookings || 0,
            tickets: data._count.tickets || 0,
          });
        }
      }).catch(() => {});
    }, [user])
  );

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
            router.replace('/(tabs)');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-md-surface">
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      {/* Material 3 Top App Bar */}
      <MaterialTopAppBar
        title="Profile"
        subtitle="Account"
        leading={
          <View className="h-10 w-10 rounded-full bg-md-primaryContainer items-center justify-center">
            <Ionicons name="person" size={20} color="#EADDFF" />
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!user ? (
          <View className="items-center py-12">
            <View className="h-20 w-20 rounded-full bg-md-surfaceContainerHigh items-center justify-center mb-4">
              <Ionicons name="person-outline" size={38} color="#D0BCFF" />
            </View>
            <Text className="text-md-onSurface text-xl font-bold">Guest User</Text>
            <Text className="text-md-onSurfaceVariant text-xs text-center mt-1.5 max-w-xs leading-relaxed">
              Sign in to manage your ticket reservations and digital wallet.
            </Text>

            <MaterialButton
              variant="filled"
              label="Sign In / Register"
              className="mt-6 w-full"
              onPress={() => router.push('/auth/login')}
            />
          </View>
        ) : (
          <View>
            {/* User Profile Card (Material Elevated) */}
            <MaterialCard variant="elevated" className="items-center py-6 px-4">
              <View className="h-20 w-20 rounded-full bg-md-primaryContainer items-center justify-center mb-3 border-2 border-md-primary/40">
                <Text className="text-md-onPrimaryContainer font-bold text-2xl">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>

              <Text className="text-md-onSurface font-bold text-xl tracking-tight">{user.name}</Text>
              <Text className="text-md-onSurfaceVariant text-xs mt-0.5">{user.email}</Text>

              <MaterialBadge
                label={`Verified Fan ${user.role === 'ADMIN' ? '• Admin' : ''}`}
                variant="primary"
                className="mt-3 py-1 px-3"
              />
            </MaterialCard>

            {/* Stats Row */}
            <View className="flex-row mt-3.5 space-x-3">
              <MaterialCard variant="outlined" className="flex-1 items-center py-3.5 mr-2">
                <Text className="text-2xl font-bold text-md-primary">{stats.tickets}</Text>
                <Text className="text-md-onSurfaceVariant text-xs font-semibold mt-1">Concert Passes</Text>
              </MaterialCard>

              <MaterialCard variant="outlined" className="flex-1 items-center py-3.5">
                <Text className="text-2xl font-bold text-md-primary">{stats.bookings}</Text>
                <Text className="text-md-onSurfaceVariant text-xs font-semibold mt-1">Total Bookings</Text>
              </MaterialCard>
            </View>

            {/* Menu List (Material Outlined Card) */}
            <MaterialCard variant="outlined" className="mt-4 p-0 overflow-hidden">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/two')}
                className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-full bg-md-surfaceContainerHigh items-center justify-center mr-3">
                    <Ionicons name="ticket-outline" size={18} color="#D0BCFF" />
                  </View>
                  <Text className="text-md-onSurface font-medium text-sm">My Tickets & QR Passes</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#938F99" />
              </TouchableOpacity>

              <MaterialDivider />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/modal')}
                className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-full bg-md-surfaceContainerHigh items-center justify-center mr-3">
                    <Ionicons name="information-circle-outline" size={18} color="#D0BCFF" />
                  </View>
                  <Text className="text-md-onSurface font-medium text-sm">App Architecture & System Info</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#938F99" />
              </TouchableOpacity>

              <MaterialDivider />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogout}
                disabled={loading}
                className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-full bg-md-errorContainer/60 items-center justify-center mr-3">
                    <Ionicons name="log-out-outline" size={18} color="#F2B8B5" />
                  </View>
                  <Text className="text-md-error font-medium text-sm">Sign Out</Text>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#F2B8B5" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#938F99" />
                )}
              </TouchableOpacity>
            </MaterialCard>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
