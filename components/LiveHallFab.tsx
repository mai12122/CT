import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from 'react-native-reanimated';
import { LiveDot } from '@/components/ui/LiveDot';

/**
 * Floating entry point to the CT Live Hall.
 * Refined agency-grade floating action capsule with subtle glow,
 * haptic feedback, and responsive keyboard dismissal.
 */
export function LiveHallFab({ bottomOffset }: { bottomOffset: number }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/live-hall');
  };

  return (
    <Pressable
      onPress={open}
      hitSlop={10}
      pressRetentionOffset={20}
      className="absolute right-5 flex-row items-center h-12 rounded-full bg-blue-600 border border-white/20 px-4 active:scale-95 transition-transform"
      style={{
        bottom: bottomOffset,
        shadowColor: '#2563EB',
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }}>
      <View className="h-6 w-6 rounded-full bg-white/15 items-center justify-center mr-2">
        <LiveDot reduced={reduced} color="#FFFFFF" size={7} />
      </View>
      <Text className="text-white text-[13px] font-bold tracking-wide">Live Hall</Text>
    </Pressable>
  );
}
