import AsyncStorage from '@react-native-async-storage/async-storage';

const CURSOR_PREFIX = '@ralphs/customer_alert_cursor:';
const SHOWN_PREFIX = '@ralphs/shown_alert_keys:';

function cursorKey(userId: number): string {
  return `${CURSOR_PREFIX}${userId}`;
}

function shownKey(userId: number): string {
  return `${SHOWN_PREFIX}${userId}`;
}

export async function getCustomerAlertCursorForUser(
  userId: number,
): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(cursorKey(userId));
    return raw !== null ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export async function setCustomerAlertCursorForUser(
  userId: number,
  cursor: number,
): Promise<void> {
  try {
    await AsyncStorage.setItem(cursorKey(userId), String(cursor));
  } catch {
    /* ignore */
  }
}

export async function getShownAlertKeys(userId: number): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(shownKey(userId));
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((k): k is string => typeof k === 'string'));
  } catch {
    return new Set();
  }
}

export async function addShownAlertKey(userId: number, key: string): Promise<void> {
  const current = await getShownAlertKeys(userId);
  if (current.has(key)) {
    return;
  }
  current.add(key);
  try {
    await AsyncStorage.setItem(shownKey(userId), JSON.stringify([...current]));
  } catch {
    /* ignore */
  }
}
