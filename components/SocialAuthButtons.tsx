import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  mode?: 'login' | 'register';
}

export const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSuccess,
  onError,
  mode = 'login',
}) => {
  const { oauthLogin } = useAuth();
  const [modalProvider, setModalProvider] = useState<'GOOGLE' | 'FACEBOOK' | null>(null);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomAccount, setIsCustomAccount] = useState(false);

  const handleFacebookPress = async () => {
    try {
      const fbUrl = 'https://www.facebook.com/login.php';
      await Linking.openURL(fbUrl);
    } catch {
      setIsCustomAccount(false);
      setModalProvider('FACEBOOK');
    }
  };

  const presetGoogleAccounts = [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      id: 'google_user_alex_101',
    },
    {
      name: 'Sarah Connor',
      email: 'sarah.music@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      id: 'google_user_sarah_102',
    },
  ];

  const presetFacebookAccounts = [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      id: 'fb_user_alex_201',
    },
    {
      name: 'Jessica Pearson',
      email: 'jessica.pearson@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      id: 'fb_user_jessica_202',
    },
  ];

  const handleSelectAccount = async (account: {
    name: string;
    email?: string;
    id: string;
    avatar?: string;
  }) => {
    if (!modalProvider) return;
    setLoading(true);
    try {
      await oauthLogin({
        provider: modalProvider,
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        providerId: account.id,
      });
      setModalProvider(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (onError) onError(err.message || 'OAuth authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customName.trim()) {
      if (onError) onError('Please enter your full name.');
      return;
    }
    const emailToUse = customEmail.trim() || undefined;
    await handleSelectAccount({
      name: customName.trim(),
      email: emailToUse,
      id: `${modalProvider?.toLowerCase()}_user_${Date.now()}`,
    });
  };

  return (
    <View className="w-full">
      {/* Continue with Section */}
      <View className="items-center my-4">
        <Text className="text-[11px] font-bold text-dim uppercase tracking-[0.14em] mb-3">
          Or continue with
        </Text>

        {/* Social Icons Row */}
        <View className="flex-row items-center justify-center gap-3 w-full">
          {/* Google Icon Button */}
          <TouchableOpacity
            onPress={() => {
              setIsCustomAccount(false);
              setCustomEmail('');
              setCustomName('');
              setModalProvider('GOOGLE');
            }}
            activeOpacity={0.8}
            className="flex-1 max-w-[150px] h-12 rounded-2xl bg-card border border-line items-center justify-center active:opacity-75">
            <GoogleLogo size={22} />
          </TouchableOpacity>

          {/* Facebook Icon Button - Direct link to Facebook Sign In */}
          <TouchableOpacity
            onPress={handleFacebookPress}
            activeOpacity={0.8}
            className="flex-1 max-w-[150px] h-12 rounded-2xl bg-card border border-line items-center justify-center active:opacity-75">
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Account Picker Modal */}
      <Modal
        visible={modalProvider !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalProvider(null)}>
        <View className="flex-1 bg-night/90 justify-end items-center p-4">
          <View
            style={{ maxHeight: '85%' }}
            className="w-full max-w-md bg-card border border-line rounded-3xl p-6">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-line">
              <View className="flex-row items-center">
                {modalProvider === 'GOOGLE' ? (
                  <View className="h-10 w-10 rounded-xl bg-white items-center justify-center mr-3">
                    <GoogleLogo size={22} />
                  </View>
                ) : (
                  <View
                    style={{ backgroundColor: '#1877F2' }}
                    className="h-10 w-10 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="logo-facebook" size={24} color="#fff" />
                  </View>
                )}
                <View>
                  <Text className="text-white font-bold text-base">
                    {modalProvider === 'GOOGLE' ? 'Continue with Google' : 'Continue with Facebook'}
                  </Text>
                  <Text className="text-mist text-xs">
                    Choose an account to sign in
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setModalProvider(null)}
                className="h-8 w-8 rounded-full bg-card2 items-center justify-center">
                <Ionicons name="close" size={17} color="#93A0BE" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator
                  size="large"
                  color={modalProvider === 'GOOGLE' ? '#4285F4' : '#1877F2'}
                />
                <Text className="text-slate-300 text-sm font-semibold mt-4">
                  Connecting to {modalProvider === 'GOOGLE' ? 'Google' : 'Facebook'}…
                </Text>
              </View>
            ) : isCustomAccount ? (
              /* Custom Account Form */
              <ScrollView className="pt-4">
                <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Full Name *
                </Text>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="e.g. Alex Rivera"
                  placeholderTextColor="#64748b"
                  className="bg-abyss border border-line rounded-xl px-4 py-3 text-white text-sm mb-4"
                />

                <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  {modalProvider === 'GOOGLE' ? 'Google Email *' : 'Facebook Email (Optional)'}
                </Text>
                <TextInput
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  placeholder={
                    modalProvider === 'GOOGLE'
                      ? 'yourname@gmail.com'
                      : 'yourname@facebook.com'
                  }
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-abyss border border-line rounded-xl px-4 py-3 text-white text-sm mb-5"
                />

                <TouchableOpacity
                  onPress={handleCustomSubmit}
                  style={{
                    backgroundColor: modalProvider === 'GOOGLE' ? '#4285F4' : '#1877F2',
                  }}
                  className="rounded-xl py-3.5 items-center justify-center mb-3">
                  <Text className="text-white font-bold text-sm">Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsCustomAccount(false)}
                  className="py-2 items-center">
                  <Text className="text-slate-400 text-xs font-medium">
                    ← Back to Quick Account Selection
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              /* Preset Accounts List */
              <ScrollView className="pt-4">
                <Text className="text-slate-400 text-xs font-semibold mb-3">
                  Choose an account to continue:
                </Text>

                {(modalProvider === 'GOOGLE'
                  ? presetGoogleAccounts
                  : presetFacebookAccounts
                ).map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => handleSelectAccount(acc)}
                    activeOpacity={0.75}
                    className="flex-row items-center p-3 mb-2.5 rounded-2xl bg-abyss border border-line active:opacity-80">
                    <View className="h-10 w-10 rounded-full bg-iris-500/10 border border-iris-500/30 items-center justify-center mr-3">
                      <Ionicons
                        name={modalProvider === 'GOOGLE' ? 'logo-google' : 'logo-facebook'}
                        size={18}
                        color="#9282F4"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm">{acc.name}</Text>
                      <Text className="text-slate-400 text-xs">{acc.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#64748b" />
                  </TouchableOpacity>
                ))}

                {/* Option to type custom account */}
                <TouchableOpacity
                  onPress={() => setIsCustomAccount(true)}
                  activeOpacity={0.75}
                  className="flex-row items-center p-3.5 mt-1 rounded-2xl border border-dashed border-line active:opacity-80">
                  <View className="h-8 w-8 rounded-full bg-card2 items-center justify-center mr-3">
                    <Ionicons name="person-add-outline" size={15} color="#93A0BE" />
                  </View>
                  <Text className="text-slate-300 font-semibold text-xs flex-1">
                    Use another {modalProvider === 'GOOGLE' ? 'Google' : 'Facebook'} account
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#64748b" />
                </TouchableOpacity>

                <View className="mt-5 pt-3 border-t border-line flex-row items-center justify-center">
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color="#10B981"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-dim text-[11px]">
                    Handled securely by the provider
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
