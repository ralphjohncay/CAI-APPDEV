import type {Order, OrderItem, OrderItemType, OrderStatus} from './types';

/** Raw order shape from GET /api/my-orders or POST /api/orders */
export interface OrderApiRaw {
  id: number;
  status: string;
  total?: number | string;
  totalPrice?: string;
  createdAt?: string;
  orderDate?: string;
  customerId?: number;
  items?: OrderItemApiRaw[];
  orderItems?: OrderItemApiRaw[];
}

export interface OrderItemApiRaw {
  id?: number;
  productId?: number;
  serviceId?: number;
  productName?: string;
  name?: string;
  quantity: number;
  price: number | string;
  type?: string;
}

export function normalizeOrderItem(raw: OrderItemApiRaw): OrderItem {
  const name = raw.name ?? raw.productName ?? 'Item';
  const type = (raw.type === 'service' ? 'service' : 'product') as OrderItemType;
  return {
    id: raw.id,
    name,
    price: String(raw.price),
    quantity: raw.quantity,
    type,
    product: raw.productId != null ? `/api/products/${raw.productId}` : undefined,
    service: raw.serviceId != null ? `/api/services/${raw.serviceId}` : undefined,
  };
}

export function normalizeOrder(raw: OrderApiRaw): Order {
  const lineItems = raw.items?.length
    ? raw.items
    : raw.orderItems?.length
      ? raw.orderItems
      : [];
  return {
    id: raw.id,
    status: raw.status as OrderStatus,
    orderDate: raw.orderDate ?? raw.createdAt,
    totalPrice: String(raw.totalPrice ?? raw.total ?? '0'),
    customerId: raw.customerId,
    orderItems: lineItems.map(normalizeOrderItem),
  };
}

export function orderItemCount(order: Order): number {
  return order.orderItems?.length ?? 0;
}

export function orderDisplayTotal(order: Order): string | number {
  return order.totalPrice ?? '0';
}

export function orderDisplayDate(order: Order): string | undefined {
  return order.orderDate;
}
