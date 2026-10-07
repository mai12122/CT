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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LiveDot } from '@/components/ui/LiveDot';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Concert, TicketCategory } from '@/types';

export default function ConcertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let active = true;
      api
        .getConcertById(id as string)
        .then((data) => {
          if (!active) return;
          setConcert(data);
          if (data.categories?.length > 0) {
            const availableCat =
              data.categories.find((c: TicketCategory) => c.available > 0) || data.categories[0];
            setSelectedCategory(availableCat);
          }
        })
        .catch((err: any) => {
          if (active) Alert.alert('Error', err.message || 'Could not load concert details.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [id])
  );

  const handleCategorySelect = (category: TicketCategory) => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
  };

  const handleQuantityChange = (newQty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity(newQty);
  };

  const handleReserve = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to reserve your 10-minute concert hold.', [
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReserving(true);
    try {
      const data = await api.createReservation(selectedCategory.id, quantity);
      router.push(`/reservation/${data.session.id}` as any);
    } catch (err: any) {
      if (err.message && err.message.includes('already have an active reservation')) {
        Alert.alert('Active Hold Exists', err.message, [
          { text: 'OK', style: 'cancel' },
          {
            text: 'Go to Reservations',
            onPress: async () => {
              const sessions = await api.getMyActiveReservations();
              const matched =
                sessions.find((s) => s.categoryId === selectedCategory.id) || sessions[0];
              if (matched) {
                router.push(`/reservation/${matched.id}` as any);
              }
            },
          },
        ]);
      } else {
        Alert.alert('Reservation Failed', err.message || 'Could not hold tickets. Please try again.');
      }
    } finally {
      setReserving(false);
    }
  };

  if (loading || !concert) {
    return (
      <View className="flex-1 bg-night items-center justify-center">
        <ActivityIndicator size="large" color="#9282F4" />
        <Text className="text-mist text-sm mt-3">Loading show details…</Text>
      </View>
    );
  }

  const concertDate = new Date(concert.date);
  const formattedDate = concertDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = concertDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = selectedCategory ? (selectedCategory.price * quantity).toFixed(2) : '0.00';

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* Immersive Poster Header */}
        <View className="relative">
          <Image
            source={{ uri: concert.imageUrl }}
            style={{ width: '100%', height: 320 }}
            resizeMode="cover"
          />

          {/* Gradient Scrim */}
          <View className="absolute inset-0 bg-night/20" />
          <View className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent" />

          {/* Top Controls Overlay */}
          <View
            style={{ top: insets.top + 8 }}
            className="absolute left-5 right-5 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="h-10 w-10 rounded-2xl bg-night/80 border border-white/20 items-center justify-center shadow-lg active:scale-95">
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View className="bg-night/80 border border-emerald-500/30 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
              <LiveDot color="#34D399" size={6} />
              <Text className="text-emerald-300 text-xs font-bold tracking-wider ml-1.5">
                {concert.totalAvailable} Left
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body Card */}
        <View className="px-5 -mt-8">
          <View className="bg-card border border-line rounded-3xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-iris-500/15 border border-iris-500/35 px-3 py-1 rounded-full">
                <Text className="text-iris-300 font-bold text-[10px] tracking-[0.14em] uppercase">
                  LIVE CONCERT TOUR
                </Text>
              </View>

              <Text className="text-emerald-300 font-black text-[18px] tracking-tight">
                From ${concert.startingPrice}
              </Text>
            </View>

            <Text className="text-2xl font-black text-white tracking-[-0.02em]">{concert.artist}</Text>
            <Text className="text-slate-300 text-sm font-semibold mt-0.5">{concert.title}</Text>

            {/* Date & Location Pill Grid */}
            <View className="flex-row mt-4 pt-4 border-t border-line/80">
              <View className="flex-1 flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-iris-500/15 items-center justify-center mr-2.5">
                  <Ionicons name="calendar" size={17} color="#C4B5FD" />
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">{formattedDate}</Text>
                  <Text className="text-mist text-[11px]">{formattedTime}</Text>
                </View>
              </View>

              <View className="flex-1 flex-row items-center border-l border-line/80 pl-3">
                <View className="h-9 w-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Ionicons name="location" size={17} color="#34D399" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>
                    {concert.venue}
                  </Text>
                  <Text className="text-mist text-[11px]">{concert.city}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* About The Show */}
          <View className="mt-6">
            <Text className="text-white text-[17px] font-black tracking-tight mb-2">
              About The Show
            </Text>
            <Text className="text-mist text-sm leading-relaxed">{concert.description}</Text>
          </View>

          {/* 10-Minute Hold Explanation Banner */}
          <View className="mt-5 bg-iris-500/10 border border-iris-500/25 rounded-2xl p-4 flex-row items-center">
            <View className="h-9 w-9 rounded-xl bg-iris-500/20 items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={18} color="#C4B5FD" />
            </View>
            <View className="flex-1">
              <Text className="text-iris-300 font-bold text-xs">
                10-Minute Temporary Hold Guarantee
              </Text>
              <Text className="text-mist text-[11px] mt-0.5 leading-4">
                Selecting tickets creates an exclusive 10-minute hold locked in the database, preventing double-selling.
              </Text>
            </View>
          </View>

          {/* Ticket Tier Categories */}
          <View className="mt-6">
            <Text className="text-white text-[17px] font-black tracking-tight mb-3">
              Select Ticket Category
            </Text>

            <View className="gap-3">
              {concert.categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                const isSoldOut = category.available <= 0;

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => !isSoldOut && handleCategorySelect(category)}
                    disabled={isSoldOut}
                    activeOpacity={0.88}
                    className={`rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-card border-iris-400 shadow-md shadow-iris-500/25'
                        : isSoldOut
                        ? 'bg-abyss border-line opacity-50'
                        : 'bg-card border-line active:bg-card2'
                    }`}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: category.color }}
                          className="h-3.5 w-3.5 rounded-full mr-2.5 shadow-sm"
                        />
                        <Text className="text-white font-extrabold text-base tracking-wide">
                          {category.name}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Text className="text-white font-black text-lg mr-3">
                          ${category.price}
                        </Text>
                        <View
                          className={`px-2.5 py-1 rounded-full ${
                            isSoldOut
                              ? 'bg-rose-500/20'
                              : 'bg-emerald-500/10 border border-emerald-500/30'
                          }`}>
                          <Text
                            className={`text-[11px] font-bold ${
                              isSoldOut ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                            {isSoldOut ? 'Sold Out' : `${category.available} Left`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {category.description && (
                      <Text className="text-mist text-xs mb-2.5">{category.description}</Text>
                    )}

                    {/* Perks List */}
                    {category.perks && category.perks.length > 0 && (
                      <View className="pt-2 border-t border-line/70">
                        {category.perks.map((perk, idx) => (
                          <View key={idx} className="flex-row items-center mt-1">
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#9282F4"
                              style={{ marginRight: 6 }}
                            />
                            <Text className="text-slate-300 text-xs">{perk}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quantity Stepper */}
          {selectedCategory && (
            <View className="mt-4 bg-card border border-line rounded-2xl p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-white font-bold text-sm">Number of Tickets</Text>
                <Text className="text-mist text-xs">Maximum 6 tickets per order</Text>
              </View>

              <View className="flex-row items-center bg-night border border-line rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`h-9 w-9 rounded-lg items-center justify-center ${
                    quantity <= 1 ? 'opacity-30' : 'bg-card2'
                  }`}>
                  <Ionicons name="remove" size={18} color="#fff" />
                </TouchableOpacity>

                <Text className="text-white font-extrabold text-base w-10 text-center">
                  {quantity}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    handleQuantityChange(Math.min(Math.min(6, selectedCategory.available), quantity + 1))
                  }
                  disabled={quantity >= 6 || quantity >= selectedCategory.available}
                  className={`h-9 w-9 rounded-lg items-center justify-center ${
                    quantity >= 6 || quantity >= selectedCategory.available
                      ? 'opacity-30'
                      : 'bg-iris-500'
                  }`}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 left-0 right-0 bg-night/95 backdrop-blur-md border-t border-line px-5 pt-3.5 flex-row items-center justify-between shadow-2xl">
        <View>
          <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
            Total Estimated
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-white font-black text-2xl">${subtotal}</Text>
            {selectedCategory && (
              <Text className="text-mist text-xs ml-1.5 font-medium">
                ({quantity}x {selectedCategory.name})
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleReserve}
          disabled={reserving || !selectedCategory || selectedCategory.available <= 0}
          activeOpacity={0.85}
          className={`py-3.5 px-6 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95 transition-transform ${
            reserving || !selectedCategory || selectedCategory.available <= 0
              ? 'bg-card2 opacity-60'
              : 'bg-iris-500 border border-iris-400/30 shadow-iris-500/35'
          }`}>
          {reserving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="time" size={17} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-sm tracking-wide">
                Reserve · 10-Min Hold
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
