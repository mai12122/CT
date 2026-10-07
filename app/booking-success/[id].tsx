import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function BookingSuccessScreen() {
  const { bookingRef } = useLocalSearchParams<{ bookingRef?: string }>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View className="flex-1 bg-night">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center">
          {/* Glowing Success Aura */}
          <View className="h-24 w-24 rounded-full bg-emerald-500/15 border border-emerald-500/40 items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
            <Ionicons name="checkmark-sharp" size={48} color="#34D399" />
          </View>

          <Text className="text-3xl font-black text-white text-center tracking-[-0.02em]">
            Booking Confirmed!
          </Text>
          <Text className="text-mist text-sm mt-2 text-center max-w-[290px] leading-relaxed">
            Your concert passes are verified, issued with encrypted QR codes, and ready in your wallet.
          </Text>

          {bookingRef ? (
            <View className="mt-6 bg-card border border-line rounded-2xl py-3.5 px-6 items-center shadow-md">
              <Text className="text-dim text-[10px] uppercase font-bold tracking-[0.16em]">
                Booking Reference
              </Text>
              <Text className="text-iris-300 font-mono font-black text-lg mt-1 tracking-wider">
                {bookingRef}
              </Text>
            </View>
          ) : null}

          {/* Verification Pillars Card */}
          <View className="mt-8 bg-card border border-line rounded-3xl p-5 w-full gap-3.5 shadow-lg">
            <View className="flex-row items-center">
              <View className="h-8 w-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={17} color="#34D399" />
              </View>
              <Text className="text-slate-200 text-xs font-semibold flex-1">
                Encrypted QR turnstile pass saved & secured
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-8 w-8 rounded-xl bg-iris-500/15 items-center justify-center mr-3">
                <Ionicons name="phone-portrait-outline" size={17} color="#C4B5FD" />
              </View>
              <Text className="text-slate-200 text-xs font-semibold flex-1">
                Offline access enabled in your mobile wallet
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-8 w-8 rounded-xl bg-sky-500/15 items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={17} color="#38BDF8" />
              </View>
              <Text className="text-slate-200 text-xs font-semibold flex-1">
                Tax invoice & confirmation emailed to your account
              </Text>
            </View>
          </View>

          {/* Action Navigation Buttons */}
          <View className="w-full mt-8 gap-3">
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/two')}
              activeOpacity={0.85}
              className="bg-iris-500 border border-iris-400/30 py-4 rounded-2xl items-center justify-center shadow-lg shadow-iris-500/35 active:scale-[0.98] transition-transform">
              <View className="flex-row items-center">
                <Ionicons name="qr-code" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-[15px] tracking-wide">
                  View Tickets & QR Pass
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.8}
              className="border border-line bg-card py-3.5 rounded-2xl items-center justify-center active:bg-card2">
              <Text className="text-slate-300 font-bold text-sm">Explore More Concerts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
