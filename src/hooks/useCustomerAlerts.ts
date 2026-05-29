import {useCallback, useEffect, useRef} from 'react';
import {Alert, AppState, type AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';

import {
  bootstrapCustomerAlerts,
  fetchCustomerAlertsSince,
  getCustomerAlertCursor,
  setCustomerAlertCursor,
} from '../api/customerAlerts';
import type {CustomerAlert, NotificationType, Order, Product} from '../api/types';
import type {RootState} from '../app/reducers';
import {CUSTOMER_ALERTS_POLL_INTERVAL_MS} from '../config/polling';
import {navigate} from '../navigations/navigationRef';
import {fetchMyOrders} from '../services/orders';
import {formatOrderStatus} from '../theme/orderStatus';
import ROUTES from '../utils/routes';

type LocalAlert = CustomerAlert & {localKey?: string};

function alertTypeForOrderStatus(status: string): NotificationType {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'success';
    case 'canceled':
      return 'danger';
    case 'pending_approval':
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Polls admin activity; watches shop catalog and order status (native Alert, no FCM).
 */
export function useCustomerAlerts(): void {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.session?.token);
  const products = useSelector((state: RootState) => state.products.items);
  const mounted = useRef(true);
  const queueRef = useRef<LocalAlert[]>([]);
  const showingRef = useRef(false);
  const shownKeysRef = useRef<Set<string>>(new Set());
  const catalogReadyRef = useRef(false);
  const ordersReadyRef = useRef(false);
  const prevCatalogRef = useRef<Map<number, Product>>(new Map());
  const prevOrdersRef = useRef<Map<number, string>>(new Map());

  const showNextAlert = useCallback(() => {
    if (!mounted.current || showingRef.current || queueRef.current.length === 0) {
      return;
    }

    const alert = queueRef.current.shift();
    if (!alert) {
      return;
    }

    const dedupeKey =
      alert.localKey ?? `api-${alert.category}-${alert.event}-${alert.id}`;
    if (shownKeysRef.current.has(dedupeKey)) {
      showNextAlert();
      return;
    }
    shownKeysRef.current.add(dedupeKey);

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
    } else if (alert.category === 'product') {
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
    (alerts: LocalAlert[]) => {
      if (alerts.length === 0) {
        return;
      }
      queueRef.current.push(...alerts);
      showNextAlert();
    },
    [showNextAlert],
  );

  const pollApi = useCallback(async () => {
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

  const pollOrders = useCallback(async () => {
    if (!isLoggedIn || !mounted.current) {
      return;
    }

    try {
      const orders = await fetchMyOrders(true);
      const next = new Map(orders.map((o: Order) => [o.id, o.status ?? '']));

      if (!ordersReadyRef.current) {
        ordersReadyRef.current = true;
        prevOrdersRef.current = next;
        return;
      }

      const orderAlerts: LocalAlert[] = [];

      for (const order of orders) {
        const prevStatus = prevOrdersRef.current.get(order.id);
        const newStatus = order.status ?? '';
        if (prevStatus !== undefined && prevStatus !== newStatus) {
          const prevLabel = formatOrderStatus(prevStatus);
          const newLabel = formatOrderStatus(newStatus);
          orderAlerts.push({
            id: order.id,
            category: 'order',
            event: 'status_changed',
            title: 'Order updated',
            message: `Order #${order.id} status changed: ${prevLabel} → ${newLabel}.`,
            type: alertTypeForOrderStatus(newStatus),
            entityType: 'Order',
            entityId: order.id,
            createdAt: new Date().toISOString(),
            localKey: `order-status-${order.id}-${newStatus}`,
          });
        }
      }

      prevOrdersRef.current = next;

      if (orderAlerts.length > 0) {
        enqueueAlerts(orderAlerts);
      }
    } catch {
      /* silent */
    }
  }, [enqueueAlerts, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !mounted.current) {
      return;
    }

    const prev = prevCatalogRef.current;
    const next = new Map(products.map(p => [p.id, p]));

    if (!catalogReadyRef.current) {
      catalogReadyRef.current = true;
      prevCatalogRef.current = next;
      return;
    }

    const catalogAlerts: LocalAlert[] = [];

    for (const product of products) {
      if (!prev.has(product.id)) {
        catalogAlerts.push({
          id: product.id,
          category: 'product',
          event: 'created',
          title: 'Product added',
          message: `"${product.name}" was added to the shop.`,
          type: 'success',
          entityType: 'Product',
          entityId: product.id,
          createdAt: new Date().toISOString(),
          localKey: `catalog-add-${product.id}`,
        });
      }
    }

    for (const [id, product] of prev) {
      if (!next.has(id)) {
        catalogAlerts.push({
          id,
          category: 'product',
          event: 'deleted',
          title: 'Product removed',
          message: `"${product.name}" was removed from the shop.`,
          type: 'warning',
          entityType: 'Product',
          entityId: id,
          createdAt: new Date().toISOString(),
          localKey: `catalog-remove-${id}`,
        });
      }
    }

    prevCatalogRef.current = next;

    if (catalogAlerts.length > 0) {
      enqueueAlerts(catalogAlerts);
    }
  }, [enqueueAlerts, isLoggedIn, products]);

  useEffect(() => {
    mounted.current = true;

    if (!isLoggedIn) {
      catalogReadyRef.current = false;
      ordersReadyRef.current = false;
      prevCatalogRef.current = new Map();
      prevOrdersRef.current = new Map();
      queueRef.current = [];
      showingRef.current = false;
      return;
    }

    const tick = () => {
      void pollApi();
      void pollOrders();
    };

    tick();

    const interval = setInterval(tick, CUSTOMER_ALERTS_POLL_INTERVAL_MS);
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active' && isLoggedIn) {
        tick();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [isLoggedIn, pollApi, pollOrders]);
}
