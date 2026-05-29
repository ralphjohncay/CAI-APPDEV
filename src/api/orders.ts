import {productIri, serviceIri} from '../config/api';
import {apiJsonRequest} from './client';
import {normalizeOrder, type OrderApiRaw} from './orders-normalize';
import type {CartLine, CreateOrderResponse, MyOrdersResponse, Order, OrderItemType, SingleOrderResponse} from './types';
import {ApiError} from './errors';

const MY_ORDERS_PATHS = ['/api/my-orders', '/api/orders/mine'] as const;

function cacheBust(path: string, refresh: boolean): string {
  if (!refresh) {
    return path;
  }
  return `${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`;
}

async function fetchOrdersFromPath(path: string): Promise<Order[]> {
  const data = await apiJsonRequest<MyOrdersResponse & {orders?: OrderApiRaw[]}>(path, {
    auth: true,
  });
  const raw = data.orders ?? [];
  return raw.map(row => normalizeOrder(row as OrderApiRaw));
}

/** GET /api/my-orders (preferred) or /api/orders/mine */
export async function fetchMyOrders(refresh = false): Promise<Order[]> {
  let lastError: unknown;
  for (const base of MY_ORDERS_PATHS) {
    try {
      return await fetchOrdersFromPath(cacheBust(base, refresh));
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError && err.status === 404) {
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not load orders');
}

export async function fetchOrder(id: number): Promise<Order> {
  const data = await apiJsonRequest<SingleOrderResponse & {order?: OrderApiRaw}>(
    `/api/orders/${id}`,
    {auth: true},
  );
  if (!data.order) {
    throw new Error(data.message || 'Order not found');
  }
  return normalizeOrder(data.order);
}

/**
 * POST /api/orders — customer from JWT (do not send customer IRI).
 * Products-only carts use simple `items`; mixed carts use `orderItems` + product/service IRIs.
 */
export async function createOrder(cartLines: CartLine[]): Promise<Order> {
  const status = 'pending_approval';
  const allProducts = cartLines.length > 0 && cartLines.every(l => l.type === 'product');

  const body = allProducts
    ? {
        status,
        items: cartLines.map(line => ({
          productId: line.resourceId,
          quantity: line.quantity,
        })),
      }
    : {
        status,
        orderItems: cartLines.map(line => ({
          name: line.name,
          price: line.price,
          quantity: line.quantity,
          type: line.type as OrderItemType,
          ...(line.type === 'product'
            ? {product: productIri(line.resourceId)}
            : {service: serviceIri(line.resourceId)}),
        })),
      };

  const data = await apiJsonRequest<CreateOrderResponse & {order?: OrderApiRaw}>('/api/orders', {
    method: 'POST',
    body,
    auth: true,
  });

  if (!data.order) {
    throw new Error(data.message || 'Order placed but response had no order data');
  }

  return normalizeOrder(data.order);
}
