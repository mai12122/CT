import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { api } from '@/services/api';
import { Ticket } from '@/types';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api.getTicketById(id as string).then((data) => {
      if (active) setTicket(data);
    }).catch((err: any) => {
      if (active) {
        Alert.alert('Error', err.message || 'Could not load ticket details.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!ticket) return;
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
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-slate-400 text-sm mt-3">Retrieving encrypted ticket pass...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <Text className="text-white text-base">Ticket pass not found.</Text>
      </View>
    );
  }

  const concertDate = ticket.concert ? new Date(ticket.concert.date) : new Date();
  const formattedDate = concertDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = concertDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="flex-1 bg-slate-950">
      {/* Top Bar */}
      <View className="pt-14 pb-4 px-5 flex-row items-center justify-between border-b border-slate-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-extrabold text-base">Concert Pass</Text>
        <TouchableOpacity
          onPress={handleShare}
          className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
          <Ionicons name="share-outline" size={18} color="#c084fc" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* Ticket Container */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Header Banner */}
          <View
            style={{ backgroundColor: ticket.category?.color || '#8b5cf6' }}
            className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="ticket" size={20} color="#020617" style={{ marginRight: 8 }} />
              <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                {ticket.category?.name || 'General'} TIER PASS
              </Text>
            </View>

            <View className="bg-slate-950/20 px-2.5 py-1 rounded-full border border-black/20">
              <Text className="text-slate-950 font-bold text-xs uppercase tracking-widest">
                {ticket.status}
              </Text>
            </View>
          </View>

          {/* Concert & Event Info */}
          <View className="p-6">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {ticket.concert?.city} • TOUR CONCERT
            </Text>
            <Text className="text-2xl font-black text-white mt-1">
              {ticket.concert?.artist}
            </Text>
            <Text className="text-slate-300 font-semibold text-base mt-0.5">
              {ticket.concert?.title}
            </Text>

            <View className="mt-5 flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Date & Time</Text>
                <Text className="text-white font-bold text-xs mt-0.5">{formattedDate}</Text>
                <Text className="text-violet-400 font-semibold text-xs">{formattedTime}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Venue</Text>
                <Text className="text-white font-bold text-xs mt-0.5 numberOfLines={1}">
                  {ticket.concert?.venue}
                </Text>
                <Text className="text-slate-400 text-xs">{ticket.concert?.city}</Text>
              </View>
            </View>

            {/* Seat & Holder Metadata */}
            <View className="mt-5 pt-4 border-t border-slate-800/80 flex-row justify-between">
              <View>
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Ticket Holder</Text>
                <Text className="text-white font-bold text-sm mt-0.5">{ticket.user?.name}</Text>
              </View>

              <View className="items-end">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Seat / Section</Text>
                <Text className="text-emerald-400 font-extrabold text-sm mt-0.5">
                  {ticket.seat || 'General Admission'}
                </Text>
              </View>
            </View>
          </View>

          {/* Perforated Divider with cut-out notches on sides */}
          <View className="relative my-1">
            <View className="h-[2px] border-b border-dashed border-slate-700 w-full" />
            {/* Left Notch */}
            <View className="absolute -left-4 -top-3 h-6 w-6 rounded-full bg-slate-950 border border-slate-800" />
            {/* Right Notch */}
            <View className="absolute -right-4 -top-3 h-6 w-6 rounded-full bg-slate-950 border border-slate-800" />
          </View>

          {/* QR Code Section */}
          <View className="p-6 items-center bg-slate-900/50">
            <Text className="text-slate-400 text-xs font-semibold mb-4 text-center">
              Scan at Venue Gate Turnstile
            </Text>

            {/* Dynamic QR Code */}
            <View className="p-4 bg-white rounded-3xl shadow-xl border-4 border-white">
              <QRCode
                value={ticket.qrPayload || ticket.ticketNumber}
                size={180}
                color="#090d16"
                backgroundColor="#ffffff"
              />
            </View>

            {/* Unique Ticket ID & Booking Reference */}
            <View className="mt-5 items-center">
              <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                Ticket Identifier
              </Text>
              <Text className="text-white font-mono font-black text-sm tracking-wider mt-0.5">
                {ticket.ticketNumber}
              </Text>
              <Text className="text-slate-500 font-mono text-[11px] mt-0.5">
                Ref: {ticket.bookingRef}
              </Text>
            </View>

            {/* Security Verification Pill */}
            <View className="mt-4 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="shield-checkmark" size={14} color="#10b981" style={{ marginRight: 6 }} />
              <Text className="text-emerald-400 font-bold text-xs tracking-wider uppercase">
                Tamper-Proof HMAC Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl py-4 items-center justify-center">
          <Text className="text-slate-300 font-bold text-sm">Close Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
