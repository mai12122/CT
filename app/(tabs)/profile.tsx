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
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="pt-14 pb-4 px-5 bg-slate-950/80 border-b border-slate-900">
        <Text className="text-xs font-bold text-violet-400 tracking-widest uppercase">
          ACCOUNT
        </Text>
        <Text className="text-xl font-extrabold text-white">My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {!user ? (
          <View className="items-center py-12">
            <View className="h-20 w-20 rounded-full bg-violet-600/10 border border-violet-500/30 items-center justify-center mb-4">
              <Ionicons name="person-outline" size={40} color="#a78bfa" />
            </View>
            <Text className="text-white text-xl font-black">Guest User</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 max-w-xs">
              Sign in to manage your ticket reservations, access passes, and unlock exclusive fan perks.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.85}
              className="mt-6 bg-violet-600 px-8 py-3.5 rounded-2xl w-full items-center shadow-lg shadow-violet-600/40">
              <Text className="text-white font-extrabold text-sm">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              activeOpacity={0.8}
              className="mt-3 bg-slate-900 border border-slate-800 px-8 py-3.5 rounded-2xl w-full items-center">
              <Text className="text-slate-200 font-bold text-sm">Create New Account (Sign Up)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* User Card */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 items-center">
              <View className="h-20 w-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 items-center justify-center mb-3 border-2 border-violet-400/40">
                <Text className="text-white font-black text-2xl">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>

              <Text className="text-white font-black text-xl">{user.name}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{user.email}</Text>

              <View className="mt-3 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full">
                <Text className="text-violet-300 font-bold text-[11px] uppercase tracking-wider">
                  Verified Fan {user.role === 'ADMIN' ? '• Admin' : ''}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row mt-4 space-x-3">
              <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 items-center mr-2">
                <Text className="text-2xl font-black text-white">{stats.tickets}</Text>
                <Text className="text-slate-400 text-xs font-semibold mt-1">Concert Passes</Text>
              </View>

              <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 items-center">
                <Text className="text-2xl font-black text-white">{stats.bookings}</Text>
                <Text className="text-slate-400 text-xs font-semibold mt-1">Total Bookings</Text>
              </View>
            </View>

            {/* Menu List */}
            <View className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/two')}
                className="p-4 flex-row items-center justify-between border-b border-slate-800">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-xl bg-violet-600/20 items-center justify-center mr-3">
                    <Ionicons name="ticket" size={18} color="#a78bfa" />
                  </View>
                  <Text className="text-white font-semibold text-sm">My Tickets & QR Passes</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/modal')}
                className="p-4 flex-row items-center justify-between border-b border-slate-800">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-xl bg-emerald-600/20 items-center justify-center mr-3">
                    <Ionicons name="shield-checkmark" size={18} color="#34d399" />
                  </View>
                  <Text className="text-white font-semibold text-sm">System & Ticketing Info</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                disabled={loading}
                className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-xl bg-rose-600/20 items-center justify-center mr-3">
                    <Ionicons name="log-out" size={18} color="#f43f5e" />
                  </View>
                  <Text className="text-rose-400 font-semibold text-sm">Sign Out</Text>
                </View>
                {loading ? <ActivityIndicator size="small" color="#f43f5e" /> : <Ionicons name="chevron-forward" size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
