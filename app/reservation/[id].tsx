import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/api';
import { ReservationSession } from '@/types';

export default function ReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<ReservationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'apple_pay' | 'instant'>('card');

  const handleExpired = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reservation Expired',
      'Your 10-minute ticket hold has expired and tickets have returned to the general inventory.',
      [
        {
          text: 'Browse Shows',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .getReservationSession(id as string)
      .then((data) => {
        if (!active) return;
        setSession(data);
        setSecondsLeft(data.remainingSeconds);
        if (data.status === 'EXPIRED' || data.remainingSeconds <= 0) {
          handleExpired();
        }
      })
      .catch((err: any) => {
        if (active) {
          Alert.alert('Error', err.message || 'Could not load reservation session.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') },
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const handleCancelSession = async () => {
    Alert.alert(
      'Release Hold',
      'Are you sure you want to cancel this reservation and release your held tickets?',
      [
        { text: 'Keep Hold', style: 'cancel' },
        {
          text: 'Release Tickets',
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

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsLeft < 120;

  if (loading || !session) {
    return (
      <View className="flex-1 bg-night items-center justify-center">
        <ActivityIndicator size="large" color="#9282F4" />
        <Text className="text-mist text-sm mt-3">Retrieving your held passes…</Text>
      </View>
    );
  }

  const fees = (session.totalPrice * 0.08).toFixed(2);
  const grandTotal = (session.totalPrice + parseFloat(fees)).toFixed(2);

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-3.5 flex-row items-center justify-between border-b border-line bg-night">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-2xl bg-card border border-line items-center justify-center active:scale-95">
          <Ionicons name="arrow-back" size={19} color="#F1F4FA" />
        </TouchableOpacity>
        <Text className="text-white font-black text-[17px] tracking-tight">Checkout</Text>
        <TouchableOpacity
          onPress={handleCancelSession}
          disabled={cancelling}
          className="py-1.5 px-3 rounded-full bg-rose-500/10 border border-rose-500/25">
          <Text className="text-rose-400 font-bold text-xs">Release</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* Urgency Live Countdown Pill */}
        <View
          className={`rounded-3xl p-4 border flex-row items-center justify-between shadow-lg mb-5 ${
            isUrgent
              ? 'bg-rose-500/15 border-rose-500/40'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
          <View className="flex-row items-center">
            <View
              className={`h-11 w-11 rounded-2xl items-center justify-center mr-3 ${
                isUrgent ? 'bg-rose-500/25' : 'bg-amber-500/20'
              }`}>
              <Ionicons
                name="timer"
                size={22}
                color={isUrgent ? '#FB7185' : '#F5B04C'}
              />
            </View>
            <View>
              <Text
                className={`text-[10px] uppercase font-bold tracking-[0.14em] ${
                  isUrgent ? 'text-rose-300' : 'text-amber-300'
                }`}>
                {isUrgent ? 'HOLD EXPIRING IMMINENTLY' : 'TEMPORARY HOLD ACTIVE'}
              </Text>
              <Text className="text-white text-xs mt-0.5">Tickets held exclusively for you</Text>
            </View>
          </View>

          <View className="items-end bg-night/80 px-3.5 py-1.5 rounded-2xl border border-white/10">
            <Text
              className={`font-mono font-black text-xl tracking-wider ${
                isUrgent ? 'text-rose-400' : 'text-amber-400'
              }`}>
              {formattedTime}
            </Text>
          </View>
        </View>

        {/* Order Details Card */}
        <View className="bg-card border border-line rounded-3xl p-5 shadow-lg mb-5">
          <Text className="text-dim text-[11px] font-bold uppercase tracking-wider mb-3">
            Concert Pass Summary
          </Text>

          <View className="flex-row items-start pb-4 border-b border-line/80">
            {session.imageUrl ? (
              <Image
                source={{ uri: session.imageUrl }}
                style={{ width: 68, height: 68, borderRadius: 16, marginRight: 14 }}
                resizeMode="cover"
              />
            ) : null}

            <View className="flex-1">
              <Text className="text-white font-black text-lg leading-tight" numberOfLines={1}>
                {session.concertTitle}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-iris-500/20 border border-iris-500/40 px-2.5 py-0.5 rounded-md mr-2">
                  <Text className="text-iris-300 font-extrabold text-[10px] uppercase">
                    {session.categoryName}
                  </Text>
                </View>
                <Text className="text-mist text-xs font-semibold">{session.quantity}x Tickets</Text>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View className="mt-4 gap-2.5">
            <View className="flex-row justify-between">
              <Text className="text-mist text-xs">
                Passes ({session.quantity}x ${session.unitPrice})
              </Text>
              <Text className="text-white font-bold text-xs">${session.totalPrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-mist text-xs">Service & Venue Facilities Fee</Text>
              <Text className="text-white font-bold text-xs">${fees}</Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-line/80">
              <Text className="text-white font-black text-sm">Total Due</Text>
              <Text className="text-emerald-300 font-black text-lg">${grandTotal}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View className="bg-card border border-line rounded-3xl p-5 shadow-lg mb-5">
          <Text className="text-dim text-[11px] font-bold uppercase tracking-wider mb-3">
            Payment Method
          </Text>

          <View className="gap-2.5">
            <TouchableOpacity
              onPress={() => setSelectedPayment('card')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                selectedPayment === 'card'
                  ? 'bg-card2 border-iris-400'
                  : 'bg-night border-line'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-iris-500/15 items-center justify-center mr-3">
                  <Ionicons name="card" size={18} color="#C4B5FD" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Credit or Debit Card</Text>
                  <Text className="text-mist text-[11px]">Visa, Mastercard, Amex</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'card' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'card' ? '#9282F4' : '#5D6A8C'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPayment('apple_pay')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                selectedPayment === 'apple_pay'
                  ? 'bg-card2 border-iris-400'
                  : 'bg-night border-line'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-white/10 items-center justify-center mr-3">
                  <Ionicons name="logo-apple" size={18} color="#fff" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Apple Pay / Digital Wallet</Text>
                  <Text className="text-mist text-[11px]">Instant biometric authorization</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'apple_pay' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'apple_pay' ? '#9282F4' : '#5D6A8C'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPayment('instant')}
              activeOpacity={0.8}
              className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                selectedPayment === 'instant'
                  ? 'bg-card2 border-iris-400'
                  : 'bg-night border-line'
              }`}>
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
                  <Ionicons name="flash" size={18} color="#34D399" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">Instant Bank Pay / ABA</Text>
                  <Text className="text-mist text-[11px]">Zero-fee instant settlement</Text>
                </View>
              </View>
              <Ionicons
                name={selectedPayment === 'instant' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedPayment === 'instant' ? '#9282F4' : '#5D6A8C'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Guarantee Note */}
        <View className="flex-row items-center bg-card/60 border border-line rounded-2xl p-3.5">
          <Ionicons name="lock-closed" size={16} color="#34D399" style={{ marginRight: 10 }} />
          <Text className="text-mist text-xs flex-1">
            End-to-end 256-bit encrypted transaction protected by database-level lock guarantee.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 left-0 right-0 bg-night/95 backdrop-blur-md border-t border-line px-5 pt-3.5 flex-row items-center justify-between shadow-2xl">
        <View>
          <Text className="text-dim text-[10px] uppercase font-bold tracking-wider">
            Total Amount
          </Text>
          <Text className="text-white font-black text-2xl">${grandTotal}</Text>
        </View>

        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={confirming || secondsLeft <= 0}
          activeOpacity={0.85}
          className="bg-iris-500 border border-iris-400/30 py-3.5 px-7 rounded-2xl flex-row items-center justify-center shadow-lg shadow-iris-500/40 active:scale-95 transition-transform">
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-sm tracking-wide">Confirm & Pay</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
