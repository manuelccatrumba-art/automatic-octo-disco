import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { api, ApiError } from '../../services/api';

const RADIUS_OPTIONS = [25, 50, 75, 100, 250, 500];

export default function ProfileScreen() {
  const { user, token, logout, refreshUser } = useAuth();
  const [savingRadius, setSavingRadius] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);

  const onTogglePause = async (value: boolean) => {
    if (!token) return;
    setTogglingPause(true);
    try {
      await api.updatePaused(token, value);
      await refreshUser();
    } finally {
      setTogglingPause(false);
    }
  };

  const onSelectRadius = async (radius: number) => {
    if (!token) return;
    setSavingRadius(radius);
    try {
      await api.updateRadius(token, radius);
      await refreshUser();
    } finally {
      setSavingRadius(null);
    }
  };

  const onShareInvite = async () => {
    if (!user?.invite_code) return;
    try {
      await Share.share({
        message: `Vem para o Love Alarm! Usa o meu código de convite ${user.invite_code} quando criares a tua conta.`,
      });
    } catch {}
  };

  const onLogout = () => {
    Alert.alert('Sair', 'Tens a certeza que queres sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletePassword('');
    setDeleteError(null);
  };

  const onConfirmDelete = async () => {
    if (!token || !deletePassword) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAccount(token, deletePassword);
      await logout();
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : 'Não foi possível apagar a conta');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.display_name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.display_name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <Text style={styles.sectionLabel}>Alcance do alarme</Text>
      <Text style={styles.sectionHint}>
        Distância a que o teu coração dispara quando alguém que gosta de ti está por perto. O GPS de telemóvel tem
        uma precisão de ~10-50m — valores muito baixos podem não disparar de forma fiável.
      </Text>
      <View style={styles.radiusGrid}>
        {RADIUS_OPTIONS.map((radius) => {
          const selected = user?.alarm_radius_m === radius;
          return (
            <TouchableOpacity
              key={radius}
              style={[styles.radiusChip, selected && styles.radiusChipSelected]}
              onPress={() => onSelectRadius(radius)}
              disabled={savingRadius !== null}
            >
              <Text style={[styles.radiusChipText, selected && styles.radiusChipTextSelected]}>{radius}m</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.pauseRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>Pausar alarme</Text>
          <Text style={styles.sectionHint}>
            Desliga a deteção de proximidade sem sair da conta. Ninguém te vê nem contas para o alarme de mais
            ninguém enquanto estiver pausado.
          </Text>
        </View>
        {togglingPause ? (
          <ActivityIndicator color={Colors.heart} />
        ) : (
          <Switch
            value={!!user?.paused}
            onValueChange={onTogglePause}
            trackColor={{ false: Colors.cardBorder, true: Colors.heart }}
            thumbColor="#fff"
          />
        )}
      </View>

      <View style={styles.inviteCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>Convida amigos</Text>
          <Text style={styles.sectionHint}>
            O alarme só tem piada com gente por perto a usá-lo. Partilha o teu código.
          </Text>
          <Text style={styles.inviteCode}>{user?.invite_code}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={onShareInvite} activeOpacity={0.85}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteAccountLink}
        onPress={() => setDeleteModalOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteAccountText}>Apagar conta</Text>
      </TouchableOpacity>
      </ScrollView>

      <Modal visible={deleteModalOpen} transparent animationType="fade" onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apagar conta</Text>
            <Text style={styles.modalBody}>
              Isto apaga permanentemente o teu perfil, crushes e matches. Não há como desfazer. Confirma a tua
              password para continuar.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="password"
              placeholderTextColor={Colors.textFaint}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              autoFocus
            />
            {deleteError && <Text style={styles.modalError}>{deleteError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeDeleteModal} disabled={deleting}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={onConfirmDelete}
                disabled={deleting || !deletePassword}
                activeOpacity={0.85}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteText}>Apagar definitivamente</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', marginTop: 8, marginBottom: 20 },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 28,
    marginBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentSoft,
    borderWidth: 2,
    borderColor: Colors.heart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: Colors.heart, fontSize: 28, fontWeight: '800' },
  name: { color: Colors.text, fontSize: 19, fontWeight: '700' },
  username: { color: Colors.textFaint, fontSize: 14, marginTop: 2 },
  sectionLabel: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sectionHint: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  radiusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  radiusChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  radiusChipSelected: { backgroundColor: Colors.heart, borderColor: Colors.heart },
  radiusChipText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  radiusChipTextSelected: { color: '#fff' },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  inviteCode: { color: Colors.heart, fontSize: 20, fontWeight: '800', letterSpacing: 2, marginTop: 8 },
  shareButton: {
    backgroundColor: Colors.heart,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '700' },
  deleteAccountLink: { alignItems: 'center', paddingVertical: 8, marginBottom: 24 },
  deleteAccountText: { color: Colors.textFaint, fontSize: 13, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  modalBody: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  modalInput: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 8,
  },
  modalError: { color: Colors.danger, fontSize: 13, marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalCancelText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  modalDeleteButton: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.danger,
  },
  modalDeleteText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
