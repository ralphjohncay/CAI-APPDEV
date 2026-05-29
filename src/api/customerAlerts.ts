import AsyncStorage from '@react-native-async-storage/async-storage';

import {apiJsonRequest} from './client';
import {ApiError} from './errors';
import type {CustomerAlert, CustomerAlertsResponse} from './types';

const CURSOR_KEY = '@ralphs/customer_alert_cursor';

export async function getCustomerAlertCursor(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(CURSOR_KEY);
    return raw !== null ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export async function setCustomerAlertCursor(cursor: number): Promise<void> {
  try {
    await AsyncStorage.setItem(CURSOR_KEY, String(cursor));
  } catch {
    /* ignore */
  }
}

/** Bootstrap cursor (no new alerts). */
export async function bootstrapCustomerAlerts(): Promise<number> {
  const data = await apiJsonRequest<CustomerAlertsResponse>('/api/customer-alerts', {
    method: 'GET',
    auth: 'required',
  });
  const cursor = data.cursor ?? 0;
  await setCustomerAlertCursor(cursor);
  return cursor;
}

/** Poll alerts since last cursor; returns new items and updated cursor. */
export async function fetchCustomerAlertsSince(
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
