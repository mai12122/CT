import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BrandLogo } from '@/components/BrandLogo';

export interface AppHeaderProps {
  right?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * Revamped App Header based on the CT Live Concerts brand identity:
 * - Official CT Concert Ticketing logo asset
 * - Live Passes pulse indicator badge
 */
export function AppHeader({ right, showBack, onBack, title, subtitle }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        backgroundColor: 'rgba(11, 16, 32, 0.68)',
      }}
      className="relative flex-row items-center justify-between overflow-hidden border-b border-line/70 px-4 pb-3.5">
      <BlurView
        intensity={65}
        tint="dark"
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className="flex-row items-center flex-1 mr-3">
        {showBack ? (
          <TouchableOpacity
            onPress={onBack || (() => router.back())}
            activeOpacity={0.7}
            className="h-10 w-10 rounded-2xl bg-card border border-line items-center justify-center mr-3 active:scale-95">
            <Ionicons name="arrow-back" size={18} color="#F1F4FA" />
          </TouchableOpacity>
        ) : null}

        {title ? (
          <View className="flex-1">
            {subtitle ? (
              <Text className="text-iris-300 font-bold text-[10px] tracking-[0.16em] uppercase">
                {subtitle}
              </Text>
            ) : null}
            <Text className="text-white font-black text-[20px] tracking-tight leading-6" numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Bassac Live home"
            className="flex-row items-center active:opacity-85">
            <View className="flex-row items-center gap-2">
              <BrandLogo size={34} />
              <View className="justify-center">
                <Text className="text-white font-black text-[15px] tracking-tight leading-5">
                  Bassac Live
                </Text>
                <View className="mt-0.5 flex-row items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 self-start">
                  <View className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <Text
                    numberOfLines={1}
                    className="text-emerald-300 font-bold uppercase text-[7px] tracking-[0.04em] sm:text-[8px] sm:tracking-wider">
                    PHNOM PENH & WORLDWIDE
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {right}
    </View>
  );
}

/** Avatar chip used when signed in */
export function HeaderAvatar({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name || 'account'} profile`}
      className="flex-row items-center bg-card border border-line rounded-full py-1.5 px-3 active:scale-95 transition-transform">
      <View className="relative mr-2">
        <View className="h-6 w-6 rounded-full bg-iris-500 border border-iris-400 items-center justify-center shadow-sm shadow-iris-500/40">
          <Text className="text-white text-xs font-bold">{name ? name[0].toUpperCase() : 'U'}</Text>
        </View>
        <View className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-[1.5px] border-card" />
      </View>
      <Text className="text-slate-200 text-xs font-semibold mr-1">{name ? name.split(' ')[0] : 'Account'}</Text>
      <Ionicons name="chevron-down" size={12} color="#93A0BE" />
    </Pressable>
  );
}
