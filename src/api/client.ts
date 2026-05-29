import {getApiBaseUrl} from '../config/api';
import {ApiError, parseApiErrorMessage, type ApiErrorBody} from './errors';
import {getStoredToken} from './storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** true = require token, false = public, 'auto' = public then token on 401 if stored */
export type AuthMode = boolean | 'auto';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: AuthMode;
  headers?: Record<string, string>;
  /** json = auth/orders; jsonld = API Platform catalog */
  accept?: 'json' | 'jsonld' | 'both';
}

const ACCEPT_JSON = 'application/json';
const ACCEPT_BOTH = 'application/json, application/ld+json';
const ACCEPT_LD = 'application/ld+json';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function buildHeaders(
  auth: boolean,
  accept: ApiRequestOptions['accept'],
  method: HttpMethod,
  hasBody: boolean,
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const acceptHeader =
    accept === 'jsonld' ? ACCEPT_LD : accept === 'both' ? ACCEPT_BOTH : ACCEPT_JSON;

  const headers: Record<string, string> = {
    Accept: acceptHeader,
    ...extra,
  };

  if (hasBody && method !== 'GET') {
    headers['Content-Type'] = ACCEPT_JSON;
  }

  if (auth) {
    const token = await getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function isApiFailure(data: unknown, httpOk: boolean): data is ApiErrorBody & {success: false} {
  if (!data || typeof data !== 'object') {
    return !httpOk;
  }
  const body = data as ApiErrorBody & {success?: boolean};
  return body.success === false || !httpOk;
}

async function executeRequest<T>(
  path: string,
  options: ApiRequestOptions,
  useAuth: boolean,
): Promise<T> {
  const {method = 'GET', body, headers: extra, accept = 'jsonld'} = options;
  const base = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const hasBody = body != null && method !== 'GET';
  const headers = await buildHeaders(useAuth, accept, method, hasBody, extra);

  const init: RequestInit = {method, headers};
  if (hasBody) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let data: ApiErrorBody | T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as ApiErrorBody | T;
    } catch {
      data = null;
    }
  }

  if (response.status === 401 && useAuth) {
    unauthorizedHandler?.();
    const raw = parseApiErrorMessage(data as ApiErrorBody, '');
    const message =
      raw.toLowerCase().includes('invalid jwt') || raw.toLowerCase().includes('jwt token')
        ? 'Session expired. Please sign in again.'
        : raw || 'Session expired. Please sign in again.';
    throw new ApiError(message, 401);
  }

  if (isApiFailure(data, response.ok)) {
    const errBody = data as ApiErrorBody;
    const raw = parseApiErrorMessage(errBody, `Request failed (${response.status})`);
    const message =
      response.status === 401 &&
      (raw.toLowerCase().includes('invalid jwt') || raw.toLowerCase().includes('jwt token'))
        ? 'Session expired. Please sign in again.'
        : raw;
    if (response.status === 401 && useAuth) {
      unauthorizedHandler?.();
    }
    throw new ApiError(message, response.status, errBody?.code);
  }

  return (data ?? ({} as T)) as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {auth = true} = options;
  const resolvedAccept = options.accept ?? 'jsonld';

  if (auth === 'auto') {
    try {
      return await executeRequest<T>(path, {...options, accept: resolvedAccept}, false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const token = await getStoredToken();
        if (token) {
          return await executeRequest<T>(path, {...options, accept: resolvedAccept}, true);
        }
      }
      throw err;
    }
  }

  return executeRequest<T>(path, {...options, accept: resolvedAccept}, auth === true);
}

/** JSON auth/orders endpoints */
export async function apiJsonRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, {...options, accept: 'json'});
}
