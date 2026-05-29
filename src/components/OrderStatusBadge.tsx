import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatOrderStatus, ORDER_STATUS_COLORS} from '../theme/orderStatus';
import type {OrderStatus} from '../api/types';

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge = ({status}: OrderStatusBadgeProps): React.JSX.Element => {
  const bg =
    status in ORDER_STATUS_COLORS
      ? ORDER_STATUS_COLORS[status as OrderStatus]
      : '#9e9e9e';
  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <Text style={styles.text}>{formatOrderStatus(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default OrderStatusBadge;
