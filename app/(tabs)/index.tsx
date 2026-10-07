import React, { useState, useCallback } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Concert, ReservationSession } from '@/types';
import { AppHeader, HeaderAvatar } from '@/components/AppHeader';
import { ConcertListSkeleton } from '@/components/ui/Skeleton';
import { LiveDot } from '@/components/ui/LiveDot';
import { CAMBODIAN_CONCERTS } from '@/constants/cambodianConcerts';

const CITY_FILTERS = ['All', 'Phnom Penh', 'Siem Reap', 'Battambang', 'Preah Sihanouk', 'Kampot'];

export default function ExploreScreen() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>(CAMBODIAN_CONCERTS);
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
      if (data && data.length > 0) {
        setConcerts(data);
        return;
      }
    } catch (err) {
      console.warn('Backend concerts unreachable, using local Cambodian catalogue:', err);
    }

    // High-availability fallback: filter authentic Cambodian catalogue
    const filtered = CAMBODIAN_CONCERTS.filter((c) => {
      const matchesCity = selectedCity === 'All' || c.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        c.artist.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.venue.toLowerCase().includes(search.toLowerCase());
      return matchesCity && matchesSearch;
    });
    setConcerts(filtered);
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

  const handleCitySelect = (city: string) => {
    Haptics.selectionAsync();
    setSelectedCity(city);
  };

  const featuredConcert = concerts.find((c) => c.featured) || concerts[0];

  const formatConcertDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return {
      month,
      day,
      time,
      badge: `${month} ${day} • ${time}`,
    };
  };

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      {/* Revamped Header matching CT LIVE CONCERTS Event Pass branding */}
      <AppHeader
        right={
          user ? (
            <HeaderAvatar name={user.name} onPress={() => router.push('/(tabs)/profile')} />
          ) : (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.85}
                className="bg-iris-500 border border-iris-400/30 rounded-full py-2 px-4 shadow-sm shadow-iris-500/40 active:scale-95 transition-transform">
                <Text className="text-white text-xs font-bold tracking-wide">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                activeOpacity={0.8}
                className="bg-card border border-line rounded-full py-2 px-3.5 active:opacity-80">
                <Text className="text-slate-300 text-xs font-semibold">Join</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9282F4" />
        }>
        {/* Active 10-Minute Hold Alert Banner */}
        {activeSessions.length > 0 && (
          <View className="px-5 pt-4 gap-2.5">
            {activeSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push(`/reservation/${session.id}` as any)}
                activeOpacity={0.9}
                className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="h-9 w-9 rounded-xl bg-amber-500/20 items-center justify-center mr-3">
                    <Ionicons name="time" size={18} color="#F5B04C" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-amber-300 font-bold text-[10px] tracking-[0.14em] uppercase">
                      10-Min Hold Active · Expires Soon
                    </Text>
                    <Text className="text-white font-semibold text-[13px] mt-0.5" numberOfLines={1}>
                      {session.concertTitle} · {session.categoryName}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
                  <Text className="text-amber-300 font-bold text-xs mr-1">Checkout</Text>
                  <Ionicons name="chevron-forward" size={13} color="#F5B04C" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* High-Precision Search Bar */}
        <View className="px-5 pt-4">
          <View className="bg-card border border-line rounded-2xl px-4 flex-row items-center h-12 shadow-sm focus-within:border-iris-400">
            <Ionicons name="search" size={18} color="#9282F4" style={{ marginRight: 10 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchConcerts}
              placeholder="Search by artist, venue, or tour..."
              placeholderTextColor="#5D6A8C"
              autoCorrect={false}
              returnKeyType="search"
              className="flex-1 text-white text-[14px]"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#5D6A8C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* City Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 8 }}>
          {CITY_FILTERS.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                onPress={() => handleCitySelect(city)}
                activeOpacity={0.8}
                className={`px-4 py-2 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-iris-500 border-iris-500 shadow-sm shadow-iris-500/30'
                    : 'bg-card border-line active:bg-card2'
                }`}>
                <Text
                  className={`text-[12px] ${
                    isSelected ? 'text-white font-bold tracking-wide' : 'text-mist font-medium'
                  }`}>
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero Featured Concert (Headliner) */}
        {featuredConcert && !search && selectedCity === 'All' && (
          <View className="px-5 pt-6">
            <TouchableOpacity
              onPress={() => router.push(`/concert/${featuredConcert.id}` as any)}
              activeOpacity={0.92}
              className="rounded-3xl overflow-hidden bg-card border border-line shadow-2xl relative">
              <View className="relative">
                <Image
                  source={{ uri: featuredConcert.imageUrl }}
                  style={{ width: '100%', height: 235 }}
                  resizeMode="cover"
                />

                {/* Layered Gradient Overlays for High Legibility */}
                <View className="absolute inset-0 bg-night/30" />
                <View className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night via-night/85 to-transparent" />
                <View className="absolute inset-x-0 bottom-0 h-32 bg-night/90" />

                {/* Top Badges */}
                <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between">
                  <View className="bg-iris-500/90 border border-white/20 px-3 py-1 rounded-full shadow-sm">
                    <Text className="text-white text-[10px] font-black tracking-[0.14em] uppercase">
                      STADIUM TOUR
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-night/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <LiveDot color="#34D399" size={6} />
                    <Text className="text-emerald-300 text-[11px] font-bold ml-1.5">
                      {featuredConcert.totalAvailable} Tickets Left
                    </Text>
                  </View>
                </View>

                {/* Bottom Content Area */}
                <View className="absolute inset-x-0 bottom-0 p-5">
                  <Text className="text-[26px] leading-[30px] font-black text-white tracking-[-0.02em]">
                    {featuredConcert.artist}
                  </Text>
                  <Text className="text-slate-300 text-[13px] font-medium mt-0.5" numberOfLines={1}>
                    {featuredConcert.title}
                  </Text>

                  <View className="flex-row items-center justify-between mt-3.5 pt-3.5 border-t border-line/90">
                    <View className="flex-row items-center flex-1 mr-3">
                      <Ionicons name="location" size={14} color="#9282F4" />
                      <Text className="text-mist text-[12px] font-medium ml-1.5" numberOfLines={1}>
                        {featuredConcert.venue}, {featuredConcert.city}
                      </Text>
                    </View>

                    <View className="flex-row items-baseline">
                      <Text className="text-mist text-[12px] font-medium mr-1">Starts at</Text>
                      <Text className="text-white font-black text-[18px] tracking-tight">
                        ${featuredConcert.startingPrice}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Shows List */}
        <View className="px-5 pt-7">
          <View className="flex-row items-baseline justify-between mb-3.5">
            <Text className="text-white text-[18px] font-black tracking-tight">
              Upcoming Shows
            </Text>
            {!loading && concerts.length > 0 && (
              <View className="bg-card border border-line px-2.5 py-0.5 rounded-full">
                <Text className="text-mist text-[11px] font-bold">{concerts.length} Shows</Text>
              </View>
            )}
          </View>

          {loading ? (
            <ConcertListSkeleton />
          ) : concerts.length === 0 ? (
            <View className="py-16 items-center">
              <View className="h-16 w-16 rounded-3xl bg-card border border-line items-center justify-center mb-4">
                <Ionicons name="search-outline" size={28} color="#5D6A8C" />
              </View>
              <Text className="text-white text-[16px] font-bold">No shows found</Text>
              <Text className="text-mist text-[13px] mt-1 text-center">
                Try adjusting your city filter or search terms
              </Text>
            </View>
          ) : (
            <View className="gap-3.5">
              {concerts.map((concert) => {
                const dateInfo = formatConcertDate(concert.date);
                return (
                  <TouchableOpacity
                    key={concert.id}
                    onPress={() => router.push(`/concert/${concert.id}` as any)}
                    activeOpacity={0.88}
                    className="bg-card border border-line rounded-2xl overflow-hidden flex-row active:opacity-95 shadow-sm">
                    {/* Left Thumbnail Image */}
                    <View className="relative">
                      <Image
                        source={{ uri: concert.imageUrl }}
                        style={{ width: 112, height: 138 }}
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-night/10" />
                    </View>

                    {/* Right Card Body */}
                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        {/* Top Date & Availability Pill */}
                        <View className="flex-row items-center justify-between mb-1.5">
                          <View className="flex-row items-center bg-iris-500/15 border border-iris-500/30 px-2 py-0.5 rounded-md">
                            <Ionicons name="calendar-outline" size={11} color="#C4B5FD" style={{ marginRight: 4 }} />
                            <Text className="text-iris-300 text-[10px] font-bold uppercase tracking-wider">
                              {dateInfo.month} {dateInfo.day} • {dateInfo.time}
                            </Text>
                          </View>
                          <Text className="text-mist text-[10px] font-semibold">
                            {concert.totalAvailable > 500 ? `${concert.totalAvailable.toLocaleString()} Seats` : `${concert.totalAvailable} Left`}
                          </Text>
                        </View>

                        {/* Artist & Tour Titles */}
                        <Text
                          className="text-white font-extrabold text-[16px] leading-tight tracking-tight"
                          numberOfLines={1}>
                          {concert.artist}
                        </Text>
                        <Text className="text-slate-300 text-[12px] font-medium mt-0.5" numberOfLines={1}>
                          {concert.title}
                        </Text>
                      </View>

                      <View>
                        {/* Location */}
                        <View className="flex-row items-center mt-1.5 mb-2">
                          <Ionicons name="location-outline" size={12} color="#5D6A8C" />
                          <Text className="text-dim text-[11px] ml-1 flex-1 font-medium" numberOfLines={1}>
                            {concert.venue} • {concert.city}
                          </Text>
                        </View>

                        {/* Bottom Tags & Price */}
                        <View className="flex-row items-center justify-between pt-2 border-t border-line/80">
                          <View className="flex-row gap-1">
                            {concert.categories.slice(0, 2).map((cat) => (
                              <View
                                key={cat.id}
                                style={{
                                  backgroundColor: `${cat.color}18`,
                                  borderColor: `${cat.color}40`,
                                }}
                                className="px-2 py-0.5 rounded border">
                                <Text
                                  style={{ color: cat.color }}
                                  className="text-[9px] font-extrabold uppercase tracking-wider">
                                  {cat.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                          <View className="flex-row items-baseline">
                            <Text className="text-mist text-[11px] font-medium mr-1">From</Text>
                            <Text className="text-white font-extrabold text-[15px] tracking-tight">
                              ${concert.startingPrice}
                            </Text>
                          </View>
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
