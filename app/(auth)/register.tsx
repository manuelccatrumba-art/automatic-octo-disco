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
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { HeartAlarm } from '../../components/HeartAlarm';
import { ApiError } from '../../services/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await register(username.trim().toLowerCase(), password, displayName.trim());
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
  link: { color: Colors.textMuted, textAlign: 'center', marginTop: 24, fontSize: 15 },
  linkAccent: { color: Colors.heart, fontWeight: '700' },
});
