import {fetchMyOrders as fetchMyOrdersApi, fetchOrder, createOrder} from '../api/orders';

export {fetchOrder, createOrder};

export function fetchMyOrders(refresh = false) {
  return fetchMyOrdersApi(refresh);
}

/** @deprecated Use fetchMyOrders */
export function fetchOrders(_userId?: number, refresh = false) {
  return fetchMyOrdersApi(refresh);
}
