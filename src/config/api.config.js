import {Platform} from 'react-native';

/** Production Symfony API on Railway (same MySQL as website/admin). */
export const API_BASE_URL = 'https://finalscay-production.up.railway.app';

let localOverride;
try {
  localOverride = require('./api.local').API_URL_OVERRIDE;
} catch {
  localOverride = undefined;
}

/**
 * Resolve API origin: env override → api.local.ts → Railway production.
 * Local dev: set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000 (Android emulator: http://10.0.2.2:8000).
 */
export function getApiBaseUrl() {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    process.env.REACT_NATIVE_PUBLIC_API_URL?.trim() ||
    localOverride?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return API_BASE_URL.replace(/\/$/, '');
}

/** Build a path under /api (e.g. apiPath('products') → …/api/products). */
export function apiPath(segment) {
  const base = getApiBaseUrl();
  const path = segment.startsWith('/') ? segment : `/api/${segment}`;
  return `${base}${path}`;
}
