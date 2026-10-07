import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Ticket } from '@/types';
import { AppHeader } from '@/components/AppHeader';

export default function MyTicketsScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.warn('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const openTicket = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/ticket/${id}` as any);
  };

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      <AppHeader
        title="My Tickets"
        subtitle="WALLET & ENTRY PASSES"
        right={
          user && tickets.length > 0 ? (
            <View className="bg-card border border-line rounded-full px-3 py-1">
              <Text className="text-iris-300 font-bold text-xs">
                {tickets.length} {tickets.length === 1 ? 'Pass' : 'Passes'}
              </Text>
            </View>
          ) : undefined
        }
      />

      {!user ? (
        /* Signed-out Guest State */
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 rounded-3xl bg-iris-500/10 border border-iris-500/30 items-center justify-center mb-5 shadow-sm shadow-iris-500/20">
            <Ionicons name="ticket-outline" size={36} color="#9282F4" />
          </View>
          <Text className="text-white text-2xl font-black tracking-tight text-center">
            Your Event Passes
          </Text>
          <Text className="text-mist text-[14px] text-center mt-2 max-w-[290px] leading-relaxed">
            Sign in to access your booked seats, turnstile QR passes, and real-time gate updates.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
            className="mt-7 bg-iris-500 border border-iris-400/30 px-8 py-4 rounded-2xl w-full max-w-xs items-center shadow-md shadow-iris-500/30 active:scale-[0.98]">
            <Text className="text-white font-bold text-sm tracking-wide">Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.8}
            className="mt-3 bg-card border border-line px-8 py-3.5 rounded-2xl w-full max-w-xs items-center active:opacity-80">
            <Text className="text-slate-200 font-semibold text-[13px]">Create an account</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9282F4" />
          <Text className="text-mist text-[13px] mt-3">Syncing verified passes…</Text>
        </View>
      ) : tickets.length === 0 ? (
        /* Empty Wallet State */
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9282F4" />
          }>
          <View className="h-20 w-20 rounded-3xl bg-card border border-line items-center justify-center mb-5">
            <Ionicons name="ticket-outline" size={34} color="#5D6A8C" />
          </View>
          <Text className="text-white text-xl font-bold tracking-tight">No Active Passes</Text>
          <Text className="text-mist text-[13px] text-center mt-1.5 max-w-[270px] leading-5">
            When you reserve and confirm tickets, your encrypted QR entry pass will appear here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
            className="mt-6 bg-iris-500 px-6 py-3.5 rounded-2xl active:scale-95 shadow-sm shadow-iris-500/30">
            <Text className="text-white font-bold text-[13px]">Browse Upcoming Shows</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Ticket Pass Cards List */
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9282F4" />
          }>
          <View className="gap-4">
            {tickets.map((ticket) => {
              const concertDate = ticket.concert ? new Date(ticket.concert.date) : new Date();
              const dateString = concertDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const accent = ticket.category?.color || '#6C5CE7';

              return (
                <TouchableOpacity
                  key={ticket.id}
                  onPress={() => openTicket(ticket.id)}
                  activeOpacity={0.92}
                  className="bg-card border border-line rounded-3xl overflow-hidden active:opacity-95 shadow-lg">
                  {/* Category Color Ribbon */}
                  <View
                    style={{ backgroundColor: accent }}
                    className="py-2.5 px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="sparkles" size={13} color="#0B1020" />
                      <Text className="text-night font-black text-[11px] uppercase tracking-[0.12em] ml-1.5">
                        {ticket.category?.name} Pass
                      </Text>
                    </View>
                    <View className="bg-night/20 px-2 py-0.5 rounded-full">
                      <Text className="text-night font-bold text-[10px] uppercase tracking-[0.1em]">
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  <View className="p-5">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-4">
                        <Text
                          className="text-white font-black text-xl leading-tight tracking-tight"
                          numberOfLines={1}>
                          {ticket.concert?.artist}
                        </Text>
                        <Text className="text-slate-300 text-[13px] font-medium mt-1" numberOfLines={1}>
                          {ticket.concert?.title}
                        </Text>

                        {/* Location & Date */}
                        <View className="flex-row items-center mt-3">
                          <Ionicons name="location-outline" size={13} color="#9282F4" />
                          <Text className="text-mist text-[12px] ml-1.5 flex-1 font-medium" numberOfLines={1}>
                            {ticket.concert?.venue} · {ticket.concert?.city}
                          </Text>
                        </View>

                        <View className="flex-row items-center mt-1">
                          <Ionicons name="calendar-outline" size={13} color="#5D6A8C" />
                          <Text className="text-mist text-[12px] ml-1.5 font-medium">{dateString}</Text>
                        </View>
                      </View>

                      {/* Scannable Micro QR Code Preview */}
                      <View className="p-2.5 bg-white rounded-2xl items-center shadow-md">
                        <QRCode
                          value={ticket.qrPayload || ticket.ticketNumber}
                          size={62}
                          color="#0B1020"
                          backgroundColor="#ffffff"
                        />
                        <Text className="text-[8px] font-black text-slate-800 mt-1 tracking-[0.14em] uppercase">
                          Scan Gate
                        </Text>
                      </View>
                    </View>

                    {/* Perforation Divider */}
                    <View className="relative my-4 flex-row items-center">
                      <View className="flex-1 border-b border-dashed border-line2" />
                    </View>

                    {/* Footer Details: Seat & Open CTA */}
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-dim text-[10px] uppercase font-bold tracking-[0.12em]">
                          Seat / Allocation
                        </Text>
                        <Text className="text-emerald-300 font-extrabold text-[13px] mt-0.5">
                          {ticket.seat || 'General Admission'}
                        </Text>
                      </View>

                      <View className="flex-row items-center bg-iris-500/15 border border-iris-500/30 px-3 py-1.5 rounded-full">
                        <Text className="text-iris-300 font-bold text-[12px] mr-1">View Full Pass</Text>
                        <Ionicons name="chevron-forward" size={13} color="#C4B5FD" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
