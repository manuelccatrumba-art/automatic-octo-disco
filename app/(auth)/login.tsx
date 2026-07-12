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
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { HeartAlarm } from '../../components/HeartAlarm';
import { ApiError } from '../../services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!username || !password) {
      setError('Preenche o username e a password');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim().toLowerCase(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <HeartAlarm active={false} size={90} />
        </View>
        <Text style={styles.title}>Love Alarm</Text>
        <Text style={styles.subtitle}>O teu coração dispara quando alguém perto gosta de ti.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="password"
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>
              Ainda não tens conta? <Text style={styles.linkAccent}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg, padding: 28, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 8 },
  title: { color: Colors.text, fontSize: 34, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
    lineHeight: 21,
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
  link: { color: Colors.textMuted, textAlign: 'center', marginTop: 28, fontSize: 15 },
  linkAccent: { color: Colors.heart, fontWeight: '700' },
});
