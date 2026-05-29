import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSED_KEY = '@ralphs/dismissed_notifications';

export async function getDismissedNotificationIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(DISMISSED_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

export async function dismissNotificationId(id: number): Promise<void> {
  const current = await getDismissedNotificationIds();
  if (current.includes(id)) {
    return;
  }
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
}

/** Drop dismissals for notifications that no longer exist on the server. */
export async function pruneDismissedIds(activeIds: number[]): Promise<void> {
  const current = await getDismissedNotificationIds();
  const activeSet = new Set(activeIds);
  const pruned = current.filter(id => activeSet.has(id));
  if (pruned.length !== current.length) {
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(pruned));
  }
}
