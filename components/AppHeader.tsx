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
      style={{
        paddingTop: insets.top + 8,
        backgroundColor: 'rgba(11, 16, 32, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      } as any}
      className="px-5 pb-3.5 flex-row items-center justify-between border-b border-line/60">
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
              <View
                style={{
                  shadowColor: '#8b5cf6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                className="rounded-full border-[2px] border-iris-500/40">
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 36, height: 36, borderRadius: 18, aspectRatio: 1 }}
                  resizeMode="cover"
                />
              </View>
              <View className="justify-center">
                <Text className="text-white font-black text-base tracking-tight leading-5">
                  Bassac Live
                </Text>
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
                    <Text className="text-emerald-300 font-bold text-[8px] tracking-wider uppercase">
                      PHNOM PENH
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-iris-500/10 border border-iris-500/30 px-1.5 py-0.5 rounded-full">
                    <Text className="text-iris-300 font-bold text-[8px] tracking-wider uppercase">
                      WORLDWIDE
                    </Text>
                  </View>
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
