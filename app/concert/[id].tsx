import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Concert, TicketCategory } from '@/types';

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
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-slate-400 text-sm mt-3">Loading concert details...</Text>
      </View>
    );
  }

  if (!concert) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#f43f5e" />
        <Text className="text-white text-lg font-bold mt-3">Concert Not Found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-violet-600 px-6 py-2.5 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
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
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Cover Photo */}
        <View className="relative">
          <Image
            source={{ uri: concert.imageUrl }}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />

          {/* Top Bar Floating Buttons */}
          <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 rounded-full bg-slate-950/70 backdrop-blur-md items-center justify-center border border-white/10">
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View className="bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex-row items-center">
              <Ionicons name="ticket" size={14} color="#a78bfa" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-xs">{concert.totalAvailable} Left</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-5">
          <Text className="text-xs font-bold text-violet-400 uppercase tracking-widest">
            {concert.city} • STADIUM TOUR
          </Text>
          <Text className="text-3xl font-black text-white mt-1">{concert.artist}</Text>
          <Text className="text-slate-300 text-lg font-semibold">{concert.title}</Text>

          {/* Date & Location Pill Cards */}
          <View className="flex-row mt-4 space-x-3">
            <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex-row items-center mr-2">
              <View className="h-10 w-10 rounded-xl bg-violet-600/20 items-center justify-center mr-3 border border-violet-500/30">
                <Ionicons name="calendar" size={18} color="#c084fc" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Event Date</Text>
                <Text className="text-white font-bold text-xs numberOfLines={1}">{formattedDate}</Text>
                <Text className="text-violet-300 text-[11px]">{formattedTime}</Text>
              </View>
            </View>

            <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex-row items-center">
              <View className="h-10 w-10 rounded-xl bg-cyan-600/20 items-center justify-center mr-3 border border-cyan-500/30">
                <Ionicons name="location" size={18} color="#38bdf8" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Venue</Text>
                <Text className="text-white font-bold text-xs numberOfLines={1}">{concert.venue}</Text>
                <Text className="text-slate-400 text-[11px]">{concert.city}</Text>
              </View>
            </View>
          </View>

          {/* About Concert */}
          <View className="mt-5">
            <Text className="text-white text-base font-extrabold mb-1.5">About The Show</Text>
            <Text className="text-slate-400 text-sm leading-relaxed">{concert.description}</Text>
          </View>

          {/* 10-Minute Hold Explanation Pill */}
          <View className="mt-5 bg-violet-950/40 border border-violet-500/30 rounded-2xl p-3.5 flex-row items-center">
            <View className="h-8 w-8 rounded-lg bg-violet-500/20 items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={18} color="#a78bfa" />
            </View>
            <View className="flex-1">
              <Text className="text-violet-300 font-bold text-xs">10-Minute Temporary Hold Guarantee</Text>
              <Text className="text-slate-400 text-[11px] mt-0.5">
                Selecting tickets creates an exclusive 10-minute reservation session protected against overselling.
              </Text>
            </View>
          </View>

          {/* Ticket Tier Categories */}
          <View className="mt-6">
            <Text className="text-white text-base font-extrabold mb-3">
              Select Ticket Category
            </Text>

            <View className="space-y-3">
              {concert.categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                const isSoldOut = category.available <= 0;

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => !isSoldOut && setSelectedCategory(category)}
                    disabled={isSoldOut}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-4 mb-3 border ${
                      isSelected
                        ? 'bg-slate-900 border-violet-500 shadow-lg shadow-violet-500/20'
                        : isSoldOut
                        ? 'bg-slate-950/60 border-slate-900 opacity-50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: category.color }}
                          className="h-3.5 w-3.5 rounded-full mr-2.5"
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
                            isSoldOut ? 'bg-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/30'
                          }`}>
                          <Text
                            className={`text-[11px] font-bold ${
                              isSoldOut ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                            {isSoldOut ? 'Sold Out' : `${category.available} Available`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {category.description && (
                      <Text className="text-slate-400 text-xs mb-2.5">{category.description}</Text>
                    )}

                    {/* Perks List */}
                    {category.perks && category.perks.length > 0 && (
                      <View className="pt-2 border-t border-slate-800/80">
                        {category.perks.map((perk, idx) => (
                          <View key={idx} className="flex-row items-center mt-1">
                            <Ionicons name="checkmark-circle" size={13} color="#a78bfa" style={{ marginRight: 6 }} />
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

          {/* Quantity Selector */}
          {selectedCategory && (
            <View className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-white font-bold text-sm">Number of Tickets</Text>
                <Text className="text-slate-400 text-xs">Maximum 6 tickets per order</Text>
              </View>

              <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={`h-9 w-9 rounded-lg items-center justify-center ${
                    quantity <= 1 ? 'opacity-30' : 'bg-slate-800'
                  }`}>
                  <Ionicons name="remove" size={18} color="#fff" />
                </TouchableOpacity>

                <Text className="text-white font-extrabold text-base w-10 text-center">
                  {quantity}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setQuantity((q) => Math.min(Math.min(6, selectedCategory.available), q + 1))
                  }
                  disabled={quantity >= 6 || quantity >= selectedCategory.available}
                  className={`h-9 w-9 rounded-lg items-center justify-center ${
                    quantity >= 6 || quantity >= selectedCategory.available
                      ? 'opacity-30'
                      : 'bg-violet-600'
                  }`}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-900 p-4 pb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-xs uppercase font-bold">Total Estimated</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white font-black text-2xl">${subtotal}</Text>
            {selectedCategory && (
              <Text className="text-slate-400 text-xs ml-1.5">
                ({quantity}x {selectedCategory.name})
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleReserve}
          disabled={reserving || !selectedCategory || selectedCategory.available <= 0}
          activeOpacity={0.85}
          className={`py-3.5 px-6 rounded-2xl flex-row items-center justify-center shadow-lg shadow-violet-600/40 ${
            reserving || !selectedCategory || selectedCategory.available <= 0
              ? 'bg-slate-800 opacity-60'
              : 'bg-violet-600 hover:bg-violet-500'
          }`}>
          {reserving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-extrabold text-sm tracking-wide">
                Reserve 10-Min Hold
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
