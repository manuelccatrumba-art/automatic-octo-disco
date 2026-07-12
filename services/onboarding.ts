import { tokenStorage } from './tokenStorage';

const DISCLOSURE_KEY = 'love_alarm_bg_disclosure_v1';

export async function hasRespondedToBackgroundDisclosure(): Promise<boolean> {
  const value = await tokenStorage.get(DISCLOSURE_KEY);
  return value === '1';
}

export async function markBackgroundDisclosureResponded(): Promise<void> {
  await tokenStorage.set(DISCLOSURE_KEY, '1');
}
