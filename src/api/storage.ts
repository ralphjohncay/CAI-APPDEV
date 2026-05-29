import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ralphs/jwt';
const LEGACY_TOKEN_KEY = 'token';
const PERSIST_AUTH_KEY = 'persist:auth';

async function tokenFromPersistedAuth(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PERSIST_AUTH_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {session?: {token?: string}};
    const token = parsed?.session?.token;
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export async function getStoredToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    return token;
  }
  const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy) {
    await AsyncStorage.setItem(TOKEN_KEY, legacy);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    return legacy;
  }
  const fromPersist = await tokenFromPersistedAuth();
  if (fromPersist) {
    await AsyncStorage.setItem(TOKEN_KEY, fromPersist);
    return fromPersist;
  }
  return null;
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}
