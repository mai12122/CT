import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ModalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-night p-6">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        }}>
        <View className="flex-row items-center justify-between pb-4 border-b border-line mb-6">
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-xl bg-iris-500/10 items-center justify-center mr-3 border border-iris-500/30">
              <Ionicons name="sparkles" size={19} color="#9282F4" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold tracking-tight">
                Ticketing system
              </Text>
              <Text className="text-mist text-xs">How your tickets stay safe</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 rounded-full bg-card items-center justify-center border border-line">
            <Ionicons name="close" size={17} color="#F1F4FA" />
          </TouchableOpacity>
        </View>

        <View className="gap-4">
          <View className="bg-card border border-line rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={17} color="#F5B04C" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">10-minute hold</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              Selecting tickets creates a reservation held only for you for 10 minutes. After that,
              the seats return to the public pool automatically.
            </Text>
          </View>

          <View className="bg-card border border-line rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={17} color="#34D399" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">No double-selling</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              Every checkout runs through database-level locking, so the same seat can never be
              sold twice — even during a flash sale.
            </Text>
          </View>

          <View className="bg-card border border-line rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="qr-code" size={17} color="#9282F4" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-sm">Signed QR passes</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed">
              Each confirmed ticket gets a cryptographically signed QR code that gate scanners
              verify in one scan. Copies and edits are rejected.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-iris-500 py-3.5 rounded-2xl items-center active:scale-[0.98] transition-transform duration-150">
          <Text className="text-white font-bold text-sm">Got it</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'light'} />
    </View>
  );
}
