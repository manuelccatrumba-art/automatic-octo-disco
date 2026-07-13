import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { BounceIn, ZoomIn } from 'react-native-reanimated';
import { HeartAlarm } from '../../components/HeartAlarm';
import { Colors } from '../../constants/Colors';
import { useLoveAlarm } from '../../hooks/useLoveAlarm';
import { useAuth } from '../../contexts/AuthContext';

export default function AlarmScreen() {
  const { user } = useAuth();
  const { permissionGranted, alarmActive, nearbyAdmirersCount, newMatch, clearNewMatch, error, lastPingAt } =
    useLoveAlarm();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.greeting}>Olá, {user?.display_name}</Text>

      <View style={styles.heartArea}>
        <HeartAlarm active={alarmActive} size={170} />
      </View>

      {permissionGranted === false ? (
        <Text style={styles.status}>
          Precisamos da tua localização para o alarme funcionar. Activa a permissão nas definições do telemóvel.
        </Text>
      ) : alarmActive ? (
        <>
          <Text style={styles.statusActive}>O teu alarme disparou!</Text>
          <Text style={styles.statusSub}>
            {nearbyAdmirersCount === 1
              ? 'Alguém perto de ti sente algo por ti.'
              : `${nearbyAdmirersCount} pessoas perto de ti sentem algo por ti.`}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.status}>Tudo calmo por agora</Text>
          <Text style={styles.statusSub}>O alarme dispara quando alguém que gosta de ti está perto.</Text>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {lastPingAt && (
        <Text style={styles.lastPing}>
          última verificação às {lastPingAt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}

      <Modal visible={!!newMatch} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={BounceIn.duration(700)} style={styles.modalCard}>
            <Animated.Text entering={ZoomIn.delay(150).duration(500)} style={styles.modalEmoji}>
              🎉
            </Animated.Text>
            <Text style={styles.modalTitle}>É um match!</Text>
            <Text style={styles.modalBody}>
              {newMatch?.display_name} também sente algo por ti — e estava por perto agora mesmo.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={clearNewMatch} activeOpacity={0.85}>
              <Text style={styles.modalButtonText}>Fixe!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', paddingTop: 16 },
  greeting: { color: Colors.textMuted, fontSize: 15, alignSelf: 'flex-start', marginLeft: 24 },
  heartArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  status: { color: Colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center', paddingHorizontal: 32 },
  statusActive: { color: Colors.heart, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  statusSub: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginTop: 12, paddingHorizontal: 32 },
  lastPing: { color: Colors.textFaint, fontSize: 12, marginTop: 20, marginBottom: 24 },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  modalBody: { color: Colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  modalButton: { backgroundColor: Colors.heart, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
