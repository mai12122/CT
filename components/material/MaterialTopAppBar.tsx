import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export interface MaterialTopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const MaterialTopAppBar: React.FC<MaterialTopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  leading,
  trailing,
  className = '',
  style,
}) => {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`pt-12 pb-3 px-4 bg-md-surface/95 border-b border-md-outlineVariant/20 flex-row items-center justify-between z-10 ${className}`}
      style={style}>
      <View className="flex-row items-center flex-1 pr-3">
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            className="h-10 w-10 rounded-full items-center justify-center mr-2 bg-md-surfaceContainerHigh/60">
            <Ionicons name="arrow-back" size={22} color="#E6E0E9" />
          </TouchableOpacity>
        ) : leading ? (
          <View className="mr-3">{leading}</View>
        ) : null}

        <View className="flex-1">
          {subtitle && (
            <Text className="text-[10px] font-bold text-md-primary tracking-widest uppercase mb-0.5">
              {subtitle}
            </Text>
          )}
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-md-onSurface tracking-tight">
            {title}
          </Text>
        </View>
      </View>

      {trailing && <View className="flex-row items-center">{trailing}</View>}
    </View>
  );
};
