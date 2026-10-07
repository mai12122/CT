import React from 'react';
import { Image, View } from 'react-native';

interface BrandLogoProps {
  size: number;
}

export function BrandLogo({ size }: BrandLogoProps) {
  return (
    <View
      className="rounded-full border-2 border-iris-400/60 bg-iris-500/20 p-0.5 hover:scale-105 active:scale-95"
      style={{
        width: size,
        height: size,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 9,
        elevation: 4,
      }}>
      <Image
        accessibilityIgnoresInvertColors
        accessible={false}
        source={require('@/assets/images/logo.png')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: 1,
          borderRadius: size / 2,
        }}
      />
    </View>
  );
}
