import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, phone.trim() || undefined);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#090d16' }}>
      <StatusBar barStyle="light-content" />

      {/* Top Navigation Bar with Back Button */}
      <View className="pt-12 pb-2 px-5 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Create Account
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-6 items-center">
          <View className="h-16 w-16 rounded-2xl bg-violet-600/20 items-center justify-center border border-violet-500/40 mb-3">
            <Ionicons name="person-add-outline" size={30} color="#a78bfa" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-wider">Create Account</Text>
          <Text className="text-slate-400 text-sm mt-1 text-center">
            Join to reserve concert passes and get exclusive perks
          </Text>
        </View>

        {error && (
          <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-5 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#f43f5e" style={{ marginRight: 8 }} />
            <Text className="text-rose-400 text-sm flex-1">{error}</Text>
          </View>
        )}

        <View className="space-y-4">
          <View>
            <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Full Name *
            </Text>
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons name="person-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                placeholderTextColor="#64748b"
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address *
            </Text>
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons name="mail-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="jane@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Phone Number (Optional)
            </Text>
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons name="call-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+855 12 345 678"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Password (Min 6 chars) *
            </Text>
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-violet-600 hover:bg-violet-500 rounded-xl py-4 items-center justify-center mt-6 shadow-lg shadow-violet-600/40">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">Register Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-slate-400 text-sm">Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-violet-400 font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
