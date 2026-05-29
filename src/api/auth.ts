import {apiJsonRequest} from './client';
import {ApiError} from './errors';
import {userFromJwt} from './jwt';
import {clearStoredToken, getStoredToken, setStoredToken} from './storage';
import type {
  ApiUser,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
} from './types';

export function normalizeApiUser(
  raw: Partial<ApiUser> & {success?: boolean} | null | undefined,
): ApiUser | null {
  if (!raw?.id || !raw.email) {
    return null;
  }
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name ?? raw.email.split('@')[0],
    roles: raw.roles ?? ['ROLE_USER'],
    isVerified: raw.isVerified ?? true,
    isActive: raw.isActive ?? true,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<{token: string; user: ApiUser}> {
  const data = await apiJsonRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: {email, password},
    auth: false,
  });

  if (!data.token) {
    throw new Error(data.message || 'Login succeeded but no token was returned.');
  }

  await setStoredToken(data.token);

  let user = normalizeApiUser(data.user);
  if (!user) {
    try {
      user = await fetchCurrentUser();
    } catch {
      const fallback = userFromJwt(data.token);
      if (!fallback) {
        throw new Error('Could not load user profile after login.');
      }
      user = fallback;
    }
  }

  return {token: data.token, user};
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiJsonRequest<RegisterResponse>('/api/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function verifyEmail(token: string): Promise<{message?: string}> {
  return apiJsonRequest('/api/verify-email', {
    method: 'POST',
    body: {token},
    auth: false,
  });
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const token = await getStoredToken();
  if (!token) {
    throw new Error('Not signed in');
  }

  try {
    const data = await apiJsonRequest<MeResponse>('/api/me', {auth: true});
    const user = normalizeApiUser(data);
    if (user) {
      return user;
    }
    throw new Error(data.message || 'Invalid profile response');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await clearStoredToken();
      throw new Error('Session expired. Please sign in again.');
    }
    throw err;
  }
}

/** Confirms the stored JWT is accepted by the API before checkout or other protected actions. */
export async function ensureValidSession(): Promise<ApiUser> {
  return fetchCurrentUser();
}

export async function signOut(): Promise<void> {
  await clearStoredToken();
}

export {getStoredToken, setStoredToken} from './storage';
