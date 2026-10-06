import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MD3Elevation } from '@/constants/MaterialTheme';

export interface MaterialButtonProps extends TouchableOpacityProps {
  variant?: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
  label: string;
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  variant = 'filled',
  label,
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  className = '',
  labelStyle,
  style,
  onPress,
  ...props
}) => {
  const getContainerStyles = () => {
    if (disabled) {
      return variant === 'text'
        ? 'bg-transparent'
        : 'bg-md-onSurface/12 border-0';
    }

    switch (variant) {
      case 'filled':
        return 'bg-md-primary border-0';
      case 'elevated':
        return 'bg-md-surfaceContainerLow border-0';
      case 'tonal':
        return 'bg-md-secondaryContainer border-0';
      case 'outlined':
        return 'bg-transparent border border-md-outline';
      case 'text':
        return 'bg-transparent border-0 px-3';
      default:
        return 'bg-md-primary border-0';
    }
  };

  const getLabelStyles = () => {
    if (disabled) {
      return 'text-md-onSurface/38';
    }

    switch (variant) {
      case 'filled':
        return 'text-md-onPrimary';
      case 'elevated':
      case 'outlined':
      case 'text':
        return 'text-md-primary';
      case 'tonal':
        return 'text-md-onSecondaryContainer';
      default:
        return 'text-md-onPrimary';
    }
  };

  const elevationStyle =
    variant === 'elevated' && !disabled ? MD3Elevation.level1 : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={disabled || loading}
      onPress={onPress}
      style={[elevationStyle, style]}
      className={`h-11 min-w-[72px] px-5 rounded-full flex-row items-center justify-center ${getContainerStyles()} ${className}`}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? '#381E72' : '#D0BCFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === 'leading' && (
            <View className="mr-2">{icon}</View>
          )}
          <Text
            className={`text-sm font-semibold tracking-wide ${getLabelStyles()}`}
            style={labelStyle}>
            {label}
          </Text>
          {icon && iconPosition === 'trailing' && (
            <View className="ml-2">{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
