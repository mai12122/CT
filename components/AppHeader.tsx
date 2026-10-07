import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
      style={{ paddingTop: insets.top + 8 }}
      className="px-5 pb-3.5 flex-row items-center justify-between border-b border-line/80 bg-night/95 backdrop-blur-md">
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
            className="flex-row items-center active:opacity-85">
            <View className="flex-row items-center gap-2.5">
              <Image
                source={require('@/assets/images/logo.png')}
                style={{ width: 108, height: 32 }}
                resizeMode="contain"
              />
              <View className="flex-row items-center bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                <View className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5" />
                <Text className="text-blue-300 font-bold text-[9px] tracking-wider uppercase">
                  LIVE PASSES
                </Text>
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
      className="flex-row items-center bg-card border border-line rounded-full py-1.5 px-3 active:scale-95 transition-transform">
      <View className="h-6 w-6 rounded-full bg-iris-500 items-center justify-center mr-2 shadow-sm shadow-iris-500/40">
        <Text className="text-white text-xs font-bold">{name ? name[0].toUpperCase() : 'U'}</Text>
      </View>
      <Text className="text-slate-200 text-xs font-semibold">{name ? name.split(' ')[0] : 'Account'}</Text>
    </Pressable>
  );
}
