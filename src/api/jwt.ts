import type {ApiUser} from './types';

interface JwtPayload {
  sub?: string;
  username?: string;
  email?: string;
  id?: number;
  roles?: string[];
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) {
      return null;
    }
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const atobFn = (globalThis as {atob?: (input: string) => string}).atob;
    if (!atobFn) {
      return null;
    }
    const json = atobFn(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Fallback when GET /api/me is unavailable — ask backend team to add ApiMeController. */
export function userFromJwt(token: string): ApiUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }
  const email = payload.email || payload.username || payload.sub || '';
  const id =
    typeof payload.id === 'number'
      ? payload.id
      : extractNumericId(payload.sub) ?? extractNumericId(payload.username);
  if (!email && id == null) {
    return null;
  }
  return {
    id: id ?? 0,
    email,
    name: email.split('@')[0] || 'Customer',
    roles: payload.roles,
    isVerified: true,
    isActive: true,
  };
}

function extractNumericId(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}
