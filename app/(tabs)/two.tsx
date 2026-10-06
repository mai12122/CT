import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Ticket } from '@/types';
import {
  MaterialTopAppBar,
  MaterialCard,
  MaterialButton,
  MaterialBadge,
  MaterialDivider,
} from '@/components/material';

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
    <View className="flex-1 bg-md-surface">
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      {/* Material 3 Top App Bar */}
      <MaterialTopAppBar
        title="My Tickets"
        subtitle="Pass Wallet"
        leading={
          <View className="h-10 w-10 rounded-full bg-md-primaryContainer items-center justify-center">
            <Ionicons name="ticket" size={20} color="#EADDFF" />
          </View>
        }
        trailing={
          user && (
            <MaterialBadge
              label={`${tickets.length} Passes`}
              variant="secondary"
              className="py-1 px-3"
            />
          )
        }
      />

      {!user ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-20 w-20 rounded-full bg-md-surfaceContainerHigh items-center justify-center mb-4">
            <Ionicons name="ticket-outline" size={38} color="#D0BCFF" />
          </View>
          <Text className="text-md-onSurface text-xl font-bold text-center">
            Sign In to View Passes
          </Text>
          <Text className="text-md-onSurfaceVariant text-sm text-center mt-2 max-w-xs leading-relaxed font-normal">
            Your booked concert tickets, seat reservations, and entry QR codes will appear here.
          </Text>
          <MaterialButton
            variant="filled"
            label="Sign In to Continue"
            icon={<Ionicons name="log-in-outline" size={18} color="#381E72" />}
            className="mt-6"
            onPress={() => router.push('/auth/login')}
          />
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D0BCFF" />
          <Text className="text-md-onSurfaceVariant text-sm mt-3 font-medium">
            Fetching your concert passes...
          </Text>
        </View>
      ) : tickets.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D0BCFF" />}>
          <View className="h-20 w-20 rounded-full bg-md-surfaceContainerLow items-center justify-center mb-4">
            <Ionicons name="ticket-outline" size={36} color="#938F99" />
          </View>
          <Text className="text-md-onSurface text-lg font-bold">No Tickets Yet</Text>
          <Text className="text-md-onSurfaceVariant text-xs text-center mt-1.5 max-w-xs leading-relaxed font-normal">
            You don&apos;t have any active concert tickets yet. Browse upcoming shows and grab your seats!
          </Text>
          <MaterialButton
            variant="tonal"
            label="Explore Concerts"
            className="mt-5"
            onPress={() => router.push('/(tabs)')}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D0BCFF" />}>
          <View>
            {tickets.map((ticket) => {
              const concertDate = ticket.concert ? new Date(ticket.concert.date) : new Date();
              const dateString = concertDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <MaterialCard
                  key={ticket.id}
                  variant="elevated"
                  onPress={() => router.push(`/ticket/${ticket.id}` as any)}
                  className="p-0 overflow-hidden mb-4 rounded-md-xl">
                  {/* Category Accent Bar */}
                  <View
                    style={{ backgroundColor: ticket.category?.color || '#6750A4' }}
                    className="py-2.5 px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="musical-notes" size={16} color="#020617" style={{ marginRight: 6 }} />
                      <Text className="text-slate-950 font-bold text-xs uppercase tracking-wider">
                        {ticket.category?.name} Pass
                      </Text>
                    </View>

                    <View className="bg-black/25 px-2 py-0.5 rounded-full">
                      <Text className="text-white font-bold text-[10px] uppercase">
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  {/* Body Content */}
                  <View className="p-4 bg-md-surfaceContainerLow">
                    <Text className="text-md-onSurface font-bold text-lg tracking-tight">
                      {ticket.concert?.artist}
                    </Text>
                    <Text className="text-md-onSurfaceVariant text-sm font-medium mt-0.5">
                      {ticket.concert?.title}
                    </Text>

                    <View className="flex-row items-center mt-3">
                      <Ionicons name="location-outline" size={14} color="#D0BCFF" style={{ marginRight: 4 }} />
                      <Text className="text-md-onSurfaceVariant text-xs font-normal">
                        {ticket.concert?.venue} • {ticket.concert?.city}
                      </Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                      <Ionicons name="calendar-outline" size={14} color="#D0BCFF" style={{ marginRight: 4 }} />
                      <Text className="text-md-onSurfaceVariant text-xs font-normal">{dateString}</Text>
                    </View>

                    <MaterialDivider className="my-3" />

                    {/* Seat & QR Indicator CTA */}
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-md-onSurfaceVariant text-[10px] uppercase font-semibold">
                          Assigned Seat
                        </Text>
                        <Text className="text-emerald-400 font-bold text-xs mt-0.5">
                          {ticket.seat || 'General Admission'}
                        </Text>
                      </View>

                      <View className="bg-md-primaryContainer px-3 py-1.5 rounded-full flex-row items-center">
                        <Ionicons name="qr-code" size={14} color="#EADDFF" style={{ marginRight: 6 }} />
                        <Text className="text-md-onPrimaryContainer font-bold text-xs">View QR Pass</Text>
                      </View>
                    </View>
                  </View>
                </MaterialCard>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
