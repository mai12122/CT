import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page not found' }} />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="compass-outline" size={30} color="#9282F4" />
        </View>
        <Text style={styles.title}>This page doesn’t exist</Text>
        <Text style={styles.subtitle}>
          The link may be outdated, or the page may have moved.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Back to Explore</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1020',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121829',
    borderWidth: 1,
    borderColor: '#202A45',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F1F4FA',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#93A0BE',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6C5CE7',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
