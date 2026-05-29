import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSED_KEY = '@ralphs/dismissed_notifications';

export async function getDismissedNotificationKeys(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(DISMISSED_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((key): key is string => typeof key === 'string');
  } catch {
    return [];
  }
}

export async function dismissNotificationKey(key: string): Promise<void> {
  const current = await getDismissedNotificationKeys();
  if (current.includes(key)) {
    return;
  }
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, key]));
}

/** Drop dismissals for notifications that no longer exist. */
export async function pruneDismissedKeys(activeKeys: string[]): Promise<void> {
  const current = await getDismissedNotificationKeys();
  const activeSet = new Set(activeKeys);
  const pruned = current.filter(key => activeSet.has(key));
  if (pruned.length !== current.length) {
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(pruned));
  }
}
