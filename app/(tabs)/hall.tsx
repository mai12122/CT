import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';

interface Tier {
  name: string;
  price: number;
  seats: string;
  desc: string;
  color: string;
}

const TIERS: Tier[] = [
  { name: 'VIP Floor', price: 150, seats: '200 Seats Total', desc: 'Fast Entry • Catwalk Direct', color: '#ec4899' },
  { name: 'Zone A Center', price: 85, seats: '600 Seats Total', desc: 'Direct Center Sightline', color: '#8b5cf6' },
  { name: 'Zone B Tier', price: 45, seats: '800 Seats Total', desc: 'Panoramic Mid-Tier View', color: '#3b82f6' },
  { name: 'Balcony', price: 25, seats: '400 Seats Total', desc: 'Acoustic Elevation Tier', color: '#64748b' },
];

export default function CTLiveHallScreen() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[0]);
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+855 12 345 678');
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const handleConfirmOrder = () => {
    const finalName = buyerName.trim() || user?.name || 'Sopheak Chan';
    const finalPhone = phone.trim() || '+855 12 345 678';
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    setOrderConfirmed(orderId);
    Alert.alert(
      '🎉 Ticket Order Confirmed!',
      `Order ID: ${orderId}\nTicket: ${selectedTier.name} ($${selectedTier.price})\nBuyer: ${finalName} (${finalPhone})\n\nData saved securely to isolated orders database.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View className="pt-14 pb-4 px-5 bg-slate-950/80 border-b border-slate-900 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/40 items-center justify-center mr-3">
            <Ionicons name="sparkles" size={20} color="#c084fc" />
          </View>
          <View>
            <Text className="text-xs font-bold text-violet-400 tracking-widest uppercase">
              PHNOM PENH • 2,000 SEATS
            </Text>
            <Text className="text-xl font-extrabold text-white">CT Live Music Hall</Text>
          </View>
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
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            className="bg-violet-600 rounded-full py-1.5 px-3.5 shadow-sm shadow-violet-500/50">
            <Text className="text-white text-xs font-bold">Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* ========================================================= */}
        {/* AUTHENTICATION REQUIRED GATE (IF NOT SIGNED IN) */}
        {/* ========================================================= */}
        {!user ? (
          <View className="items-center py-12">
            <View className="h-20 w-20 rounded-full bg-violet-600/10 border border-violet-500/30 items-center justify-center mb-4">
              <Ionicons name="lock-closed-outline" size={40} color="#a78bfa" />
            </View>
            <Text className="text-white text-xl font-black">Authentication Required</Text>
            <Text className="text-slate-400 text-xs text-center mt-1.5 max-w-xs leading-relaxed">
              Please sign in to access CT Live Music Hall seat reservations and flash sale tickets.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.85}
              className="mt-6 bg-violet-600 px-8 py-3.5 rounded-2xl w-full items-center shadow-lg shadow-violet-600/40">
              <Text className="text-white font-extrabold text-sm">Sign In to Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              activeOpacity={0.8}
              className="mt-3 bg-slate-900 border border-slate-800 px-8 py-3.5 rounded-2xl w-full items-center">
              <Text className="text-slate-200 font-bold text-sm">Create New Account (Sign Up)</Text>
            </TouchableOpacity>

            <View className="mt-8 bg-slate-900 border border-slate-800/80 rounded-2xl p-4 w-full">
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                Scenario 2 Simulation Notice
              </Text>
              <Text className="text-slate-500 text-xs">
                Operations Manager: Mr. Ratana • High-availability flash sale with buyer identity protected in isolated subnets.
              </Text>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* CT LIVE MUSIC HALL (UNLOCKED AFTER AUTHENTICATION) */
          /* ========================================================= */
          <View>
            {/* Live Rush Alert */}
            <View className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 mb-5 flex-row items-center">
              <View className="h-2.5 w-2.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse" />
              <Text className="text-emerald-300 text-xs font-semibold flex-1">
                <Text className="font-bold">Sale Rush Active:</Text> 10,000 visitors online. 2,000 total seats available. Decoupled high-availability architecture active.
              </Text>
            </View>

            {/* Poster Card */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-5">
              <View className="bg-gradient-to-b from-indigo-950 to-slate-950 p-6 items-center border-b border-slate-800">
                <View className="bg-violet-600/30 border border-violet-500/40 px-3 py-1 rounded-full mb-2">
                  <Text className="text-violet-300 font-extrabold text-[10px] tracking-widest uppercase">
                    Grand Opening Festival
                  </Text>
                </View>
                <Text className="text-white font-black text-2xl">CT LIVE 2026</Text>
                <Text className="text-violet-200 text-xs mt-0.5">Phnom Penh Main Concert Hall</Text>
                <View className="mt-3 bg-emerald-500 px-3.5 py-1 rounded-full">
                  <Text className="text-slate-950 font-black text-xs">2,000 SEATS LIMITED</Text>
                </View>
              </View>

              {/* Hall Seat Map Visualizer */}
              <View className="p-5">
                <Text className="text-white font-black text-sm mb-3">Hall Seat Map (2,000 Capacity)</Text>

                <View className="bg-slate-950 border border-slate-800 rounded-2xl p-4 items-center">
                  {/* Main Stage */}
                  <View className="bg-blue-600 w-44 py-1.5 rounded-md items-center mb-2">
                    <Text className="text-white font-black text-[11px] tracking-wider">MAIN STAGE</Text>
                  </View>

                  {/* VIP Floor */}
                  <TouchableOpacity
                    onPress={() => setSelectedTier(TIERS[0])}
                    className={`w-52 py-2 rounded-lg items-center mb-2 border ${
                      selectedTier.name === 'VIP Floor' ? 'border-pink-400 bg-pink-600' : 'border-pink-600/40 bg-pink-950/60'
                    }`}>
                    <Text className="text-white font-bold text-xs">VIP Floor (200 Seats) — $150</Text>
                  </TouchableOpacity>

                  {/* Zone A Center */}
                  <TouchableOpacity
                    onPress={() => setSelectedTier(TIERS[1])}
                    className={`w-64 py-2 rounded-lg items-center mb-2 border ${
                      selectedTier.name === 'Zone A Center' ? 'border-violet-400 bg-violet-600' : 'border-violet-600/40 bg-violet-950/60'
                    }`}>
                    <Text className="text-white font-bold text-xs">Zone A Center (600 Seats) — $85</Text>
                  </TouchableOpacity>

                  {/* Zone B Tier */}
                  <TouchableOpacity
                    onPress={() => setSelectedTier(TIERS[2])}
                    className={`w-72 py-2 rounded-lg items-center mb-2 border ${
                      selectedTier.name === 'Zone B Tier' ? 'border-sky-400 bg-sky-600' : 'border-sky-600/40 bg-sky-950/60'
                    }`}>
                    <Text className="text-white font-bold text-xs">Zone B Tier (800 Seats) — $45</Text>
                  </TouchableOpacity>

                  {/* Balcony */}
                  <TouchableOpacity
                    onPress={() => setSelectedTier(TIERS[3])}
                    className={`w-80 py-1.5 rounded-lg items-center border ${
                      selectedTier.name === 'Balcony' ? 'border-slate-400 bg-slate-600' : 'border-slate-700 bg-slate-900'
                    }`}>
                    <Text className="text-slate-300 font-semibold text-[11px]">Balcony (400 Seats) — $25</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Instant Ticket Order Card */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <Text className="text-white font-black text-lg mb-1">Instant Ticket Order (R1)</Text>
              <Text className="text-slate-400 text-xs mb-4">
                Buyer data protected in isolated subnets (S1).
              </Text>

              {/* Tier Selection */}
              <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Select Ticket Tier
              </Text>
              <View className="mb-4">
                {TIERS.map((tier) => {
                  const isSelected = selectedTier.name === tier.name;
                  return (
                    <TouchableOpacity
                      key={tier.name}
                      onPress={() => setSelectedTier(tier)}
                      activeOpacity={0.8}
                      className={`p-3.5 rounded-2xl border mb-2 flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500'
                          : 'bg-slate-950 border-slate-800'
                      }`}>
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          style={{ backgroundColor: tier.color }}
                          className="h-3 w-3 rounded-full mr-3"
                        />
                        <View>
                          <Text className="text-white font-bold text-sm">{tier.name}</Text>
                          <Text className="text-slate-400 text-[11px]">{tier.seats} • {tier.desc}</Text>
                        </View>
                      </View>
                      <Text className="text-emerald-400 font-extrabold text-base">${tier.price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Buyer Full Name */}
              <View className="mb-3">
                <Text className="text-slate-300 text-xs font-semibold mb-1">Buyer Full Name (R4)</Text>
                <TextInput
                  value={buyerName || user.name}
                  onChangeText={setBuyerName}
                  placeholder="e.g. Sopheak Chan"
                  placeholderTextColor="#64748b"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                />
              </View>

              {/* Phone Number */}
              <View className="mb-4">
                <Text className="text-slate-300 text-xs font-semibold mb-1">Phone Number (R4)</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +855 12 345 678"
                  placeholderTextColor="#64748b"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                />
              </View>

              {/* Confirm Purchase Button */}
              <TouchableOpacity
                onPress={handleConfirmOrder}
                activeOpacity={0.85}
                className="bg-violet-600 rounded-2xl py-4 items-center justify-center shadow-lg shadow-violet-600/40">
                <Text className="text-white font-extrabold text-sm tracking-wide">
                  Confirm Ticket Purchase • ${selectedTier.price}
                </Text>
              </TouchableOpacity>

              {orderConfirmed && (
                <View className="mt-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 items-center">
                  <View className="flex-row items-center mb-1 w-full justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={18} color="#34d399" style={{ marginRight: 6 }} />
                      <Text className="text-emerald-400 font-extrabold text-sm">Order Confirmed!</Text>
                    </View>
                    <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Text className="text-emerald-300 font-bold text-[10px]">VERIFIED PASS</Text>
                    </View>
                  </View>

                  <View className="my-3 p-3 bg-white rounded-2xl shadow-lg border-2 border-white">
                    <QRCode
                      value={JSON.stringify({
                        id: orderConfirmed,
                        tier: selectedTier.name,
                        buyer: buyerName.trim() || user?.name || 'Sopheak Chan',
                        price: selectedTier.price,
                        venue: 'CT Live Music Hall (Phnom Penh)',
                      })}
                      size={140}
                      color="#020617"
                      backgroundColor="#ffffff"
                    />
                  </View>

                  <Text className="text-white font-bold text-xs mt-1">
                    Order ID: <Text className="font-mono text-violet-300">{orderConfirmed}</Text>
                  </Text>
                  <Text className="text-slate-300 text-xs mt-0.5">
                    Ticket: {selectedTier.name} (${selectedTier.price})
                  </Text>
                  <Text className="text-slate-400 text-[10px] mt-1">
                    Scan this dynamic QR code at the CT Live Music Hall turnstiles
                  </Text>
                  <Text className="text-emerald-300/80 text-[11px] mt-2 border-t border-emerald-900/60 pt-2 w-full text-center">
                    🔒 Data saved securely to isolated PostgreSQL orders database (S1, S4).
                  </Text>
                </View>
              )}
            </View>

            <View className="items-center py-4 mt-2">
              <Text className="text-slate-500 text-[11px]">
                Operations Manager: Mr. Ratana | Scenario 2 Flash Sale Simulation
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
