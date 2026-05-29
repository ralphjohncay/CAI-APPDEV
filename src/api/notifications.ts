import {apiJsonRequest} from './client';
import {ApiError} from './errors';
import type {AppNotification, NotificationsResponse} from './types';

/**
 * GET /api/notifications — public; includes customer-only items when JWT is sent (auth: auto).
 */
export async function fetchNotifications(refresh = false): Promise<AppNotification[]> {
  const path = refresh ? `/api/notifications?_=${Date.now()}` : '/api/notifications';

  try {
    const data = await apiJsonRequest<NotificationsResponse>(path, {
      method: 'GET',
      auth: 'auto',
    });
    return (data.notifications ?? []).map(item => ({
      ...item,
      source: 'announcement' as const,
      dismissKey: `a-${item.id}`,
    }));
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
      return [];
    }
    throw err;
  }
}
