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

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@example.com');
    setPassword('password123');
    setError(null);
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
          Sign In
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-8 items-center">
          <View className="h-16 w-16 rounded-2xl bg-violet-600/20 items-center justify-center border border-violet-500/40 mb-3">
            <Ionicons name="musical-notes" size={32} color="#a78bfa" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-wider">Welcome Back</Text>
          <Text className="text-slate-400 text-sm mt-1 text-center">
            Sign in to reserve seats and access your live concert tickets
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
              Email Address
            </Text>
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons name="mail-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
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
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-violet-600 hover:bg-violet-500 rounded-xl py-4 items-center justify-center mt-6 shadow-lg shadow-violet-600/40">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Fill Button */}
          <TouchableOpacity
            onPress={fillDemoUser}
            activeOpacity={0.7}
            className="border border-violet-500/30 bg-violet-950/30 rounded-xl py-3 px-4 flex-row items-center justify-center mt-3">
            <Ionicons name="flash-outline" size={16} color="#c084fc" style={{ marginRight: 6 }} />
            <Text className="text-violet-300 font-semibold text-xs tracking-wider">
              Auto-fill Demo Account (user@example.com)
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-slate-400 text-sm">Don&apos;t have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text className="text-violet-400 font-bold text-sm">Create One (Sign Up)</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
