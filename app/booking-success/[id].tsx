import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BookingSuccessScreen() {
  const { bookingRef } = useLocalSearchParams<{ bookingRef?: string }>();

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center">
          {/* Animated celebration icon */}
          <View className="h-24 w-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={54} color="#10b981" />
          </View>

          <Text className="text-3xl font-black text-white text-center tracking-wide">
            Booking Confirmed!
          </Text>
          <Text className="text-slate-400 text-sm mt-2 text-center max-w-xs leading-relaxed">
            Your payment was successful and your tickets have been securely issued with verified QR codes.
          </Text>

          {/* Booking Ref Badge */}
          {bookingRef && (
            <View className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl py-3 px-5 items-center">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                Booking Reference
              </Text>
              <Text className="text-violet-400 font-mono font-extrabold text-base mt-0.5">
                {bookingRef}
              </Text>
            </View>
          )}

          {/* Features Checkmarks */}
          <View className="mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 w-full space-y-2.5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={18} color="#10b981" style={{ marginRight: 10 }} />
              <Text className="text-slate-300 text-xs">Official Anti-Counterfeit Encrypted QR Pass</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="phone-portrait-outline" size={18} color="#10b981" style={{ marginRight: 10 }} />
              <Text className="text-slate-300 text-xs">Saved in your digital wallet & Profile</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={18} color="#10b981" style={{ marginRight: 10 }} />
              <Text className="text-slate-300 text-xs">Confirmation receipt sent to your email</Text>
            </View>
          </View>

          {/* CTAs */}
          <View className="w-full mt-8 space-y-3">
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/two')}
              activeOpacity={0.85}
              className="bg-violet-600 hover:bg-violet-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-violet-600/40">
              <View className="flex-row items-center">
                <Ionicons name="qr-code" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-extrabold text-base">View Tickets & QR Pass</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
              className="border border-slate-800 bg-slate-900/50 py-3.5 rounded-2xl items-center justify-center mt-3">
              <Text className="text-slate-300 font-bold text-sm">Explore More Concerts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
