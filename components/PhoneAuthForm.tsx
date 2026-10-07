import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface PhoneAuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onError: (msg: string | null) => void;
}

export const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({
  mode,
  onSuccess,
  onError,
}) => {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [countryCode, setCountryCode] = useState('+855');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'ENTER_PHONE' | 'VERIFY_OTP'>('ENTER_PHONE');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const cleanDigits = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
  const fullPhone = `${countryCode}${cleanDigits}`;

  const handleSendOtp = async () => {
    if (mode === 'register' && !name.trim()) {
      onError('Please enter your full name first.');
      return;
    }
    if (cleanDigits.length < 8) {
      onError('Please enter a valid Cambodian phone number (at least 8 digits, e.g. 12 345 678).');
      return;
    }

    onError(null);
    setLoading(true);
    try {
      const res = await sendPhoneOtp(fullPhone);
      setDevOtpHint(res.devOtp || '123456');
      setStep('VERIFY_OTP');
      setResendTimer(45);
    } catch (err: any) {
      onError(err.message || 'Failed to send verification SMS.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      onError('Please enter the 6-digit verification code.');
      return;
    }

    onError(null);
    setLoading(true);
    try {
      await verifyPhoneOtp(
        fullPhone,
        otpCode.trim(),
        mode === 'register' ? name.trim() : undefined
      );
      onSuccess();
    } catch (err: any) {
      onError(err.message || 'Invalid verification code. Try demo code: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCode = () => {
    setOtpCode(devOtpHint || '123456');
    onError(null);
  };

  const handleFillDemoPhone = () => {
    setCountryCode('+855');
    setPhoneNumber('12345678');
    if (mode === 'register') setName('Sopheak Chan');
    onError(null);
  };

  return (
    <View>
      {step === 'ENTER_PHONE' ? (
        <View>
          {mode === 'register' && (
            <View className="mb-4">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Full Name *
              </Text>
              <View className="bg-card border border-line rounded-xl px-4 py-3.5 flex-row items-center">
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#5D6A8C"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sopheak Chan"
                  placeholderTextColor="#5D6A8C"
                  className="flex-1 text-white text-base"
                />
              </View>
            </View>
          )}

          <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Cambodian Phone Number *
          </Text>
          <View className="flex-row items-center">
            {/* Cambodian Country Code Pill */}
            <View className="bg-card border border-line rounded-xl px-3 py-3.5 mr-2 flex-row items-center">
              <Text className="text-base mr-1">🇰🇭</Text>
              <Text className="text-white font-bold text-base mr-1">{countryCode}</Text>
            </View>

            {/* Phone Input */}
            <View className="flex-1 bg-card border border-line rounded-xl px-4 py-3.5 flex-row items-center">
              <Ionicons
                name="call-outline"
                size={18}
                color="#5D6A8C"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="012 345 678"
                placeholderTextColor="#5D6A8C"
                keyboardType="phone-pad"
                className="flex-1 text-white text-base"
              />
            </View>
          </View>

          {/* Quick Demo Phone Fill */}
          <TouchableOpacity
            onPress={handleFillDemoPhone}
            activeOpacity={0.7}
            className="mt-3 flex-row items-center">
            <Ionicons name="flash-outline" size={13} color="#9282F4" style={{ marginRight: 4 }} />
            <Text className="text-iris-300 text-xs font-semibold">
              Fill demo phone (+855 12 345 678)
            </Text>
          </TouchableOpacity>

          {/* Send Verification Code Button */}
          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-iris-500 rounded-xl py-4 items-center justify-center mt-5 active:scale-[0.98] transition-transform duration-150">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">
                Send Cambodian SMS Code (+855)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* STEP 2: VERIFY OTP */
        <View>
          <View className="bg-card border border-line rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color="#10b981"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold text-sm">Code sent to {fullPhone}</Text>
              </View>
              <TouchableOpacity onPress={() => setStep('ENTER_PHONE')}>
                <Text className="text-iris-300 text-xs font-semibold">Edit</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-slate-400 text-xs mt-1">
              Enter the 6-digit SMS verification code to verify your phone number.
            </Text>
          </View>

          {/* Demo OTP Helper Pill */}
          <TouchableOpacity
            onPress={handleFillDemoCode}
            activeOpacity={0.8}
            className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons
                name="key-outline"
                size={16}
                color="#34d399"
                style={{ marginRight: 8 }}
              />
              <Text className="text-emerald-300 text-xs font-medium">
                Demo Code: <Text className="font-extrabold text-white">{devOtpHint || '123456'}</Text>
              </Text>
            </View>
            <Text className="text-emerald-400 text-xs font-bold underline">Tap to autofill</Text>
          </TouchableOpacity>

          <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            6-Digit Verification Code *
          </Text>
          <View className="bg-card border border-line rounded-xl px-4 py-3.5 flex-row items-center">
            <Ionicons
              name="chatbox-ellipses-outline"
              size={18}
              color="#5D6A8C"
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="123456"
              placeholderTextColor="#5D6A8C"
              keyboardType="number-pad"
              maxLength={6}
              className="flex-1 text-white text-xl font-bold tracking-widest"
            />
          </View>

          <View className="flex-row items-center justify-between mt-3 px-1">
            <TouchableOpacity
              disabled={resendTimer > 0 || loading}
              onPress={handleSendOtp}>
              <Text
                className={`text-xs font-semibold ${
                  resendTimer > 0 ? 'text-dim' : 'text-iris-300'
                }`}>
                {resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : 'Resend Verification Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('ENTER_PHONE')}>
              <Text className="text-slate-400 text-xs">Use different phone</Text>
            </TouchableOpacity>
          </View>

          {/* Verify & Complete Button */}
          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-emerald-600 active:bg-emerald-500 rounded-xl py-4 items-center justify-center mt-6 shadow-lg shadow-emerald-600/40">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">
                {mode === 'register' ? 'Verify & Create Account' : 'Verify & Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
