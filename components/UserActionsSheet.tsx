import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ReportReason } from '../services/api';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'assedio', label: 'Assédio ou comportamento abusivo' },
  { value: 'perfil_falso', label: 'Perfil falso' },
  { value: 'conteudo_inadequado', label: 'Conteúdo inadequado' },
  { value: 'comportamento_suspeito', label: 'Comportamento suspeito' },
  { value: 'outro', label: 'Outro motivo' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  targetName: string;
  onUnmatch?: () => Promise<void>;
  onBlock: () => Promise<void>;
  onReport: (reason: ReportReason) => Promise<void>;
};

export function UserActionsSheet({ visible, onClose, targetName, onUnmatch, onBlock, onReport }: Props) {
  const [mode, setMode] = useState<'menu' | 'report'>('menu');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setMode('menu');
    onClose();
  };

  const handleUnmatch = () => {
    Alert.alert('Desfazer match', `Tens a certeza que queres desfazer o match com ${targetName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desfazer',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await onUnmatch?.();
          } finally {
            setBusy(false);
            close();
          }
        },
      },
    ]);
  };

  const handleBlock = () => {
    Alert.alert('Bloquear', `${targetName} deixa de te ver e de contar para o teu alarme. Tens a certeza?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Bloquear',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await onBlock();
          } finally {
            setBusy(false);
            close();
          }
        },
      },
    ]);
  };

  const handleReport = async (reason: ReportReason) => {
    setBusy(true);
    try {
      await onReport(reason);
      Alert.alert('Denúncia enviada', 'Obrigado — vamos rever isto.');
    } finally {
      setBusy(false);
      close();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {busy ? (
            <View style={styles.busyWrap}>
              <ActivityIndicator color={Colors.heart} size="large" />
            </View>
          ) : mode === 'menu' ? (
            <>
              <Text style={styles.title}>{targetName}</Text>
              {onUnmatch && (
                <TouchableOpacity style={styles.option} onPress={handleUnmatch}>
                  <Ionicons name="heart-dislike-outline" size={20} color={Colors.text} />
                  <Text style={styles.optionText}>Desfazer match</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.option} onPress={handleBlock}>
                <Ionicons name="ban-outline" size={20} color={Colors.danger} />
                <Text style={[styles.optionText, { color: Colors.danger }]}>Bloquear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={() => setMode('report')}>
                <Ionicons name="flag-outline" size={20} color={Colors.danger} />
                <Text style={[styles.optionText, { color: Colors.danger }]}>Denunciar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelOption} onPress={close}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Porque denuncias {targetName}?</Text>
              {REPORT_REASONS.map((r) => (
                <TouchableOpacity key={r.value} style={styles.option} onPress={() => handleReport(r.value)}>
                  <Text style={styles.optionText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.cancelOption} onPress={() => setMode('menu')}>
                <Text style={styles.cancelText}>Voltar</Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  busyWrap: { paddingVertical: 30, alignItems: 'center' },
  title: { color: Colors.textMuted, fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  optionText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  cancelOption: { paddingVertical: 15, marginTop: 8, alignItems: 'center' },
  cancelText: { color: Colors.textMuted, fontSize: 16, fontWeight: '700' },
});
