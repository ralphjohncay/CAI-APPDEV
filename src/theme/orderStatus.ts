import type {OrderStatus} from '../api/types';
import {colors} from './colors';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_approval: 'Pending approval',
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  canceled: 'Canceled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_approval: colors.accent,
  pending: colors.accentDark,
  approved: colors.success,
  completed: colors.primary,
  canceled: colors.muted,
};

export function formatOrderStatus(status: string): string {
  if (status in ORDER_STATUS_LABELS) {
    return ORDER_STATUS_LABELS[status as OrderStatus];
  }
  return status.replace(/_/g, ' ');
}
