import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  MaterialTopAppBar,
  MaterialTextField,
  MaterialButton,
  MaterialCard,
} from '@/components/material';

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
      style={{ flex: 1, backgroundColor: '#141218' }}>
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      <MaterialTopAppBar
        title="Sign In"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="mb-6 items-center">
          <View className="h-16 w-16 rounded-full bg-md-primaryContainer items-center justify-center mb-3">
            <Ionicons name="musical-notes" size={32} color="#EADDFF" />
          </View>
          <Text className="text-2xl font-bold text-md-onSurface tracking-tight">Welcome Back</Text>
          <Text className="text-md-onSurfaceVariant text-xs mt-1 text-center font-normal">
            Sign in to reserve seats and access your live concert passes
          </Text>
        </View>

        {error && (
          <MaterialCard variant="outlined" className="bg-md-errorContainer/20 border-md-error/40 p-3 mb-4 flex-row items-center">
            <Ionicons name="alert-circle" size={18} color="#F2B8B5" style={{ marginRight: 8 }} />
            <Text className="text-md-error text-xs flex-1 font-medium">{error}</Text>
          </MaterialCard>
        )}

        <View>
          <MaterialTextField
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leadingIcon={<Ionicons name="mail-outline" size={18} color="#CAC4D0" />}
          />

          <MaterialTextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            leadingIcon={<Ionicons name="lock-closed-outline" size={18} color="#CAC4D0" />}
          />

          <MaterialButton
            variant="filled"
            label="Sign In"
            loading={loading}
            className="mt-2 w-full h-12"
            onPress={handleLogin}
          />

          {/* Quick Demo Fill Button */}
          <MaterialButton
            variant="tonal"
            label="Auto-fill Demo Account"
            icon={<Ionicons name="flash" size={16} color="#E8DEF8" />}
            className="mt-3 w-full"
            onPress={fillDemoUser}
          />
        </View>

        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-md-onSurfaceVariant text-xs">Don&apos;t have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-md-primary font-bold text-xs">Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
