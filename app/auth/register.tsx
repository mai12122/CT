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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import { PhoneAuthForm } from '@/components/PhoneAuthForm';

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="pb-3 px-5 flex-row items-center justify-between border-b border-line/80 bg-night">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-2xl bg-card border border-line items-center justify-center active:scale-95">
          <Ionicons name="arrow-back" size={19} color="#F1F4FA" />
        </TouchableOpacity>
        <Text className="text-dim text-xs font-bold uppercase tracking-[0.14em]">
          Create Account
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View className="mb-6 items-center">
          <View className="h-14 w-14 rounded-2xl bg-blue-500/15 border border-blue-500/35 items-center justify-center mb-3 shadow-md shadow-blue-500/20">
            <Ionicons name="ticket" size={26} color="#60A5FA" />
          </View>
          <Text className="text-blue-300 font-bold text-[11px] tracking-[0.2em] uppercase">
            CT LIVE PASSES
          </Text>
          <Text className="text-3xl font-black text-white tracking-tight mt-0.5">Get Started</Text>
          <Text className="text-mist text-xs mt-1 text-center max-w-[280px]">
            Join to reserve seats and unlock turnstile QR passes
          </Text>
        </View>

        {/* Auth Method Segment Switcher */}
        <View className="flex-row bg-card border border-line p-1 rounded-2xl mb-5">
          <TouchableOpacity
            onPress={() => {
              setAuthMethod('email');
              setError(null);
            }}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
              authMethod === 'email' ? 'bg-iris-500 shadow-sm' : 'bg-transparent'
            }`}>
            <Ionicons
              name="mail-outline"
              size={15}
              color={authMethod === 'email' ? '#fff' : '#5D6A8C'}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-xs font-bold ${
                authMethod === 'email' ? 'text-white' : 'text-mist'
              }`}>
              Email Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setAuthMethod('phone');
              setError(null);
            }}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
              authMethod === 'phone' ? 'bg-iris-500 shadow-sm' : 'bg-transparent'
            }`}>
            <Ionicons
              name="call-outline"
              size={15}
              color={authMethod === 'phone' ? '#fff' : '#5D6A8C'}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-xs font-bold ${
                authMethod === 'phone' ? 'text-white' : 'text-mist'
              }`}>
              Phone OTP (+855)
            </Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View className="mb-4 bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl flex-row items-center">
            <Ionicons name="alert-circle" size={17} color="#FB7185" style={{ marginRight: 8 }} />
            <Text className="text-rose-300 text-xs font-medium flex-1">{error}</Text>
          </View>
        ) : null}

        {authMethod === 'email' ? (
          <View className="gap-3.5">
            <View>
              <Text className="text-dim text-[11px] uppercase font-bold tracking-wider mb-1.5 ml-1">
                Full Name *
              </Text>
              <View className="bg-card border border-line rounded-2xl px-4 flex-row items-center h-12 focus-within:border-iris-400">
                <Ionicons name="person" size={17} color="#5D6A8C" style={{ marginRight: 10 }} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="#5D6A8C"
                  autoCapitalize="words"
                  className="flex-1 text-white text-[14px]"
                />
              </View>
            </View>

            <View>
              <Text className="text-dim text-[11px] uppercase font-bold tracking-wider mb-1.5 ml-1">
                Email Address *
              </Text>
              <View className="bg-card border border-line rounded-2xl px-4 flex-row items-center h-12 focus-within:border-iris-400">
                <Ionicons name="mail" size={17} color="#5D6A8C" style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#5D6A8C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-[14px]"
                />
              </View>
            </View>

            <View>
              <Text className="text-dim text-[11px] uppercase font-bold tracking-wider mb-1.5 ml-1">
                Phone Number (Optional)
              </Text>
              <View className="bg-card border border-line rounded-2xl px-4 flex-row items-center h-12 focus-within:border-iris-400">
                <Ionicons name="call" size={17} color="#5D6A8C" style={{ marginRight: 10 }} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+855 12 345 678"
                  placeholderTextColor="#5D6A8C"
                  keyboardType="phone-pad"
                  className="flex-1 text-white text-[14px]"
                />
              </View>
            </View>

            <View>
              <Text className="text-dim text-[11px] uppercase font-bold tracking-wider mb-1.5 ml-1">
                Password (Min 6 Characters) *
              </Text>
              <View className="bg-card border border-line rounded-2xl px-4 flex-row items-center h-12 focus-within:border-iris-400">
                <Ionicons name="lock-closed" size={17} color="#5D6A8C" style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#5D6A8C"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white text-[14px]"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#5D6A8C"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              className="mt-2 bg-iris-500 border border-iris-400/30 h-13 py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-iris-500/35 active:scale-[0.98]">
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-sm tracking-wide">Create Event Pass Account</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <PhoneAuthForm
            mode="register"
            onSuccess={() => router.back()}
            onError={(msg) => setError(msg)}
          />
        )}

        {/* Social Auth Separator */}
        <View className="mt-7 pt-6 border-t border-line/80">
          <Text className="text-center text-dim text-xs font-semibold uppercase tracking-wider mb-4">
            Or Sign Up With
          </Text>
          <SocialAuthButtons
            mode="register"
            onSuccess={() => router.back()}
            onError={(msg) => setError(msg)}
          />
        </View>

        {/* Footer Link to Login */}
        <View className="flex-row justify-center mt-7">
          <Text className="text-mist text-xs">Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-iris-300 font-bold text-xs">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
