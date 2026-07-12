import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { markIntroSeen } from '../../services/onboarding';

const SLIDES = [
  {
    icon: 'heart' as const,
    title: 'O teu coração dispara sozinho',
    body: 'Regista em segredo quem te faz vibrar. Se estiveres perto de alguém que gosta de ti, o alarme dispara — sem revelar quem é.',
  },
  {
    icon: 'sparkles' as const,
    title: 'Só se revela quando é mútuo',
    body: 'A identidade nunca aparece por acaso. Só quando os dois gostam um do outro E estão perto é que o match é revelado.',
  },
  {
    icon: 'people' as const,
    title: 'Começamos por Luanda',
    body: 'O alarme só faz sentido com gente por perto a usá-lo. Estamos a lançar por etapas — convida amigos para a magia acontecer mais depressa.',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const finish = async () => {
    await markIntroSeen();
    router.replace('/(auth)/login');
  };

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setIndex(nextIndex);
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={slide.icon} size={48} color={Colors.heart} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{index < SLIDES.length - 1 ? 'Seguinte' : 'Começar'}</Text>
      </TouchableOpacity>

      {index < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skip} onPress={finish}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  body: { color: Colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.cardBorder },
  dotActive: { backgroundColor: Colors.heart, width: 20 },
  button: {
    backgroundColor: Colors.heart,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginHorizontal: 28,
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skip: { alignItems: 'center', paddingVertical: 14, marginBottom: 12 },
  skipText: { color: Colors.textMuted, fontSize: 14 },
});
