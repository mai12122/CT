import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Ticket } from '@/types';

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

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="pt-14 pb-4 px-5 bg-slate-950/80 border-b border-slate-900 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-bold text-violet-400 tracking-widest uppercase">
            MY WALLET
          </Text>
          <Text className="text-xl font-extrabold text-white">Concert Tickets</Text>
        </View>

        {user && (
          <View className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
            <Text className="text-slate-300 font-bold text-xs">{tickets.length} Passes</Text>
          </View>
        )}
      </View>

      {!user ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-20 w-20 rounded-3xl bg-violet-600/10 border border-violet-500/30 items-center justify-center mb-4">
            <Ionicons name="ticket-outline" size={40} color="#a78bfa" />
          </View>
          <Text className="text-white text-xl font-extrabold text-center">
            Sign In to View Passes
          </Text>
          <Text className="text-slate-400 text-sm text-center mt-1.5 max-w-xs leading-relaxed">
            Your booked concert tickets, seat reservations, and entry QR codes will appear here.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
            className="mt-6 bg-violet-600 px-8 py-3.5 rounded-2xl w-full max-w-xs items-center shadow-lg shadow-violet-600/30">
            <Text className="text-white font-extrabold text-sm">Sign In to Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.7}
            className="mt-3 bg-slate-900 border border-slate-800 px-8 py-3 rounded-2xl w-full max-w-xs items-center">
            <Text className="text-slate-300 font-semibold text-xs">Don&apos;t have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-slate-400 text-sm mt-3">Fetching your concert passes...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}>
          <View className="h-20 w-20 rounded-3xl bg-slate-900 border border-slate-800 items-center justify-center mb-4">
            <Ionicons name="ticket-outline" size={36} color="#64748b" />
          </View>
          <Text className="text-white text-lg font-bold">No Tickets Yet</Text>
          <Text className="text-slate-400 text-xs text-center mt-1 max-w-xs">
            You don&apos;t have any active concert tickets yet. Browse upcoming shows and grab your seats!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="mt-5 bg-violet-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-bold text-xs uppercase tracking-wider">
              Explore Concerts
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}>
          <View className="space-y-4">
            {tickets.map((ticket) => {
              const concertDate = ticket.concert ? new Date(ticket.concert.date) : new Date();
              const dateString = concertDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <TouchableOpacity
                  key={ticket.id}
                  onPress={() => router.push(`/ticket/${ticket.id}` as any)}
                  activeOpacity={0.88}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-4 shadow-xl">
                  {/* Top Category Header Stripe */}
                  <View
                    style={{ backgroundColor: ticket.category?.color || '#8b5cf6' }}
                    className="py-2.5 px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="musical-notes" size={16} color="#020617" style={{ marginRight: 6 }} />
                      <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">
                        {ticket.category?.name} Pass
                      </Text>
                    </View>

                    <View className="bg-slate-950/20 px-2 py-0.5 rounded-full border border-black/20">
                      <Text className="text-slate-950 font-extrabold text-[10px] uppercase">
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  {/* Body Content */}
                  <View className="p-5">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-3">
                        <Text className="text-white font-black text-xl leading-tight">
                          {ticket.concert?.artist}
                        </Text>
                        <Text className="text-slate-300 text-sm font-semibold mt-0.5">
                          {ticket.concert?.title}
                        </Text>

                        <View className="flex-row items-center mt-3">
                          <Ionicons name="location-outline" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                          <Text className="text-slate-400 text-xs">
                            {ticket.concert?.venue} • {ticket.concert?.city}
                          </Text>
                        </View>

                        <View className="flex-row items-center mt-1">
                          <Ionicons name="calendar-outline" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                          <Text className="text-slate-400 text-xs">{dateString}</Text>
                        </View>
                      </View>

                      {/* Real Scannable QR Code */}
                      <View className="p-2 bg-white rounded-2xl items-center shadow-lg border-2 border-white">
                        <QRCode
                          value={ticket.qrPayload || ticket.ticketNumber}
                          size={58}
                          color="#020617"
                          backgroundColor="#ffffff"
                        />
                        <Text className="text-[8px] font-black text-slate-800 mt-1 tracking-wider uppercase">
                          SCAN GATE
                        </Text>
                      </View>
                    </View>

                    {/* Seat & QR Indicator CTA */}
                    <View className="mt-4 pt-3 border-t border-slate-800/80 flex-row items-center justify-between">
                      <View>
                        <Text className="text-slate-400 text-[10px] uppercase font-bold">Assigned Seat</Text>
                        <Text className="text-emerald-400 font-extrabold text-xs mt-0.5">
                          {ticket.seat || 'General Admission'}
                        </Text>
                      </View>

                      <View className="bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 rounded-xl flex-row items-center">
                        <Ionicons name="qr-code" size={14} color="#c084fc" style={{ marginRight: 6 }} />
                        <Text className="text-violet-300 font-bold text-xs">View Full QR Pass</Text>
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
