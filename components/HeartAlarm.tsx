import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

type Props = { active: boolean; size?: number };

export function HeartAlarm({ active, size = 150 }: Props) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(0.22);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(rotate);
    cancelAnimation(glow);

    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(0.94, { duration: 200 }),
          withTiming(1.1, { duration: 150 }),
          withTiming(1, { duration: 150 })
        ),
        -1,
        false
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-7, { duration: 90 }),
          withTiming(7, { duration: 90 }),
          withTiming(-4, { duration: 90 }),
          withTiming(0, { duration: 90 })
        ),
        -1,
        false
      );
      glow.value = withRepeat(withSequence(withTiming(0.95, { duration: 320 }), withTiming(0.45, { duration: 320 })), -1, true);
    } else {
      scale.value = withRepeat(withSequence(withTiming(1.035, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
      rotate.value = withTiming(0, { duration: 250 });
      glow.value = withTiming(0.2, { duration: 400 });
    }
  }, [active]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.55 }],
  }));

  return (
    <View style={[styles.container, { width: size * 1.9, height: size * 1.9 }]}>
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size,
            backgroundColor: active ? Colors.heartGlow : Colors.heartDim,
          },
        ]}
      />
      <Animated.View style={heartStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d={HEART_PATH} fill={active ? Colors.heart : Colors.heartDim} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
});
