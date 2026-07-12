import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { api, MatchEntry } from '../../services/api';
import { UserActionsSheet } from '../../components/UserActionsSheet';

export default function MatchesScreen() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<MatchEntry | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const { matches } = await api.listMatches(token);
    setMatches(matches);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.subtitle}>Revelados quando é mútuo e estiveram perto um do outro.</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => `match-${item.id}`}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.heart} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="sparkles-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.empty}>Ainda sem matches. Continua por perto de quem gostas.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.display_name}</Text>
              <Text style={styles.rowUsername}>@{item.username}</Text>
            </View>
            <Ionicons name="heart" size={20} color={Colors.heart} style={{ marginRight: 4 }} />
            <TouchableOpacity testID={`match-actions-${item.id}`} onPress={() => setSelected(item)} hitSlop={10}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textFaint} />
            </TouchableOpacity>
          </View>
        )}
      />

      {selected && (
        <UserActionsSheet
          visible={!!selected}
          onClose={() => setSelected(null)}
          targetName={selected.display_name}
          onUnmatch={async () => {
            if (!token) return;
            await api.unmatch(token, selected.id);
            await load();
          }}
          onBlock={async () => {
            if (!token) return;
            await api.blockUser(token, selected.id);
            await load();
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
  list: { marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.heart,
  },
  avatarText: { color: Colors.heart, fontSize: 18, fontWeight: '800' },
  rowInfo: { flex: 1 },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  rowUsername: { color: Colors.textFaint, fontSize: 13, marginTop: 2 },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 14, paddingHorizontal: 30 },
  empty: { color: Colors.textFaint, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
