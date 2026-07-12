import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { api, CrushCandidate } from '../../services/api';
import { UserActionsSheet } from '../../components/UserActionsSheet';

export default function CrushesScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CrushCandidate[]>([]);
  const [crushes, setCrushes] = useState<CrushCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<CrushCandidate | null>(null);

  const loadCrushes = useCallback(async () => {
    if (!token) return;
    const { crushes } = await api.listCrushes(token);
    setCrushes(crushes);
  }, [token]);

  useEffect(() => {
    loadCrushes();
  }, [loadCrushes]);

  useEffect(() => {
    if (!token || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await api.searchUsers(token, query.trim());
        setResults(users);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, token]);

  const onAdd = async (targetId: number) => {
    if (!token) return;
    setBusyId(targetId);
    try {
      await api.addCrush(token, targetId);
      setResults((prev) => prev.map((u) => (u.id === targetId ? { ...u, already_crush: true } : u)));
      await loadCrushes();
    } finally {
      setBusyId(null);
    }
  };

  const onRemove = async (targetId: number) => {
    if (!token) return;
    setBusyId(targetId);
    try {
      await api.removeCrush(token, targetId);
      await loadCrushes();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Os teus crushes</Text>
      <Text style={styles.subtitle}>Ninguém sabe que gostas deles — só o alarme dispara se for perto e mútuo.</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="procurar por username ou nome"
          placeholderTextColor={Colors.textFaint}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={Colors.textFaint} />}
      </View>

      {query.trim().length >= 2 && (
        <FlatList
          data={results}
          keyExtractor={(item) => `search-${item.id}`}
          style={styles.list}
          ListEmptyComponent={
            !searching ? <Text style={styles.empty}>Nenhum utilizador encontrado</Text> : null
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.rowName}>{item.display_name}</Text>
                <Text style={styles.rowUsername}>@{item.username}</Text>
              </View>
              <View style={styles.rowActions}>
                {item.already_crush ? (
                  <Ionicons name="heart" size={22} color={Colors.heart} />
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAdd(item.id)}
                    disabled={busyId === item.id}
                  >
                    {busyId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="heart-outline" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setSelected(item)} hitSlop={10}>
                  <Ionicons name="ellipsis-vertical" size={20} color={Colors.textFaint} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {query.trim().length < 2 && (
        <>
          <Text style={styles.sectionLabel}>A tua lista ({crushes.length})</Text>
          <FlatList
            data={crushes}
            keyExtractor={(item) => `crush-${item.id}`}
            style={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Ainda não adicionaste ninguém. Usa a pesquisa acima.</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowName}>{item.display_name}</Text>
                  <Text style={styles.rowUsername}>@{item.username}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity onPress={() => onRemove(item.id)} disabled={busyId === item.id}>
                    {busyId === item.id ? (
                      <ActivityIndicator size="small" color={Colors.textFaint} />
                    ) : (
                      <Ionicons name="close" size={20} color={Colors.textFaint} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelected(item)} hitSlop={10}>
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.textFaint} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      {selected && (
        <UserActionsSheet
          visible={!!selected}
          onClose={() => setSelected(null)}
          targetName={selected.display_name}
          onBlock={async () => {
            if (!token) return;
            await api.blockUser(token, selected.id);
            setResults((prev) => prev.filter((u) => u.id !== selected.id));
            await loadCrushes();
          }}
          onReport={async (reason) => {
            if (!token) return;
            await api.reportUser(token, selected.id, reason);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 20 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 6, marginBottom: 18, lineHeight: 18 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },
  sectionLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  list: { marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  rowUsername: { color: Colors.textFaint, fontSize: 13, marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  addButton: {
    backgroundColor: Colors.heart,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { color: Colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: 24 },
});
