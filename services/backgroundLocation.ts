import { Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { tokenStorage, TOKEN_KEY } from './tokenStorage';
import { api } from './api';

export const BACKGROUND_LOCATION_TASK = 'love-alarm-background-location';

// TaskManager não tem suporte web — só define a task em plataformas nativas,
// definir no scope global no web pode rebentar o preview de desenvolvimento.
if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('erro na task de localização em segundo plano', error);
      return;
    }
    const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;
    const last = locations?.[locations.length - 1];
    if (!last) return;

    const token = await tokenStorage.get(TOKEN_KEY);
    if (!token) return;

    try {
      await api.updateLocation(token, last.coords.latitude, last.coords.longitude);
    } catch {
      // silencioso — a próxima actualização em segundo plano tenta de novo
    }
  });
}

export async function startBackgroundLocation(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const available = await TaskManager.isAvailableAsync();
  if (!available) return false;

  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (alreadyRegistered) return true;

  try {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5 * 60 * 1000,
      distanceInterval: 50,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: 'Love Alarm activo',
        notificationBody: 'A monitorizar se alguém perto de ti sente algo por ti.',
        notificationColor: '#FF3B6F',
      },
    });
    return true;
  } catch (e) {
    console.error('não foi possível iniciar localização em segundo plano', e);
    return false;
  }
}

export async function stopBackgroundLocation(): Promise<void> {
  if (Platform.OS === 'web') return;
  const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (registered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
