import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, type AppStateStatus} from 'react-native';

import {fetchNotifications} from '../api/notifications';
import type {AppNotification} from '../api/types';
import {
  dismissNotificationId,
  getDismissedNotificationIds,
  pruneDismissedIds,
} from '../services/notificationStorage';

const POLL_MS = 60_000;

export function useNotifications(): {
  visible: AppNotification[];
  loading: boolean;
  refresh: () => void;
  dismiss: (id: number) => void;
} {
  const [all, setAll] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async (isRefresh = false) => {
    try {
      const [items, dismissedIds] = await Promise.all([
        fetchNotifications(isRefresh),
        getDismissedNotificationIds(),
      ]);
      if (!mounted.current) {
        return;
      }
      await pruneDismissedIds(items.map(n => n.id));
      setAll(items);
      setDismissed(dismissedIds);
    } catch {
      if (mounted.current) {
        setAll([]);
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

  const dismiss = useCallback((id: number) => {
    void dismissNotificationId(id).then(() => {
      setDismissed(prev => (prev.includes(id) ? prev : [...prev, id]));
    });
  }, []);

  const visible = all.filter(n => !dismissed.includes(n.id));

  return {
    visible,
    loading,
    refresh: () => void load(true),
    dismiss,
  };
}
