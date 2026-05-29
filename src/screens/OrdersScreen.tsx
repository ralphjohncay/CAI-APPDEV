import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AppIcon from '../components/AppIcon';
import OrderStatusBadge from '../components/OrderStatusBadge';
import {ORDERS_POLL_INTERVAL_MS} from '../config/polling';
import {orderDisplayDate, orderDisplayTotal, orderItemCount} from '../api/orders-normalize';
import {fetchMyOrders} from '../services/orders';
import type {Order} from '../api/types';
import {formatPrice} from '../utils/cart';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

function ordersFingerprint(list: Order[]): string {
  return list.map(o => `${o.id}:${o.status ?? ''}:${o.totalPrice ?? ''}`).join('|');
}

const OrdersScreen = (): React.JSX.Element => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fingerprintRef = useRef('');

  const applyOrders = useCallback((next: Order[]) => {
    const fp = ordersFingerprint(next);
    if (fp === fingerprintRef.current) {
      return;
    }
    fingerprintRef.current = fp;
    setOrders(next);
  }, []);

  const loadSilent = useCallback(async () => {
    try {
      const next = await fetchMyOrders(true);
      applyOrders(next);
      setError(null);
    } catch {
      // Keep showing last list during background poll errors
    }
  }, [applyOrders]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const next = await fetchMyOrders(isRefresh);
        applyOrders(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load orders');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyOrders],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let inFlight = false;

      const tick = async () => {
        if (cancelled || inFlight) {
          return;
        }
        inFlight = true;
        try {
          await loadSilent();
        } finally {
          inFlight = false;
        }
      };

      void tick();
      const intervalId = setInterval(() => void tick(), ORDERS_POLL_INTERVAL_MS);

      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    }, [loadSilent]),
  );

  const showInitialLoader = loading && !refreshing;

  return (
    <View style={sharedStyles.screen}>
      {showInitialLoader ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{padding: 16}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <>
              <Text style={sharedStyles.heading2}>Your Orders</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          }
          renderItem={({item}) => (
            <View style={sharedStyles.card}>
              <View style={styles.row}>
                <View style={styles.orderTitleRow}>
                  <AppIcon name="orders" size={18} color={colors.accent} />
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                </View>
                <OrderStatusBadge status={item.status} />
              </View>
              {orderDisplayDate(item) ? (
                <Text style={styles.date}>
                  {new Date(orderDisplayDate(item)!).toLocaleDateString()} ·{' '}
                  {new Date(orderDisplayDate(item)!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              ) : null}
              <View style={styles.footer}>
                <Text style={styles.items}>
                  {orderItemCount(item)} item{orderItemCount(item) === 1 ? '' : 's'}
                </Text>
                <Text style={styles.total}>{formatPrice(orderDisplayTotal(item))}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="orders" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>Your orders will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  orderTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  orderId: {fontSize: 16, fontWeight: '800', color: colors.heading},
  date: {fontSize: 12, color: colors.muted, marginBottom: 12},
  footer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  items: {fontSize: 12, color: colors.muted, fontWeight: '500'},
  total: {fontSize: 16, fontWeight: '800', color: colors.accent},
  error: {color: colors.danger, marginBottom: 12, fontWeight: '500'},
  emptyContainer: {alignItems: 'center', justifyContent: 'center', paddingVertical: 48},
  emptyText: {fontSize: 16, fontWeight: '700', color: colors.heading, marginTop: 12, marginBottom: 4},
  emptySubtext: {fontSize: 13, color: colors.muted},
});

export default OrdersScreen;
