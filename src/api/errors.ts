export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  detail?: string;
  code?: string | number;
  title?: string;
  errors?: Record<string, string>;
  violations?: Array<{message?: string; propertyPath?: string}>;
  ['hydra:description']?: string;
  ['hydra:title']?: string;
}

export function parseApiErrorMessage(
  body: ApiErrorBody | string | null | undefined,
  fallback: string,
): string {
  if (!body) {
    return fallback;
  }
  if (typeof body === 'string') {
    return body.trim() || fallback;
  }
  if (body.violations?.length) {
    return body.violations.map(v => v.message || v.propertyPath).filter(Boolean).join('\n');
  }
  const nestedError = body.errors
    ? Object.values(body.errors).find(v => typeof v === 'string' && v.trim())
    : undefined;

  return (
    body.message ||
    nestedError ||
    body.detail ||
    body['hydra:description'] ||
    body.title ||
    body['hydra:title'] ||
    (body.code != null ? String(body.code) : '') ||
    fallback
  );
}

export class ApiError extends Error {
  status: number;
  code?: string | number;

  constructor(message: string, status: number, code?: string | number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
