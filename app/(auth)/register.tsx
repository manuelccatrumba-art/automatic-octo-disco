import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { HeartAlarm } from '../../components/HeartAlarm';
import { ApiError, REGIONS } from '../../services/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState(REGIONS[0].value);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!displayName || !username || !password) {
      setError('Preenche todos os campos');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(username.trim().toLowerCase(), password, displayName.trim(), region, inviteCode.trim() || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <HeartAlarm active={false} size={80} />
        </View>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>O teu nome só aparece a quem tiveres como match.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="nome a mostrar (ex: Manuel)"
            placeholderTextColor={Colors.textFaint}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.input}
            placeholder="username (só letras, números, _)"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="password (mín. 6 caracteres)"
            placeholderTextColor={Colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.fieldLabel}>A tua zona</Text>
          <Text style={styles.fieldHint}>
            O alarme só funciona entre pessoas na mesma zona — lançamos por etapas.
          </Text>
          <View style={styles.regionRow}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.regionChip, region === r.value && styles.regionChipSelected]}
                onPress={() => setRegion(r.value)}
              >
                <Text style={[styles.regionChipText, region === r.value && styles.regionChipTextSelected]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="código de convite (opcional)"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="characters"
            autoCorrect={false}
            value={inviteCode}
            onChangeText={setInviteCode}
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Ao criar conta, aceitas os{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://love-alarm-backend.vercel.app/terms')}>
              Termos de Serviço
            </Text>{' '}
            e a{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://love-alarm-backend.vercel.app/privacy')}
            >
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>
              Já tens conta? <Text style={styles.linkAccent}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, backgroundColor: Colors.bg, padding: 28, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 4 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  form: { gap: 14 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: Colors.text,
    fontSize: 16,
  },
  error: { color: Colors.danger, fontSize: 14, textAlign: 'center' },
  fieldLabel: { color: Colors.text, fontSize: 14, fontWeight: '700', marginTop: 4 },
  fieldHint: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: -6 },
  regionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  regionChipSelected: { backgroundColor: Colors.heart, borderColor: Colors.heart },
  regionChipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  regionChipTextSelected: { color: '#fff' },
  button: {
    backgroundColor: Colors.heart,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: Colors.heart,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  legalText: { color: Colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 17 },
  legalLink: { color: Colors.heart, fontWeight: '600' },
  link: { color: Colors.textMuted, textAlign: 'center', marginTop: 24, fontSize: 15 },
  linkAccent: { color: Colors.heart, fontWeight: '700' },
});
