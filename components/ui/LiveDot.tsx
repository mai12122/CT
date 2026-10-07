import React from 'react';
import { View } from 'react-native';

/**
 * Pulsing live indicator. The inner dot breathes; an outer ring
 * expands and fades (skipped when the OS requests reduced motion).
 */
export function LiveDot({
  color = '#34D399',
  size = 8,
  reduced = false,
}: {
  color?: string;
  size?: number;
  reduced?: boolean;
}) {
  return (
    <View
      className="items-center justify-center"
      style={{ width: size * 2.4, height: size * 2.4 }}>
      {!reduced && (
        <View
          className="absolute rounded-full animate-live-ring"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            backgroundColor: color,
          }}
        />
      )}
      <View
        className="rounded-full animate-live-pulse"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </View>
  );
}
