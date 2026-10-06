import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface MaterialBadgeProps {
  label?: string | number;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
  size?: 'small' | 'medium';
  className?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const MaterialBadge: React.FC<MaterialBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  className = '',
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-md-secondaryContainer text-md-onSecondaryContainer';
      case 'tertiary':
        return 'bg-md-tertiaryContainer text-md-onTertiaryContainer';
      case 'error':
        return 'bg-md-errorContainer text-md-onErrorContainer';
      case 'success':
        return 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300';
      case 'primary':
      default:
        return 'bg-md-primaryContainer text-md-onPrimaryContainer';
    }
  };

  if (!label && size === 'small') {
    return (
      <View
        className={`h-2 w-2 rounded-full ${
          variant === 'error' ? 'bg-md-error' : 'bg-md-primary'
        } ${className}`}
        style={style}
      />
    );
  }

  return (
    <View
      className={`px-2 py-0.5 rounded-full items-center justify-center self-start ${getVariantStyles()} ${className}`}
      style={style}>
      <Text
        className={`text-[10px] font-bold tracking-wider uppercase ${
          variant === 'success' ? 'text-emerald-300' : ''
        }`}
        style={textStyle}>
        {label}
      </Text>
    </View>
  );
};
