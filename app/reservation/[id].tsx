import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ReservationSession } from '@/types';

export default function ReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<ReservationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(600); // 10 minutes default
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'apple_pay' | 'instant'>('card');

  const handleExpired = () => {
    Alert.alert(
      'Reservation Expired',
      'Your 10-minute ticket hold has expired and tickets have been returned to the available pool.',
      [
        {
          text: 'Return to Concerts',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    api.getReservationSession(id as string).then((data) => {
      if (!active) return;
      setSession(data);
      setSecondsLeft(data.remainingSeconds);
      if (data.status === 'EXPIRED' || data.remainingSeconds <= 0) {
        handleExpired();
      }
    }).catch((err: any) => {
      if (active) {
        Alert.alert('Error', err.message || 'Could not load reservation session.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  // Live timer interval
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleConfirmBooking = async () => {
    if (secondsLeft <= 0) {
      handleExpired();
      return;
    }

    setConfirming(true);
    try {
      const data = await api.confirmBooking(id as string, selectedPayment.toUpperCase());
      const booking = data.booking;
      router.replace({
        pathname: '/booking-success/[id]' as any,
        params: { id: booking.id, bookingRef: booking.bookingRef },
      });
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Payment or confirmation failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    Alert.alert(
      'Release Tickets?',
      'Are you sure you want to release these tickets? They will immediately become available to other buyers.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Release Now',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.cancelReservationSession(id as string);
              router.replace('/(tabs)');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not cancel reservation.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-slate-400 text-sm mt-3">Verifying reservation hold...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <Text className="text-white text-base">Reservation session not found.</Text>
      </View>
    );
  }

  // Format mm:ss
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft < 120; // less than 2 minutes left
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 600) * 100));

  // Pricing calculations
  const subtotal = session.totalPrice;
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + serviceFee + tax) * 100) / 100;

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Top App Header */}
        <View className="pt-14 pb-4 px-5 flex-row items-center justify-between border-b border-slate-900">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-extrabold text-base">Confirm & Checkout</Text>
          <TouchableOpacity onPress={handleCancelHold} disabled={cancelling}>
            <Text className="text-rose-400 font-bold text-xs uppercase">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* 10-Minute Countdown Timer Card */}
        <View className="mx-5 mt-5">
          <View
            className={`rounded-3xl p-5 border ${
              isUrgent
                ? 'bg-rose-950/40 border-rose-500/50'
                : 'bg-violet-950/40 border-violet-500/40'
            }`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`h-10 w-10 rounded-xl items-center justify-center mr-3 ${
                    isUrgent ? 'bg-rose-500/20' : 'bg-violet-500/20'
                  }`}>
                  <Ionicons
                    name="time"
                    size={22}
                    color={isUrgent ? '#f43f5e' : '#c084fc'}
                  />
                </View>
                <View>
                  <Text
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isUrgent ? 'text-rose-400' : 'text-violet-400'
                    }`}>
                    {isUrgent ? 'Hurry! Hold Expiring' : '10-Minute Hold Active'}
                  </Text>
                  <Text className="text-slate-300 text-xs mt-0.5">
                    Your tickets are locked exclusively for you
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text
                  className={`text-2xl font-black tracking-widest ${
                    isUrgent ? 'text-rose-400 animate-pulse' : 'text-white'
                  }`}>
                  {timeString}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="w-full bg-slate-900 h-2 rounded-full mt-4 overflow-hidden">
              <View
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: isUrgent ? '#f43f5e' : '#8b5cf6',
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </View>
          </View>
        </View>

        {/* Selected Concert Card */}
        <View className="mx-5 mt-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-row">
          <Image
            source={{ uri: session.imageUrl }}
            style={{ width: 85, height: 95, borderRadius: 16 }}
            resizeMode="cover"
          />
          <View className="flex-1 ml-3.5 justify-between">
            <View>
              <View className="flex-row items-center mb-1">
                <View
                  style={{ backgroundColor: session.categoryColor }}
                  className="px-2 py-0.5 rounded-md mr-2">
                  <Text className="text-slate-950 font-black text-[10px] uppercase">
                    {session.categoryName}
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs font-semibold">
                  {session.quantity} {session.quantity > 1 ? 'Tickets' : 'Ticket'}
                </Text>
              </View>
              <Text className="text-white font-extrabold text-base leading-tight">
                {session.artist}
              </Text>
              <Text className="text-slate-400 text-xs numberOfLines={1} mt-0.5">
                {session.concertTitle}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text className="text-slate-400 text-[11px] numberOfLines={1}">
                {session.venue}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View className="mx-5 mt-6">
          <Text className="text-white text-base font-extrabold mb-3">Payment Method</Text>

          <View className="space-y-2.5">
            <TouchableOpacity
              onPress={() => setSelectedPayment('card')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between mb-2.5 ${
                selectedPayment === 'card'
                  ? 'bg-slate-900 border-violet-500'
                  : 'bg-slate-900/60 border-slate-800'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-violet-600/20 items-center justify-center mr-3">
                  <Ionicons name="card" size={20} color="#a78bfa" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Credit / Debit Card</Text>
                  <Text className="text-slate-400 text-xs">Visa ending in •••• 4242</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'card' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'card' ? '#8b5cf6' : '#64748b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPayment('apple_pay')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between mb-2.5 ${
                selectedPayment === 'apple_pay'
                  ? 'bg-slate-900 border-violet-500'
                  : 'bg-slate-900/60 border-slate-800'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-slate-800 items-center justify-center mr-3">
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Apple / Google Pay</Text>
                  <Text className="text-slate-400 text-xs">Fast biometrics checkout</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'apple_pay' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'apple_pay' ? '#8b5cf6' : '#64748b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPayment('instant')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                selectedPayment === 'instant'
                  ? 'bg-slate-900 border-violet-500'
                  : 'bg-slate-900/60 border-slate-800'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-emerald-600/20 items-center justify-center mr-3">
                  <Ionicons name="flash" size={20} color="#34d399" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Demo Instant One-Click</Text>
                  <Text className="text-slate-400 text-xs">Simulate instant verified transaction</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'instant' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'instant' ? '#8b5cf6' : '#64748b'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Summary */}
        <View className="mx-5 mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <Text className="text-white text-base font-extrabold mb-4">Price Breakdown</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">
                {session.categoryName} x {session.quantity} (${session.unitPrice} each)
              </Text>
              <Text className="text-white font-semibold text-sm">${subtotal.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">Platform & Service Fee (5%)</Text>
              <Text className="text-white font-semibold text-sm">${serviceFee.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">Stadium & State Tax (8%)</Text>
              <Text className="text-white font-semibold text-sm">${tax.toFixed(2)}</Text>
            </View>

            <View className="h-[1px] bg-slate-800 my-2" />

            <View className="flex-row justify-between items-baseline pt-1">
              <Text className="text-white font-extrabold text-base">Total Amount</Text>
              <Text className="text-emerald-400 font-black text-2xl">${grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-900 p-4 pb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 text-[10px] uppercase font-bold">Total to Pay</Text>
          <Text className="text-white font-black text-2xl">${grandTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={confirming || secondsLeft <= 0}
          activeOpacity={0.85}
          className={`py-3.5 px-8 rounded-2xl flex-row items-center justify-center shadow-lg shadow-violet-600/40 ${
            confirming || secondsLeft <= 0 ? 'bg-slate-800 opacity-60' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}>
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-black text-base tracking-wide">
                Pay & Confirm
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
