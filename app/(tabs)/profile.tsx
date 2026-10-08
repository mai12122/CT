import React, { useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { AppHeader } from '@/components/AppHeader';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

export default function ProfileScreen() {
  const { user, logout, login } = useAuth();
  const [customName, setCustomName] = useState<string | null>(null);
  const [stats, setStats] = useState<{ bookings: number; tickets: number }>({
    bookings: 0,
    tickets: 0,
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api
        .getMe()
        .then((data) => {
          if (data?._count) {
            setStats({
              bookings: data._count.bookings || 0,
              tickets: data._count.tickets || 0,
            });
          }
        })
        .catch(() => {});
    }, [user])
  );

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Event Pass?', [
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

  const handleQuickDemoLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      await login('user@example.com', 'password123');
    } catch (err: any) {
      Alert.alert('Demo Sign-In Failed', err.message || 'Could not sign in with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      <AppHeader title="Profile" subtitle="ACCOUNT & WALLET" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}>
        {!user ? (
          /* Guest Experience */
          <View className="pt-4">
            <View className="bg-card border border-line rounded-3xl p-6 items-center shadow-lg">
              <View className="h-20 w-20 rounded-3xl bg-iris-500/15 border border-iris-500/40 items-center justify-center mb-4 shadow-sm shadow-iris-500/30">
                <Ionicons name="person-circle-outline" size={44} color="#C4B5FD" />
              </View>
              <Text className="text-white text-2xl font-black tracking-tight">Guest Account</Text>
              <Text className="text-mist text-[13px] text-center mt-1.5 max-w-[270px] leading-5">
                Sign in to manage your ticket reservations, access QR passes, and unlock fast 10-minute seat holds.
              </Text>

              {/* Quick 1-Tap Demo Button */}
              <TouchableOpacity
                onPress={handleQuickDemoLogin}
                activeOpacity={0.85}
                disabled={loading}
                className="mt-6 bg-iris-500 border border-iris-400/30 py-3.5 px-6 rounded-2xl w-full flex-row items-center justify-center shadow-md shadow-iris-500/30 active:scale-[0.98]">
                <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-sm">
                  {loading ? 'Signing in…' : '1-Tap Demo Sign In (user@example.com)'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3 w-full mt-3">
                <TouchableOpacity
                  onPress={() => router.push('/auth/login')}
                  activeOpacity={0.8}
                  className="flex-1 bg-card2 border border-line py-3 rounded-2xl items-center active:opacity-80">
                  <Text className="text-white font-bold text-[13px]">Email Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/auth/register')}
                  activeOpacity={0.8}
                  className="flex-1 bg-card2 border border-line py-3 rounded-2xl items-center active:opacity-80">
                  <Text className="text-slate-300 font-semibold text-[13px]">Register</Text>
                </TouchableOpacity>
              </View>

              <View className="w-full mt-5 pt-5 border-t border-line/80">
                <SocialAuthButtons
                  onSuccess={() => {}}
                  onError={(msg) => Alert.alert('Sign-In Error', msg)}
                />
              </View>
            </View>
          </View>
        ) : (
          /* Authenticated User Experience */
          <View className="gap-4">
            {/* User Profile Hero Card matching exact design */}
            <View className="bg-card border border-line rounded-3xl p-5 shadow-lg">
              <View className="flex-row items-center">
                {/* Avatar with Verified checkmark and online status */}
                <View className="relative mr-4">
                  <View className="h-16 w-16 rounded-full bg-iris-500 items-center justify-center shadow-md shadow-iris-500/30">
                    <Text className="text-white text-2xl font-black">
                      {(customName || user.name || 'M')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 items-center justify-center border-2 border-night">
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                  <View className="absolute bottom-0 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-night" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center flex-wrap gap-2">
                    <Text className="text-white font-black text-2xl tracking-tight" numberOfLines={1}>
                      {customName || user.name || 'Mao'}
                    </Text>
                    <View className="bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      <Text className="text-indigo-300 font-bold text-[10px] uppercase tracking-wider">
                        USER
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.prompt(
                          'Change Name',
                          'Enter your new display name:',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Save',
                              onPress: (val?: string) => {
                                if (val && val.trim()) {
                                  setCustomName(val.trim());
                                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                }
                              },
                            },
                          ],
                          'plain-text',
                          customName || user.name || 'Mao'
                        );
                      }}
                      className="bg-white/10 px-2 py-1 rounded-lg">
                      <Text className="text-slate-300 text-[10px] font-bold">Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-amber-400 font-bold text-xs">★ VIP Gold Pass</Text>
                    <Text className="text-slate-500 text-xs mx-1.5">•</Text>
                    <Text className="text-amber-400 font-bold text-xs">Member #KH-0842</Text>
                  </View>
                  <Text className="text-slate-500 text-[11px] mt-0.5">Member since 2024</Text>
                </View>
              </View>
            </View>

            {/* Stats Bento Grid matching 3 cards */}
            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-card border border-line rounded-2xl p-3.5 justify-between">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">
                    ACTIVE PASSES
                  </Text>
                  <Ionicons name="ticket-outline" size={14} color="#60A5FA" />
                </View>
                <Text className="text-white font-black text-2xl">{stats.tickets || 0}</Text>
                <Text className="text-slate-500 text-[10px] mt-0.5 font-semibold">In Wallet</Text>
              </View>

              <View className="flex-1 bg-card border border-line rounded-2xl p-3.5 justify-between">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">
                    AUTH SCORE
                  </Text>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#34D399" />
                </View>
                <Text className="text-white font-black text-2xl">98%</Text>
                <Text className="text-slate-500 text-[10px] mt-0.5 font-semibold">Excellent</Text>
              </View>

              <View className="flex-1 bg-card border border-line rounded-2xl p-3.5 justify-between">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">
                    VENUE ACCESS
                  </Text>
                  <Ionicons name="globe-outline" size={14} color="#FBBF24" />
                </View>
                <Text className="text-white font-black text-2xl">ALL</Text>
                <Text className="text-slate-500 text-[10px] mt-0.5 font-semibold">Global</Text>
              </View>
            </View>

            {/* Phone Verification Card */}
            <View className="bg-card border border-line rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-white font-bold text-sm">Phone Verification</Text>
                <View className="bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#34D399" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-400 font-bold text-[11px]">Verified</Text>
                </View>
              </View>
              <View className="bg-black/30 border border-white/5 rounded-xl p-3 flex-row items-center">
                <Ionicons name="call" size={16} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text className="text-white font-bold text-sm tracking-wider">
                  {user.phone || '+85517864121'}
                </Text>
              </View>
            </View>

            {/* Quick Actions List */}
            <View className="bg-card border border-line rounded-3xl overflow-hidden shadow-sm">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/two')}
                activeOpacity={0.7}
                className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 rounded-xl bg-iris-500/15 items-center justify-center mr-3">
                    <Ionicons name="wallet-outline" size={18} color="#C4B5FD" />
                  </View>
                  <Text className="text-white font-bold text-sm">My Ticket Passes & Wallet</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#5D6A8C" />
              </TouchableOpacity>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="bg-rose-500/10 border border-rose-500/30 py-3.5 rounded-2xl items-center flex-row justify-center active:bg-rose-500/20">
              <Ionicons name="log-out-outline" size={18} color="#FB7185" style={{ marginRight: 8 }} />
              <Text className="text-rose-400 font-bold text-sm">Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
