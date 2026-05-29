import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, type AppStateStatus} from 'react-native';

import {fetchNotifications} from '../api/notifications';
import type {AppNotification} from '../api/types';
import {
  dismissNotificationKey,
  getDismissedNotificationKeys,
  pruneDismissedKeys,
} from '../services/notificationStorage';

const POLL_MS = 60_000;

/**
 * Admin-published announcement bar only (not order/product activity — those use Alert).
 */
export function useNotifications(): {
  visible: AppNotification[];
  loading: boolean;
  refresh: () => void;
  dismiss: (dismissKey: string) => void;
} {
  const [announcements, setAnnouncements] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async (isRefresh = false) => {
    try {
      const [items, dismissedKeys] = await Promise.all([
        fetchNotifications(isRefresh),
        getDismissedNotificationKeys(),
      ]);
      if (!mounted.current) {
        return;
      }
      await pruneDismissedKeys(items.map(n => n.dismissKey));
      setAnnouncements(items);
      setDismissed(dismissedKeys);
    } catch {
      if (mounted.current) {
        setAnnouncements([]);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    const interval = setInterval(() => void load(true), POLL_MS);
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void load(true);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      mounted.current = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [load]);

  const dismiss = useCallback((dismissKey: string) => {
    void dismissNotificationKey(dismissKey).then(() => {
      setDismissed(prev => (prev.includes(dismissKey) ? prev : [...prev, dismissKey]));
    });
  }, []);

  const visible = announcements.filter(n => !dismissed.includes(n.dismissKey));

  return {
    visible,
    loading,
    refresh: () => void load(true),
    dismiss,
  };
}
