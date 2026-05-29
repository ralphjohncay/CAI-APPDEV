import {apiJsonRequest} from './client';
import {ApiError} from './errors';
import {
  getCustomerAlertCursorForUser,
  setCustomerAlertCursorForUser,
} from '../services/customerAlertStorage';
import type {CustomerAlert, CustomerAlertsResponse} from './types';

/** Bootstrap cursor for this user (does not return historical alerts). */
export async function bootstrapCustomerAlerts(userId: number): Promise<number> {
  const data = await apiJsonRequest<CustomerAlertsResponse>('/api/customer-alerts', {
    method: 'GET',
    auth: 'required',
  });
  const cursor = data.cursor ?? 0;
  await setCustomerAlertCursorForUser(userId, cursor);
  return cursor;
}

/** Poll alerts since last cursor; returns new items and updated cursor. */
export async function fetchCustomerAlertsSince(
  userId: number,
  since: number,
): Promise<{alerts: CustomerAlert[]; cursor: number}> {
  try {
    const data = await apiJsonRequest<CustomerAlertsResponse>(
      `/api/customer-alerts?since=${encodeURIComponent(String(since))}`,
      {method: 'GET', auth: 'required'},
    );
    return {
      alerts: data.alerts ?? [],
      cursor: data.cursor ?? since,
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      return {alerts: [], cursor: since};
    }
    throw err;
  }
}

export async function getCustomerAlertCursor(userId: number): Promise<number | null> {
  return getCustomerAlertCursorForUser(userId);
}

export async function setCustomerAlertCursor(
  userId: number,
  cursor: number,
): Promise<void> {
  await setCustomerAlertCursorForUser(userId, cursor);
}
