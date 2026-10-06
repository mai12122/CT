import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Concert, TicketCategory } from '@/types';
import {
  MaterialCard,
  MaterialButton,
  MaterialBadge,
} from '@/components/material';

export default function ConcertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let active = true;
      api.getConcertById(id as string).then((data) => {
        if (!active) return;
        setConcert(data);
        if (data.categories?.length > 0) {
          const availableCat = data.categories.find((c: TicketCategory) => c.available > 0) || data.categories[0];
          setSelectedCategory(availableCat);
        }
      }).catch((err: any) => {
        if (active) Alert.alert('Error', err.message || 'Could not load concert details.');
      }).finally(() => {
        if (active) setLoading(false);
      });

      return () => {
        active = false;
      };
    }, [id])
  );

  const handleReserve = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to reserve concert passes.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a ticket tier.');
      return;
    }

    if (selectedCategory.available < quantity) {
      Alert.alert(
        'Insufficient Availability',
        `Only ${selectedCategory.available} ticket(s) are currently available in ${selectedCategory.name}.`
      );
      return;
    }

    setReserving(true);
    try {
      const data = await api.createReservation(selectedCategory.id, quantity);
      router.push(`/reservation/${data.session.id}` as any);
    } catch (err: any) {
      if (err.message && err.message.includes('already have an active reservation')) {
        Alert.alert(
          'Active Hold Exists',
          err.message,
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Go to Reservations',
              onPress: async () => {
                const sessions = await api.getMyActiveReservations();
                const matched = sessions.find((s) => s.categoryId === selectedCategory.id) || sessions[0];
                if (matched) {
                  router.push(`/reservation/${matched.id}` as any);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Reservation Failed', err.message || 'Could not hold tickets. Please try again.');
      }
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-md-surface items-center justify-center">
        <ActivityIndicator size="large" color="#D0BCFF" />
        <Text className="text-md-onSurfaceVariant text-sm mt-3 font-medium">Loading concert details...</Text>
      </View>
    );
  }

  if (!concert) {
    return (
      <View className="flex-1 bg-md-surface items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#F2B8B5" />
        <Text className="text-md-onSurface text-lg font-bold mt-3">Concert Not Found</Text>
        <MaterialButton
          variant="filled"
          label="Go Back"
          className="mt-4"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const concertDate = new Date(concert.date);
  const formattedDate = concertDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = concertDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = selectedCategory ? selectedCategory.price * quantity : 0;

  return (
    <View className="flex-1 bg-md-surface">
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover Photo */}
        <View className="relative">
          <Image
            source={{ uri: concert.imageUrl }}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />

          {/* Floating Actions on Cover */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-10">
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.back()}
              className="h-10 w-10 rounded-full bg-md-surface/80 items-center justify-center border border-md-outlineVariant/30">
              <Ionicons name="arrow-back" size={20} color="#E6E0E9" />
            </TouchableOpacity>

            <MaterialBadge
              label={`${concert.totalAvailable} Left`}
              variant="success"
              className="py-1 px-3"
            />
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          <Text className="text-xs font-bold text-md-primary uppercase tracking-widest">
            {concert.city} • STADIUM TOUR
          </Text>
          <Text className="text-2xl font-bold text-md-onSurface tracking-tight mt-1">{concert.artist}</Text>
          <Text className="text-md-onSurfaceVariant text-base font-medium mt-0.5">{concert.title}</Text>

          {/* Date & Location Pill Cards */}
          <View className="flex-row mt-4 space-x-2">
            <MaterialCard variant="outlined" className="flex-1 p-3 flex-row items-center mr-2">
              <View className="h-9 w-9 rounded-full bg-md-primaryContainer items-center justify-center mr-2.5">
                <Ionicons name="calendar-outline" size={18} color="#EADDFF" />
              </View>
              <View className="flex-1">
                <Text className="text-md-onSurfaceVariant text-[10px] uppercase font-semibold">Event Date</Text>
                <Text numberOfLines={1} className="text-md-onSurface font-bold text-xs">
                  {formattedDate}
                </Text>
                <Text className="text-md-onSurfaceVariant text-[11px]">{formattedTime}</Text>
              </View>
            </MaterialCard>

            <MaterialCard variant="outlined" className="flex-1 p-3 flex-row items-center">
              <View className="h-9 w-9 rounded-full bg-md-secondaryContainer items-center justify-center mr-2.5">
                <Ionicons name="location-outline" size={18} color="#E8DEF8" />
              </View>
              <View className="flex-1">
                <Text className="text-md-onSurfaceVariant text-[10px] uppercase font-semibold">Venue</Text>
                <Text numberOfLines={1} className="text-md-onSurface font-bold text-xs">
                  {concert.venue}
                </Text>
                <Text numberOfLines={1} className="text-md-onSurfaceVariant text-[11px]">
                  {concert.city}
                </Text>
              </View>
            </MaterialCard>
          </View>

          {/* Description */}
          <View className="mt-5">
            <Text className="text-md-onSurface text-base font-bold mb-2">About The Experience</Text>
            <Text className="text-md-onSurfaceVariant text-sm leading-relaxed font-normal">
              {concert.description}
            </Text>
          </View>

          {/* Ticket Tier Category Selector */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-md-onSurface text-base font-bold">Select Seating Tier</Text>
              <Text className="text-md-onSurfaceVariant text-xs">Real-time availability</Text>
            </View>

            <View>
              {concert.categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                const isSoldOut = category.available <= 0;

                return (
                  <MaterialCard
                    key={category.id}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onPress={() => !isSoldOut && setSelectedCategory(category)}
                    className={`mb-3 p-4 border transition-all ${
                      isSelected
                        ? 'border-md-primary bg-md-primaryContainer/15'
                        : isSoldOut
                        ? 'border-md-outlineVariant/20 opacity-50 bg-md-surface'
                        : 'border-md-outlineVariant/30 bg-md-surface'
                    }`}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: category.color }}
                          className="h-3 w-3 rounded-full mr-2.5"
                        />
                        <Text className="text-md-onSurface font-bold text-base">{category.name}</Text>
                      </View>

                      <View className="flex-row items-center">
                        <Text className="text-md-onSurface font-bold text-lg mr-2.5">
                          ${category.price}
                        </Text>
                        <MaterialBadge
                          label={isSoldOut ? 'Sold Out' : `${category.available} Available`}
                          variant={isSoldOut ? 'error' : 'success'}
                        />
                      </View>
                    </View>

                    {category.description && (
                      <Text className="text-md-onSurfaceVariant text-xs mb-2">{category.description}</Text>
                    )}

                    {/* Perks List */}
                    {category.perks && category.perks.length > 0 && (
                      <View className="pt-2 border-t border-md-outlineVariant/20">
                        {category.perks.map((perk, idx) => (
                          <View key={idx} className="flex-row items-center mt-1">
                            <Ionicons name="checkmark-circle" size={13} color="#D0BCFF" style={{ marginRight: 6 }} />
                            <Text className="text-md-onSurfaceVariant text-xs">{perk}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </MaterialCard>
                );
              })}
            </View>
          </View>

          {/* Quantity Selector */}
          {selectedCategory && (
            <MaterialCard variant="outlined" className="mt-3 p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-md-onSurface font-bold text-sm">Number of Tickets</Text>
                <Text className="text-md-onSurfaceVariant text-xs">Maximum 6 tickets per order</Text>
              </View>

              <View className="flex-row items-center bg-md-surfaceContainerHigh rounded-full p-1 border border-md-outlineVariant/30">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={`h-8 w-8 rounded-full items-center justify-center ${
                    quantity <= 1 ? 'opacity-30' : 'bg-md-surfaceContainerLowest'
                  }`}>
                  <Ionicons name="remove" size={16} color="#E6E0E9" />
                </TouchableOpacity>

                <Text className="text-md-onSurface font-bold text-sm w-9 text-center">
                  {quantity}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setQuantity((q) => Math.min(Math.min(6, selectedCategory.available), q + 1))
                  }
                  disabled={quantity >= 6 || quantity >= selectedCategory.available}
                  className={`h-8 w-8 rounded-full items-center justify-center ${
                    quantity >= 6 || quantity >= selectedCategory.available
                      ? 'opacity-30'
                      : 'bg-md-primary'
                  }`}>
                  <Ionicons name="add" size={16} color="#381E72" />
                </TouchableOpacity>
              </View>
            </MaterialCard>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-md-surfaceContainer/95 border-t border-md-outlineVariant/30 p-4 pb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-md-onSurfaceVariant text-[10px] uppercase font-semibold">Total Estimated</Text>
          <View className="flex-row items-baseline">
            <Text className="text-md-onSurface font-bold text-2xl">${subtotal}</Text>
            {selectedCategory && (
              <Text className="text-md-onSurfaceVariant text-xs ml-1.5 font-medium">
                ({quantity}x {selectedCategory.name})
              </Text>
            )}
          </View>
        </View>

        <MaterialButton
          variant="filled"
          label={reserving ? 'Reserving...' : 'Reserve 10-Min Hold'}
          loading={reserving}
          disabled={reserving || !selectedCategory || selectedCategory.available <= 0}
          icon={!reserving ? <Ionicons name="time-outline" size={18} color="#381E72" /> : undefined}
          className="h-12 px-6"
          onPress={handleReserve}
        />
      </View>
    </View>
  );
}
