import { createAudioPlayer } from 'expo-audio';

const SOUNDS = {
  alarm: require('../assets/sounds/alarm.wav'),
  match: require('../assets/sounds/match.wav'),
  crush: require('../assets/sounds/crush.wav'),
} as const;

export type SoundName = keyof typeof SOUNDS;

export function playSound(name: SoundName) {
  try {
    const player = createAudioPlayer(SOUNDS[name]);
    player.play();
    setTimeout(() => {
      try {
        player.remove();
      } catch {}
    }, 3000);
  } catch {}
}
