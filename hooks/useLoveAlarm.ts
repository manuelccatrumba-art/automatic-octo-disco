import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { api, LocationUpdateResult } from '../services/api';
import { registerForPushNotifications } from '../services/notifications';

const PING_INTERVAL_MS = 20000;

export function useLoveAlarm() {
  const { token } = useAuth();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [nearbyAdmirersCount, setNearbyAdmirersCount] = useState(0);
  const [newMatch, setNewMatch] = useState<LocationUpdateResult['newMatches'][number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPingAt, setLastPingAt] = useState<Date | null>(null);
  const pushTokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = useCallback(async () => {
    if (!token) return;
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const result = await api.updateLocation(
        token,
        pos.coords.latitude,
        pos.coords.longitude,
        pushTokenRef.current
      );
      setAlarmActive(result.alarmActive);
      setNearbyAdmirersCount(result.nearbyAdmirersCount);
      if (result.newMatches.length > 0) setNewMatch(result.newMatches[0]);
      setLastPingAt(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'erro ao actualizar localização');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') return;

      pushTokenRef.current = await registerForPushNotifications();
      await ping();
      intervalRef.current = setInterval(ping, PING_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, ping]);

  const clearNewMatch = useCallback(() => setNewMatch(null), []);

  return {
    permissionGranted,
    alarmActive,
    nearbyAdmirersCount,
    newMatch,
    clearNewMatch,
    error,
    lastPingAt,
    pingNow: ping,
  };
}
