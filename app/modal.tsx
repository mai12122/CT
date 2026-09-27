import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-slate-950 p-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between pb-4 border-b border-slate-900 mb-6">
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-xl bg-violet-600/20 items-center justify-center mr-3 border border-violet-500/30">
              <Ionicons name="sparkles" size={20} color="#a78bfa" />
            </View>
            <View>
              <Text className="text-white text-lg font-black">Concert Ticketing System</Text>
              <Text className="text-slate-400 text-xs">High-Demand Event Platform</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 rounded-full bg-slate-900 items-center justify-center border border-slate-800">
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="space-y-4">
          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">10-Minute Hold Mechanism</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              When tickets are selected, an exclusive 10-minute reservation session is generated. Overdue sessions are automatically released by background workers.
            </Text>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={18} color="#34d399" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">Overselling Protection</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              Powered by PostgreSQL transactions and row-level locks (SELECT FOR UPDATE) to eliminate race conditions during high-traffic ticket drops.
            </Text>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="qr-code" size={18} color="#818cf8" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">Dynamic HMAC QR Codes</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              Every confirmed ticket generates a cryptographically signed HMAC SHA-256 payload displayed as a high-density turnstile QR pass.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-violet-600 py-3.5 rounded-2xl items-center">
          <Text className="text-white font-bold text-sm">Got It</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
