import React from 'react';
import { View, ViewProps } from 'react-native';

export interface MaterialDividerProps extends ViewProps {
  inset?: boolean;
  className?: string;
}

export const MaterialDivider: React.FC<MaterialDividerProps> = ({
  inset = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <View
      className={`h-[1px] bg-md-outlineVariant/30 ${
        inset ? 'mx-4' : 'w-full'
      } ${className}`}
      style={style}
      {...props}
    />
  );
};
