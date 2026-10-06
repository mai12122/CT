import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MaterialTextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  isPassword?: boolean;
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const MaterialTextField: React.FC<MaterialTextFieldProps> = ({
  label,
  error,
  leadingIcon,
  trailingIcon,
  isPassword = false,
  className = '',
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  const getBorderColor = () => {
    if (error) return 'border-md-error';
    if (isFocused) return 'border-md-primary';
    return 'border-md-outlineVariant';
  };

  return (
    <View className={`mb-4 ${className}`} style={containerStyle}>
      {label && (
        <Text
          className={`text-xs font-semibold mb-1.5 ml-1 ${
            error
              ? 'text-md-error'
              : isFocused
              ? 'text-md-primary'
              : 'text-md-onSurfaceVariant'
          }`}>
          {label}
        </Text>
      )}

      <View
        className={`h-13 bg-md-surfaceContainerLow rounded-md-md border flex-row items-center px-3.5 transition-colors ${getBorderColor()}`}>
        {leadingIcon && <View className="mr-3">{leadingIcon}</View>}

        <TextInput
          placeholderTextColor="#938F99"
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-sm text-md-onSurface py-2.5 h-full"
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setHidePassword(!hidePassword)}
            className="p-1.5 ml-1">
            <Ionicons
              name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#CAC4D0"
            />
          </TouchableOpacity>
        ) : trailingIcon ? (
          <View className="ml-2">{trailingIcon}</View>
        ) : null}
      </View>

      {error && (
        <View className="flex-row items-center mt-1.5 ml-1">
          <Ionicons name="alert-circle" size={14} color="#F2B8B5" />
          <Text className="text-xs text-md-error ml-1 font-medium">{error}</Text>
        </View>
      )}
    </View>
  );
};
