import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { startBackgroundLocation } from '../../services/backgroundLocation';
import { markBackgroundDisclosureResponded } from '../../services/onboarding';

export default function BackgroundDisclosureScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<'activate' | 'skip' | null>(null);

  const finish = async () => {
    await markBackgroundDisclosureResponded();
    router.replace('/(tabs)');
  };

  const onActivate = async () => {
    setLoading('activate');
    try {
      const fg = await Location.getForegroundPermissionsAsync();
      if (fg.status !== 'granted') {
        await Location.requestForegroundPermissionsAsync();
      }
      await Location.requestBackgroundPermissionsAsync();
      await startBackgroundLocation();
    } finally {
      setLoading(null);
      await finish();
    }
  };

  const onSkip = async () => {
    setLoading('skip');
    await finish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="location" size={44} color={Colors.heart} />
      </View>

      <Text style={styles.title}>O alarme também funciona com a app fechada</Text>

      <Text style={styles.disclosure}>
        Esta app recolhe dados de localização para activar o alarme de proximidade mesmo quando a app está
        fechada ou não está a ser utilizada. Isto é o que permite ao teu coração disparar quando alguém que
        gosta de ti está por perto, sem teres de manter a Love Alarm aberta o tempo todo.
      </Text>

      <Text style={styles.note}>
        Enquanto o alarme estiver activo em segundo plano, o Android mostra uma notificação permanente a
        avisar que a localização está a ser monitorizada — é uma exigência do próprio sistema, não algo
        escondido.
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.primaryButton} onPress={onActivate} disabled={loading !== null} activeOpacity={0.85}>
        {loading === 'activate' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Activar alarme em segundo plano</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} disabled={loading !== null}>
        {loading === 'skip' ? (
          <ActivityIndicator color={Colors.textMuted} />
        ) : (
          <Text style={styles.skipButtonText}>Agora não (só funciona com a app aberta)</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 28 },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  disclosure: { color: Colors.text, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  note: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  spacer: { flex: 1 },
  primaryButton: {
    backgroundColor: Colors.heart,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipButton: { alignItems: 'center', paddingVertical: 14, marginBottom: 12 },
  skipButtonText: { color: Colors.textMuted, fontSize: 14 },
});
