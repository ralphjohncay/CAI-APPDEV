import {useCallback, useEffect, useRef} from 'react';
import {Alert, AppState, type AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';

import {
  bootstrapCustomerAlerts,
  fetchCustomerAlertsSince,
  getCustomerAlertCursor,
  setCustomerAlertCursor,
} from '../api/customerAlerts';
import type {CustomerAlert} from '../api/types';
import type {RootState} from '../app/reducers';
import {CUSTOMER_ALERTS_POLL_INTERVAL_MS} from '../config/polling';
import {navigate} from '../navigations/navigationRef';
import ROUTES from '../utils/routes';

/**
 * Polls admin order/product activity and shows native Alert dialogs (no FCM).
 */
export function useCustomerAlerts(): void {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.session?.token);
  const mounted = useRef(true);
  const queueRef = useRef<CustomerAlert[]>([]);
  const showingRef = useRef(false);

  const showNextAlert = useCallback(() => {
    if (!mounted.current || showingRef.current || queueRef.current.length === 0) {
      return;
    }

    const alert = queueRef.current.shift();
    if (!alert) {
      return;
    }

    showingRef.current = true;

    const buttons: Array<{
      text: string;
      style?: 'cancel' | 'default' | 'destructive';
      onPress?: () => void;
    }> = [
      {
        text: 'OK',
        style: 'cancel',
        onPress: () => {
          showingRef.current = false;
          showNextAlert();
        },
      },
    ];

    if (alert.category === 'order') {
      buttons.unshift({
        text: 'View orders',
        onPress: () => {
          showingRef.current = false;
          navigate(ROUTES.ORDERS);
          showNextAlert();
        },
      });
    } else if (alert.category === 'product' && alert.entityId) {
      buttons.unshift({
        text: 'View shop',
        onPress: () => {
          showingRef.current = false;
          navigate(ROUTES.HOME);
          showNextAlert();
        },
      });
    }

    Alert.alert(alert.title, alert.message, buttons, {
      cancelable: true,
      onDismiss: () => {
        showingRef.current = false;
        showNextAlert();
      },
    });
  }, []);

  const enqueueAlerts = useCallback(
    (alerts: CustomerAlert[]) => {
      if (alerts.length === 0) {
        return;
      }
      queueRef.current.push(...alerts);
      showNextAlert();
    },
    [showNextAlert],
  );

  const poll = useCallback(async () => {
    if (!isLoggedIn || !mounted.current) {
      return;
    }

    try {
      let cursor = await getCustomerAlertCursor();
      if (cursor === null) {
        cursor = await bootstrapCustomerAlerts();
        return;
      }

      const {alerts, cursor: nextCursor} = await fetchCustomerAlertsSince(cursor);
      await setCustomerAlertCursor(nextCursor);

      if (!mounted.current || alerts.length === 0) {
        return;
      }

      enqueueAlerts(alerts);
    } catch {
      /* silent */
    }
  }, [enqueueAlerts, isLoggedIn]);

  useEffect(() => {
    mounted.current = true;
    queueRef.current = [];
    showingRef.current = false;

    if (isLoggedIn) {
      void poll();
    }

    const interval = setInterval(() => void poll(), CUSTOMER_ALERTS_POLL_INTERVAL_MS);
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active' && isLoggedIn) {
        void poll();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [isLoggedIn, poll]);
}
