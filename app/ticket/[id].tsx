import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/api';
import { Ticket } from '@/types';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .getTicketById(id as string)
      .then((data) => {
        if (active) setTicket(data);
      })
      .catch((err: any) => {
        if (active) {
          Alert.alert('Error', err.message || 'Could not load ticket details.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!ticket) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `🎟️ Concert Pass for ${ticket.concert?.artist} - ${ticket.concert?.title}\nTicket ID: ${ticket.ticketNumber}\nSeat: ${ticket.seat || 'General Admission'}\nVenue: ${ticket.concert?.venue}, ${ticket.concert?.city}`,
      });
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-night items-center justify-center">
        <ActivityIndicator size="large" color="#9282F4" />
        <Text className="text-mist text-sm mt-3">Loading concert pass…</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 bg-night items-center justify-center p-6">
        <Text className="text-white text-base">Ticket pass not found.</Text>
      </View>
    );
  }

  const concertDate = ticket.concert ? new Date(ticket.concert.date) : new Date();
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

  const accentColor = ticket.category?.color || '#6C5CE7';

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="pb-3.5 px-5 flex-row items-center justify-between border-b border-line bg-night">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-2xl bg-card border border-line items-center justify-center active:scale-95">
          <Ionicons name="close" size={19} color="#F1F4FA" />
        </TouchableOpacity>
        <Text className="text-white font-black text-[17px] tracking-tight">Verified Pass</Text>
        <TouchableOpacity
          onPress={handleShare}
          className="h-10 w-10 rounded-2xl bg-card border border-line items-center justify-center active:scale-95">
          <Ionicons name="share-outline" size={18} color="#C4B5FD" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Physical Concert Ticket Stub Container */}
        <View className="bg-card border border-line rounded-3xl overflow-hidden shadow-2xl">
          {/* Category Top Banner */}
          <View
            style={{ backgroundColor: accentColor }}
            className="py-3 px-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={15} color="#0B1020" />
              <Text className="text-night font-black text-xs uppercase tracking-[0.14em] ml-2">
                {ticket.category?.name} Pass
              </Text>
            </View>
            <View className="bg-night/20 px-2.5 py-0.5 rounded-full">
              <Text className="text-night font-bold text-[10px] uppercase tracking-wider">
                {ticket.status}
              </Text>
            </View>
          </View>

          {/* Upper Section: Concert Info */}
          <View className="p-6">
            <Text className="text-2xl font-black text-white tracking-tight leading-tight">
              {ticket.concert?.artist}
            </Text>
            <Text className="text-slate-300 text-sm font-medium mt-1">{ticket.concert?.title}</Text>

            {/* Event Info Grid */}
            <View className="grid grid-cols-2 mt-5 pt-4 border-t border-line/80 gap-4">
              <View>
                <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
                  Event Date
                </Text>
                <Text className="text-white font-bold text-[13px] mt-0.5">{formattedDate}</Text>
              </View>

              <View>
                <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
                  Door Time
                </Text>
                <Text className="text-white font-bold text-[13px] mt-0.5">{formattedTime}</Text>
              </View>

              <View className="col-span-2">
                <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
                  Venue & City
                </Text>
                <Text className="text-white font-bold text-[13px] mt-0.5">
                  {ticket.concert?.venue} · {ticket.concert?.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Perforation Divider Line */}
          <View className="relative flex-row items-center px-4">
            <View className="flex-1 border-b border-dashed border-line2" />
          </View>

          {/* Lower Section: QR Code & Turnstile Entry */}
          <View className="p-6 items-center bg-abyss/50">
            <View className="w-full flex-row justify-between mb-4">
              <View>
                <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
                  Allocated Seat
                </Text>
                <Text className="text-emerald-300 font-black text-base mt-0.5">
                  {ticket.seat || 'General Admission'}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
                  Gate Entrance
                </Text>
                <Text className="text-white font-bold text-base mt-0.5">North Concourse</Text>
              </View>
            </View>

            {/* Large Scannable QR Code */}
            <View className="p-4 bg-white rounded-3xl items-center shadow-xl my-2">
              <QRCode
                value={ticket.qrPayload || ticket.ticketNumber || ticket.id || 'VALID-TICKET'}
                size={180}
                color="#0B1020"
                backgroundColor="#ffffff"
              />
            </View>

            <Text className="text-iris-300 font-mono font-bold text-xs mt-3 tracking-widest uppercase">
              {ticket.ticketNumber}
            </Text>

            <Text className="text-mist text-[11px] text-center mt-2 max-w-[240px] leading-4">
              Present this encrypted QR code at the turnstile gate for automated contactless admission.
            </Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.85}
          className="mt-6 bg-card border border-line py-3.5 rounded-2xl flex-row items-center justify-center active:bg-card2">
          <Ionicons name="share-social-outline" size={17} color="#9282F4" style={{ marginRight: 8 }} />
          <Text className="text-slate-200 font-bold text-sm">Share Ticket Pass</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
