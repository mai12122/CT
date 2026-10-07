import React from 'react';
import { View } from 'react-native';

/** Breathing placeholder block — matches the final content shape. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <View className={`animate-skeleton rounded-xl bg-card2 ${className}`} />;
}

/** Layout-shaped loading state for the Explore concert list. */
export function ConcertListSkeleton() {
  return (
    <View className="gap-4">
      {[0, 1, 2].map((i) => (
        <View key={i} className="bg-card border border-line rounded-2xl overflow-hidden flex-row">
          <Skeleton className="w-[110px] h-[132px] rounded-none" />
          <View className="flex-1 p-3.5 gap-2.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <View className="flex-row items-center justify-between mt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
