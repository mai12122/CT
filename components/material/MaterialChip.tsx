import React from 'react';
import { TouchableOpacity, Text, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MaterialChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leadingIcon?: React.ReactNode;
  showCheckmark?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const MaterialChip: React.FC<MaterialChipProps> = ({
  label,
  selected = false,
  onPress,
  leadingIcon,
  showCheckmark = true,
  className = '',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={style}
      className={`h-8 px-3.5 rounded-md-sm flex-row items-center justify-center mr-2 mb-2 ${
        selected
          ? 'bg-md-secondaryContainer border border-transparent'
          : 'bg-transparent border border-md-outlineVariant'
      } ${className}`}>
      {selected && showCheckmark ? (
        <Ionicons
          name="checkmark"
          size={16}
          color="#E8DEF8"
          style={{ marginRight: 6 }}
        />
      ) : leadingIcon ? (
        <View style={{ marginRight: 6 }}>{leadingIcon}</View>
      ) : null}
      <Text
        className={`text-xs ${
          selected
            ? 'text-md-onSecondaryContainer font-semibold'
            : 'text-md-onSurfaceVariant font-medium'
        }`}
        style={textStyle}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
