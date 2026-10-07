import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import { LiveDot } from '@/components/ui/LiveDot';

interface Tier {
  name: string;
  price: number;
  seats: string;
  desc: string;
  color: string;
  width: string;
}

const TIERS: Tier[] = [
  {
    name: 'VIP Floor',
    price: 150,
    seats: '200 seats',
    desc: 'Fast entry · Catwalk access',
    color: '#E86A8A',
    width: '58%',
  },
  {
    name: 'Zone A Center',
    price: 85,
    seats: '600 seats',
    desc: 'Direct center sightline',
    color: '#9282F4',
    width: '72%',
  },
  {
    name: 'Zone B Tier',
    price: 45,
    seats: '800 seats',
    desc: 'Panoramic mid-tier view',
    color: '#4FA3C7',
    width: '86%',
  },
  {
    name: 'Balcony',
    price: 25,
    seats: '400 seats',
    desc: 'Elevated acoustic tier',
    color: '#93A0BE',
    width: '96%',
  },
];

export default function CTLiveHallScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const scrollRef = React.useRef<ScrollView>(null);
  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[0]);
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const selectTier = (tier: Tier) => {
    Haptics.selectionAsync();
    setSelectedTier(tier);
  };

  const handleConfirmOrder = () => {
    const finalName = buyerName.trim() || user?.name || '';
    const finalPhone = phone.trim();

    if (!finalName) {
      Alert.alert('Name required', 'Enter the ticket holder’s full name to continue.');
      return;
    }
    if (!finalPhone) {
      Alert.alert('Phone required', 'Enter a phone number so we can reach the ticket holder.');
      return;
    }

    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOrderConfirmed(orderId);
    // Bring the confirmation panel into view, past the sticky checkout bar
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const qrPayload = JSON.stringify({
    id: orderConfirmed,
    tier: selectedTier.name,
    buyer: buyerName.trim() || user?.name || '',
    price: selectedTier.price,
    venue: 'CT Live Music Hall (Phnom Penh)',
  });

  return (
    <View className="flex-1 bg-night">
      <StatusBar barStyle="light-content" />

      {/* Header — back, title, live status */}
      <View
        style={{ paddingTop: insets.top + 6 }}
        className="px-5 pb-3 flex-row items-center justify-between border-b border-line/70">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 rounded-full bg-card border border-line items-center justify-center active:opacity-70">
          <Ionicons name="arrow-back" size={19} color="#F1F4FA" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <LiveDot reduced={reduced} color="#34D399" size={7} />
          <Text className="text-white font-bold text-[15px] ml-2 tracking-tight">CT Live Hall</Text>
        </View>

        {user ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="h-10 w-10 rounded-full bg-card border border-line items-center justify-center active:opacity-70">
            <Text className="text-iris-300 font-bold text-sm">{user.name[0]}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!user ? (
            /* ---------- Signed-out gate ---------- */
            <View className="items-center px-5 pt-10">
              <View className="h-16 w-16 rounded-3xl bg-iris-500/10 border border-iris-500/30 items-center justify-center mb-5">
                <Ionicons name="flash" size={30} color="#9282F4" />
              </View>
              <Text className="text-white text-2xl font-black tracking-tight text-center">
                Sign in to enter the hall
              </Text>
              <Text className="text-mist text-[13px] text-center mt-2 max-w-[280px] leading-5">
                Seat reservations and flash-sale tickets for CT Live 2026 unlock once you’re signed
                in.
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.85}
                className="mt-7 bg-iris-500 px-8 py-4 rounded-2xl w-full items-center active:scale-[0.98] transition-transform duration-150">
                <Text className="text-white font-bold text-sm">Sign in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                activeOpacity={0.8}
                className="mt-3 bg-card border border-line px-8 py-4 rounded-2xl w-full items-center active:opacity-80">
                <Text className="text-slate-200 font-semibold text-sm">Create an account</Text>
              </TouchableOpacity>

              <View className="w-full mt-2">
                <SocialAuthButtons
                  mode="login"
                  onSuccess={() => {}}
                  onError={(msg) => Alert.alert('Sign-in failed', msg)}
                />
              </View>
            </View>
          ) : (
            <View className="px-5">
              {/* ---------- Event hero ---------- */}
              <View className="mt-6 mb-5">
                <View className="flex-row items-center mb-3">
                  <View className="bg-iris-500/10 border border-iris-500/30 px-2.5 py-1 rounded-md">
                    <Text className="text-iris-300 font-bold text-[10px] tracking-[0.14em] uppercase">
                      Grand opening · Sat 14 Nov
                    </Text>
                  </View>
                </View>
                <Text className="text-white text-[34px] leading-[38px] font-black tracking-[-0.02em]">
                  CT Live 2026
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-outline" size={14} color="#93A0BE" />
                  <Text className="text-mist text-[13px] ml-1.5">
                    Phnom Penh Main Concert Hall · Doors 18:30
                  </Text>
                </View>
              </View>

              {/* ---------- Live sale strip ---------- */}
              <View className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 flex-row items-center mb-6">
                <LiveDot reduced={reduced} color="#34D399" size={7} />
                <Text className="text-emerald-200/90 text-[12px] ml-2 flex-1 leading-4">
                  <Text className="font-bold text-emerald-300">Sale live now.</Text> 2,000 seats
                  across four tiers — reservations hold for 10 minutes.
                </Text>
              </View>

              {/* ---------- Seat map ---------- */}
              <Text className="text-white font-bold text-[15px] tracking-tight mb-3">
                Choose your zone
              </Text>
              <View className="bg-abyss border border-line rounded-3xl p-4 mb-6">
                {/* Stage */}
                <View className="items-center mb-4">
                  <View className="bg-iris-500/20 border border-iris-500/40 rounded-lg px-8 py-2">
                    <Text className="text-iris-300 font-bold text-[10px] tracking-[0.2em]">
                      MAIN STAGE
                    </Text>
                  </View>
                  <View className="h-3 w-[2px] bg-line2" />
                </View>

                {/* Zones — widths are proportional, never fixed px */}
                <View className="items-center gap-2">
                  {TIERS.map((tier) => {
                    const isSelected = selectedTier.name === tier.name;
                    return (
                      <TouchableOpacity
                        key={tier.name}
                        onPress={() => selectTier(tier)}
                        activeOpacity={0.85}
                        style={{
                          width: tier.width as any,
                          backgroundColor: isSelected ? tier.color : `${tier.color}14`,
                          borderColor: isSelected ? tier.color : `${tier.color}40`,
                        }}
                        className="py-2.5 rounded-lg border items-center">
                        <Text
                          className={`text-[11px] font-bold ${
                            isSelected ? 'text-night' : 'text-slate-200'
                          }`}>
                          {tier.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View className="flex-row items-center justify-center mt-4 pt-3 border-t border-line/60">
                  <Ionicons name="information-circle-outline" size={13} color="#5D6A8C" />
                  <Text className="text-dim text-[11px] ml-1.5">
                    Tap a zone or a tier below — both stay in sync
                  </Text>
                </View>
              </View>

              {/* ---------- Tier picker ---------- */}
              <Text className="text-white font-bold text-[15px] tracking-tight mb-3">
                Ticket tiers
              </Text>
              <View className="gap-2.5 mb-6">
                {TIERS.map((tier) => {
                  const isSelected = selectedTier.name === tier.name;
                  return (
                    <TouchableOpacity
                      key={tier.name}
                      onPress={() => selectTier(tier)}
                      activeOpacity={0.85}
                      className={`p-4 rounded-2xl border flex-row items-center ${
                        isSelected ? 'bg-iris-500/10 border-iris-400' : 'bg-card border-line'
                      }`}>
                      <View
                        className="h-2.5 w-2.5 rounded-full mr-3"
                        style={{ backgroundColor: tier.color }}
                      />
                      <View className="flex-1 mr-3">
                        <Text className="text-white font-bold text-[14px]">{tier.name}</Text>
                        <Text className="text-mist text-[12px] mt-0.5">
                          {tier.seats} · {tier.desc}
                        </Text>
                      </View>
                      <Text className="text-white font-black text-[17px] tracking-tight">
                        ${tier.price}
                      </Text>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? '#9282F4' : '#31406B'}
                        style={{ marginLeft: 12 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ---------- Buyer details ---------- */}
              <Text className="text-white font-bold text-[15px] tracking-tight mb-3">
                Ticket holder
              </Text>
              <View className="bg-card border border-line rounded-2xl p-4 mb-6">
                <Text className="text-mist text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5">
                  Full name
                </Text>
                <TextInput
                  value={buyerName}
                  onChangeText={setBuyerName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder={user.name}
                  placeholderTextColor="#5D6A8C"
                  autoCorrect={false}
                  className={`bg-abyss border rounded-xl px-4 py-3.5 text-white text-[15px] ${
                    nameFocused ? 'border-iris-400' : 'border-line'
                  }`}
                />

                <Text className="text-mist text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5 mt-4">
                  Phone number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  placeholder="+855 12 345 678"
                  placeholderTextColor="#5D6A8C"
                  keyboardType="phone-pad"
                  className={`bg-abyss border rounded-xl px-4 py-3.5 text-white text-[15px] ${
                    phoneFocused ? 'border-iris-400' : 'border-line'
                  }`}
                />
                <View className="flex-row items-center mt-3">
                  <Ionicons name="lock-closed-outline" size={12} color="#5D6A8C" />
                  <Text className="text-dim text-[11px] ml-1.5">
                    Used only for ticket delivery and gate verification
                  </Text>
                </View>
              </View>

              {/* ---------- Success panel (replaces the old popup) ---------- */}
              {orderConfirmed && (
                <Animated.View
                  entering={FadeInDown.duration(280)}
                  className="bg-card border border-emerald-500/30 rounded-3xl p-5 mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="h-8 w-8 rounded-full bg-emerald-500/15 items-center justify-center mr-2.5">
                        <Ionicons name="checkmark" size={17} color="#34D399" />
                      </View>
                      <Text className="text-white font-bold text-[15px]">Order confirmed</Text>
                    </View>
                    <View className="bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                      <Text className="text-emerald-300 font-bold text-[10px] tracking-[0.12em]">
                        VERIFIED PASS
                      </Text>
                    </View>
                  </View>

                  <View className="items-center bg-white rounded-2xl p-4 self-center">
                    <QRCode value={qrPayload} size={148} color="#0B1020" backgroundColor="#ffffff" />
                  </View>

                  <View className="items-center mt-4">
                    <Text className="text-mist text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Order ID
                    </Text>
                    <Text className="text-iris-300 font-mono font-bold text-[14px] mt-0.5">
                      {orderConfirmed}
                    </Text>
                    <Text className="text-slate-300 text-[13px] mt-1.5">
                      {selectedTier.name} · ${selectedTier.price}
                    </Text>
                  </View>

                  <Text className="text-dim text-[11px] text-center mt-3 leading-4">
                    Show this code at the CT Live Hall turnstiles. The pass is stored with your
                    order in the secured orders database.
                  </Text>
                </Animated.View>
              )}

              <Text className="text-dim text-[11px] text-center pb-4 leading-4">
                Flash-sale simulation · Operations manager: Mr. Ratana
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ---------- Sticky checkout bar ---------- */}
        {user && (
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            className="absolute bottom-0 left-0 right-0 bg-night/95 border-t border-line px-5 pt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-mist text-[11px] font-semibold uppercase tracking-[0.12em]">
                {selectedTier.name}
              </Text>
              <Text className="text-white font-black text-2xl tracking-tight">
                ${selectedTier.price}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleConfirmOrder}
              activeOpacity={0.85}
              className="bg-iris-500 py-4 px-7 rounded-2xl flex-row items-center active:scale-[0.98] transition-transform duration-150">
              <Ionicons name="flash" size={16} color="#fff" style={{ marginRight: 7 }} />
              <Text className="text-white font-bold text-[15px]">Get tickets</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
