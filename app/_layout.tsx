import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { hasRespondedToBackgroundDisclosure, hasSeenIntro } from '../services/onboarding';
import '../services/backgroundLocation';

function RootNavigation() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inIntro = segments[0] === 'onboarding' && (segments as string[])[1] === 'intro';
    const inOnboarding = segments[0] === 'onboarding';

    if (!token) {
      if (inAuthGroup || inIntro) return;
      hasSeenIntro().then((seen) => {
        router.replace(seen ? '/(auth)/login' : '/onboarding/intro');
      });
      return;
    }
    if (token && (inAuthGroup || inIntro)) {
      router.replace('/(tabs)');
      return;
    }
    if (token && !inOnboarding) {
      hasRespondedToBackgroundDisclosure().then((responded) => {
        if (!responded) router.replace('/onboarding/background-disclosure');
      });
    }
  }, [token, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.heart} size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
});
