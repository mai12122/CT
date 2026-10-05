import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Concert, ReservationSession } from '@/types';
import {
  MaterialTopAppBar,
  MaterialCard,
  MaterialChip,
  MaterialButton,
  MaterialBadge,
} from '@/components/material';

const CITY_FILTERS = ['All', 'Los Angeles', 'London', 'New York', 'Atlanta'];

export default function ExploreScreen() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeSessions, setActiveSessions] = useState<ReservationSession[]>([]);

  const fetchConcerts = useCallback(async () => {
    try {
      const data = await api.getConcerts({
        search: search.trim() || undefined,
        city: selectedCity === 'All' ? undefined : selectedCity,
      });
      setConcerts(data);
    } catch (err) {
      console.warn('Failed to load concerts:', err);
    }
  }, [search, selectedCity]);

  const fetchActiveSessions = useCallback(async () => {
    if (!user) {
      setActiveSessions([]);
      return;
    }
    try {
      const sessions = await api.getMyActiveReservations();
      setActiveSessions(sessions);
    } catch {
      setActiveSessions([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchConcerts().finally(() => setLoading(false));
      fetchActiveSessions();
    }, [fetchConcerts, fetchActiveSessions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchConcerts(), fetchActiveSessions()]);
    setRefreshing(false);
  };

  const featuredConcert = concerts.find((c) => c.featured) || concerts[0];

  const formatConcertDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: d.getDate(),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <View className="flex-1 bg-md-surface">
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      {/* Material 3 Top App Bar */}
      <MaterialTopAppBar
        title="Live Events"
        subtitle="Concert Pass"
        leading={
          <View className="h-10 w-10 rounded-full bg-md-primaryContainer items-center justify-center">
            <Ionicons name="musical-notes" size={20} color="#EADDFF" />
          </View>
        }
        trailing={
          user ? (
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-row items-center bg-md-surfaceContainerHigh border border-md-outlineVariant/40 rounded-full py-1.5 px-3">
              <View className="h-6 w-6 rounded-full bg-md-primary items-center justify-center mr-2">
                <Text className="text-md-onPrimary text-xs font-bold">{user.name[0]}</Text>
              </View>
              <Text className="text-md-onSurface text-xs font-medium">{user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ) : (
            <MaterialButton
              variant="filled"
              label="Sign In"
              className="h-9 px-4"
              onPress={() => router.push('/auth/login')}
            />
          )
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D0BCFF" />}>
        {/* Active Reservation Banner (Material Tonal Alert) */}
        {activeSessions.length > 0 && (
          <View className="mx-4 mt-3">
            {activeSessions.map((session) => (
              <MaterialCard
                key={session.id}
                variant="outlined"
                onPress={() => router.push(`/reservation/${session.id}` as any)}
                className="bg-amber-950/20 border-amber-500/40 p-3 mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="h-9 w-9 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#fbbf24" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                      Active 10-Min Hold
                    </Text>
                    <Text numberOfLines={1} className="text-md-onSurface font-semibold text-sm">
                      {session.concertTitle} ({session.categoryName})
                    </Text>
                  </View>
                </View>
                <View className="bg-amber-400 px-3 py-1.5 rounded-full flex-row items-center">
                  <Text className="text-slate-950 font-bold text-xs">Checkout</Text>
                  <Ionicons name="arrow-forward" size={14} color="#020617" style={{ marginLeft: 4 }} />
                </View>
              </MaterialCard>
            ))}
          </View>
        )}

        {/* Material 3 Search Bar */}
        <View className="px-4 mt-4">
          <View className="h-12 bg-md-surfaceContainerHigh rounded-full px-4 flex-row items-center border border-md-outlineVariant/30">
            <Ionicons name="search" size={20} color="#CAC4D0" style={{ marginRight: 10 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchConcerts}
              placeholder="Search artist, tour, or venue..."
              placeholderTextColor="#938F99"
              className="flex-1 text-md-onSurface text-sm h-full"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#938F99" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Material 3 Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          {CITY_FILTERS.map((city) => (
            <MaterialChip
              key={city}
              label={city}
              selected={selectedCity === city}
              onPress={() => setSelectedCity(city)}
            />
          ))}
        </ScrollView>

        {/* Featured Concert (Material Elevated Card) */}
        {featuredConcert && !search && selectedCity === 'All' && (
          <View className="px-4 mt-3">
            <Text className="text-md-onSurface text-base font-bold mb-2.5 tracking-tight">
              Featured Headliner
            </Text>
            <MaterialCard
              variant="elevated"
              onPress={() => router.push(`/concert/${featuredConcert.id}` as any)}
              className="p-0 overflow-hidden rounded-md-xl">
              <View className="relative">
                <Image
                  source={{ uri: featuredConcert.imageUrl }}
                  style={{ width: '100%', height: 210 }}
                  resizeMode="cover"
                />
                <View className="absolute top-3 left-3 flex-row items-center">
                  <MaterialBadge label="Stadium Tour" variant="primary" className="mr-2" />
                  <MaterialBadge
                    label={`${featuredConcert.totalAvailable} Left`}
                    variant="success"
                  />
                </View>
              </View>

              <View className="p-4 bg-md-surfaceContainerLow">
                <Text className="text-xl font-bold text-md-onSurface tracking-tight">
                  {featuredConcert.artist}
                </Text>
                <Text className="text-md-onSurfaceVariant text-sm mt-0.5 mb-3">
                  {featuredConcert.title}
                </Text>

                <View className="flex-row items-center justify-between pt-3 border-t border-md-outlineVariant/20">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Ionicons name="location-outline" size={16} color="#D0BCFF" style={{ marginRight: 4 }} />
                    <Text numberOfLines={1} className="text-md-onSurfaceVariant text-xs flex-1">
                      {featuredConcert.venue}, {featuredConcert.city}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-md-onSurfaceVariant text-[10px] uppercase font-semibold">Starts at</Text>
                    <Text className="text-md-primary font-bold text-base">
                      ${featuredConcert.startingPrice}
                    </Text>
                  </View>
                </View>
              </View>
            </MaterialCard>
          </View>
        )}

        {/* Concerts List */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-md-onSurface text-base font-bold tracking-tight">
              Upcoming Shows ({concerts.length})
            </Text>
          </View>

          {loading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#D0BCFF" />
              <Text className="text-md-onSurfaceVariant text-sm mt-3 font-medium">Loading live concerts...</Text>
            </View>
          ) : concerts.length === 0 ? (
            <MaterialCard variant="outlined" className="py-12 items-center justify-center">
              <Ionicons name="musical-note-outline" size={44} color="#938F99" />
              <Text className="text-md-onSurface text-base font-semibold mt-3">No concerts found</Text>
              <Text className="text-md-onSurfaceVariant text-xs mt-1">Try adjusting your search or filters</Text>
            </MaterialCard>
          ) : (
            <View>
              {concerts.map((concert) => {
                const dateInfo = formatConcertDate(concert.date);
                return (
                  <MaterialCard
                    key={concert.id}
                    variant="outlined"
                    onPress={() => router.push(`/concert/${concert.id}` as any)}
                    className="p-0 overflow-hidden mb-3.5 flex-row">
                    <Image
                      source={{ uri: concert.imageUrl }}
                      style={{ width: 110, height: 135 }}
                      resizeMode="cover"
                    />

                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="bg-md-surfaceContainerHigh px-2 py-0.5 rounded-md-xs flex-row items-center">
                            <Ionicons name="calendar-outline" size={11} color="#D0BCFF" style={{ marginRight: 4 }} />
                            <Text className="text-md-primary text-[10px] font-bold">
                              {dateInfo.month} {dateInfo.day}
                            </Text>
                          </View>
                          <Text className="text-md-onSurfaceVariant text-[11px] font-medium">{dateInfo.time}</Text>
                        </View>

                        <Text numberOfLines={1} className="text-md-onSurface font-bold text-base tracking-tight">
                          {concert.artist}
                        </Text>
                        <Text numberOfLines={1} className="text-md-onSurfaceVariant text-xs mt-0.5">
                          {concert.title}
                        </Text>
                      </View>

                      <View className="mt-2">
                        <View className="flex-row items-center mb-1.5">
                          <Ionicons name="location-outline" size={12} color="#CAC4D0" style={{ marginRight: 3 }} />
                          <Text numberOfLines={1} className="text-md-onSurfaceVariant text-[11px]">
                            {concert.venue} • {concert.city}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-1.5 border-t border-md-outlineVariant/20">
                          <View className="flex-row">
                            {concert.categories.slice(0, 3).map((cat) => (
                              <View
                                key={cat.id}
                                style={{ backgroundColor: `${cat.color}25` }}
                                className="px-1.5 py-0.5 rounded-md-xs mr-1">
                                <Text
                                  style={{ color: cat.color }}
                                  className="text-[9px] font-bold uppercase">
                                  {cat.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                          <Text className="text-md-primary font-bold text-sm">
                            From ${concert.startingPrice}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </MaterialCard>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
