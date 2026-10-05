import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { MD3Elevation } from '@/constants/MaterialTheme';

export interface MaterialCardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  variant = 'elevated',
  onPress,
  className = '',
  style,
  children,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return 'bg-md-surfaceContainerHighest border-0';
      case 'outlined':
        return 'bg-md-surface border border-md-outlineVariant';
      case 'elevated':
      default:
        return 'bg-md-surfaceContainerLow border-0';
    }
  };

  const elevationStyle = variant === 'elevated' ? MD3Elevation.level1 : undefined;
  const baseClasses = `rounded-md-xl p-4 overflow-hidden ${getVariantStyles()} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        className={baseClasses}
        style={[elevationStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={baseClasses} style={[elevationStyle, style]}>
      {children}
    </View>
  );
};
