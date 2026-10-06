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

const CITY_FILTERS = ['All', 'Phnom Penh', 'Los Angeles', 'London', 'New York', 'Tokyo'];

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
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View className="pt-14 pb-4 px-5 bg-slate-950/80 border-b border-slate-900 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 130, height: 44, marginRight: 8 }}
            resizeMode="contain"
          />
        </View>

        {user ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="flex-row items-center bg-slate-900 border border-slate-800 rounded-full py-1.5 px-3">
            <View className="h-6 w-6 rounded-full bg-violet-600 items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">{user.name[0]}</Text>
            </View>
            <Text className="text-slate-200 text-xs font-semibold">{user.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              className="bg-violet-600 rounded-full py-1.5 px-3.5 shadow-sm shadow-violet-500/50 mr-2">
              <Text className="text-white text-xs font-bold">Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              className="bg-slate-900 border border-slate-700 rounded-full py-1.5 px-3">
              <Text className="text-slate-300 text-xs font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}>
        {/* Active 10-Minute Reservation Alert Banner */}
        {activeSessions.length > 0 && (
          <View className="mx-5 mt-4">
            {activeSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push(`/reservation/${session.id}` as any)}
                activeOpacity={0.9}
                className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="h-9 w-9 rounded-xl bg-amber-500/20 items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                      Active 10-Min Hold
                    </Text>
                    <Text className="text-white font-semibold text-sm numberOfLines={1}">
                      {session.concertTitle} ({session.categoryName})
                    </Text>
                  </View>
                </View>
                <View className="bg-amber-500 px-3 py-1.5 rounded-lg flex-row items-center">
                  <Text className="text-slate-950 font-bold text-xs">Checkout</Text>
                  <Ionicons name="arrow-forward" size={14} color="#020617" style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View className="px-5 mt-5">
          <View className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchConcerts}
              placeholder="Search by artist, venue, or tour..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white text-sm"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* City Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
          {CITY_FILTERS.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                onPress={() => setSelectedCity(city)}
                className={`mr-2.5 px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-violet-600 border-violet-500'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white font-bold' : 'text-slate-400'
                  }`}>
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero Featured Concert */}
        {featuredConcert && !search && selectedCity === 'All' && (
          <View className="px-5 mt-5">
            <Text className="text-white text-lg font-extrabold mb-3 tracking-wide">
              Featured Headliner
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/concert/${featuredConcert.id}` as any)}
              activeOpacity={0.9}
              className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
              <Image
                source={{ uri: featuredConcert.imageUrl }}
                style={{ width: '100%', height: 220 }}
                resizeMode="cover"
              />
              {/* Gradient tint */}
              <View className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent justify-end p-5">
                <View className="flex-row items-center mb-2">
                  <View className="bg-violet-600/90 px-3 py-1 rounded-full mr-2">
                    <Text className="text-white text-[11px] font-bold tracking-wider uppercase">
                      Stadium Tour
                    </Text>
                  </View>
                  <View className="bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    <Text className="text-emerald-400 text-[11px] font-semibold">
                      {featuredConcert.totalAvailable} Tickets Left
                    </Text>
                  </View>
                </View>

                <Text className="text-2xl font-black text-white">{featuredConcert.artist}</Text>
                <Text className="text-slate-300 text-sm font-medium mt-0.5">
                  {featuredConcert.title}
                </Text>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={14} color="#a78bfa" style={{ marginRight: 4 }} />
                    <Text className="text-slate-400 text-xs">{featuredConcert.venue}, {featuredConcert.city}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold">Starts at</Text>
                    <Text className="text-emerald-400 font-extrabold text-base">
                      ${featuredConcert.startingPrice}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* All Concerts List */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-extrabold tracking-wide">
              Upcoming Shows ({concerts.length})
            </Text>
          </View>

          {loading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-slate-400 text-sm mt-3">Loading live concert availability...</Text>
            </View>
          ) : concerts.length === 0 ? (
            <View className="py-16 items-center justify-center">
              <Ionicons name="musical-note-outline" size={48} color="#475569" />
              <Text className="text-slate-300 text-base font-semibold mt-3">No concerts found</Text>
              <Text className="text-slate-500 text-xs mt-1">Try adjusting your search or filters</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {concerts.map((concert) => {
                const dateInfo = formatConcertDate(concert.date);
                return (
                  <TouchableOpacity
                    key={concert.id}
                    onPress={() => router.push(`/concert/${concert.id}` as any)}
                    activeOpacity={0.85}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden mb-4 flex-row">
                    <Image
                      source={{ uri: concert.imageUrl }}
                      style={{ width: 110, height: 135 }}
                      resizeMode="cover"
                    />

                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="bg-slate-800 px-2 py-0.5 rounded-md flex-row items-center">
                            <Ionicons name="calendar-outline" size={11} color="#a78bfa" style={{ marginRight: 4 }} />
                            <Text className="text-violet-300 text-[10px] font-bold">
                              {dateInfo.month} {dateInfo.day}
                            </Text>
                          </View>
                          <Text className="text-slate-400 text-[11px]">{dateInfo.time}</Text>
                        </View>

                        <Text className="text-white font-extrabold text-base leading-tight">
                          {concert.artist}
                        </Text>
                        <Text className="text-slate-400 text-xs numberOfLines={1} mt-0.5">
                          {concert.title}
                        </Text>
                      </View>

                      <View className="mt-2">
                        <View className="flex-row items-center mb-1.5">
                          <Ionicons name="pin-outline" size={12} color="#94a3b8" style={{ marginRight: 3 }} />
                          <Text className="text-slate-400 text-[11px] numberOfLines={1}">
                            {concert.venue} • {concert.city}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-1 border-t border-slate-800">
                          <View className="flex-row space-x-1">
                            {concert.categories.slice(0, 3).map((cat) => (
                              <View
                                key={cat.id}
                                style={{ backgroundColor: `${cat.color}20` }}
                                className="px-1.5 py-0.5 rounded mr-1">
                                <Text
                                  style={{ color: cat.color }}
                                  className="text-[9px] font-bold uppercase">
                                  {cat.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                          <Text className="text-emerald-400 font-extrabold text-sm">
                            From ${concert.startingPrice}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
