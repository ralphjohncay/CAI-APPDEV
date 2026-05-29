import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';

import {
  bootstrapCustomerAlerts,
  fetchCustomerAlertsSince,
  getCustomerAlertCursor,
  setCustomerAlertCursor,
} from '../api/customerAlerts';
import {fetchNotifications} from '../api/notifications';
import type {AppNotification, CustomerAlert} from '../api/types';
import type {RootState} from '../app/reducers';
import {CUSTOMER_ALERTS_POLL_INTERVAL_MS} from '../config/polling';
import {
  dismissNotificationKey,
  getDismissedNotificationKeys,
  pruneDismissedKeys,
} from '../services/notificationStorage';

const ANNOUNCEMENT_POLL_MS = 60_000;
const MAX_ACTIVITY_ITEMS = 40;

function mapCustomerAlert(alert: CustomerAlert): AppNotification {
  return {
    id: alert.id,
    dismissKey: `c-${alert.id}`,
    source: 'activity',
    title: alert.title,
    message: alert.message,
    type: alert.type,
    createdAt: alert.createdAt,
    category: alert.category,
    event: alert.event,
  };
}

function mergeNotifications(
  activity: AppNotification[],
  announcements: AppNotification[],
): AppNotification[] {
  const byKey = new Map<string, AppNotification>();
  for (const item of [...activity, ...announcements]) {
    byKey.set(item.dismissKey, item);
  }
  return Array.from(byKey.values()).sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });
}

export function useNotifications(): {
  visible: AppNotification[];
  loading: boolean;
  refresh: () => void;
  dismiss: (dismissKey: string) => void;
} {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.session?.accessToken);
  const [announcements, setAnnouncements] = useState<AppNotification[]>([]);
  const [activity, setActivity] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const activityRef = useRef<AppNotification[]>([]);

  const loadAnnouncements = useCallback(async (isRefresh = false) => {
    const items = await fetchNotifications(isRefresh);
    if (mounted.current) {
      setAnnouncements(items);
    }
    return items;
  }, []);

  const loadActivity = useCallback(async () => {
    if (!isLoggedIn) {
      if (mounted.current) {
        setActivity([]);
        activityRef.current = [];
      }
      return;
    }

    try {
      let cursor = await getCustomerAlertCursor();
      if (cursor === null) {
        cursor = await bootstrapCustomerAlerts();
      }

      const {alerts, cursor: nextCursor} = await fetchCustomerAlertsSince(cursor);
      await setCustomerAlertCursor(nextCursor);

      if (!mounted.current || alerts.length === 0) {
        return;
      }

      const mapped = alerts.map(mapCustomerAlert);
      const merged = [...mapped, ...activityRef.current];
      const seen = new Set<string>();
      const deduped: AppNotification[] = [];
      for (const item of merged) {
        if (seen.has(item.dismissKey)) {
          continue;
        }
        seen.add(item.dismissKey);
        deduped.push(item);
      }
      const trimmed = deduped.slice(0, MAX_ACTIVITY_ITEMS);
      activityRef.current = trimmed;
      setActivity(trimmed);
    } catch {
      /* silent — catalog/order polling still works */
    }
  }, [isLoggedIn]);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        const [announcementItems, dismissedKeys] = await Promise.all([
          loadAnnouncements(isRefresh),
          getDismissedNotificationKeys(),
        ]);
        await loadActivity();
        if (!mounted.current) {
          return;
        }
        const all = mergeNotifications(activityRef.current, announcementItems);
        await pruneDismissedKeys(all.map(n => n.dismissKey));
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
    },
    [loadAnnouncements, loadActivity],
  );

  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    mounted.current = true;
    void load();

    const announcementInterval = setInterval(
      () => void loadAnnouncements(true),
      ANNOUNCEMENT_POLL_MS,
    );
    const activityInterval = setInterval(
      () => void loadActivity(),
      CUSTOMER_ALERTS_POLL_INTERVAL_MS,
    );

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void load(true);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      mounted.current = false;
      clearInterval(announcementInterval);
      clearInterval(activityInterval);
      sub.remove();
    };
  }, [load, loadAnnouncements, loadActivity]);

  useEffect(() => {
    if (!isLoggedIn) {
      setActivity([]);
      activityRef.current = [];
    } else {
      void loadActivity();
    }
  }, [isLoggedIn, loadActivity]);

  const dismiss = useCallback((dismissKey: string) => {
    void dismissNotificationKey(dismissKey).then(() => {
      setDismissed(prev => (prev.includes(dismissKey) ? prev : [...prev, dismissKey]));
    });
  }, []);

  const all = mergeNotifications(activity, announcements);
  const visible = all.filter(n => !dismissed.includes(n.dismissKey));

  return {
    visible,
    loading,
    refresh: () => void load(true),
    dismiss,
  };
}
