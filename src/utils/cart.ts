import {resourceIri} from '../config/api';
import type {CartLine, OrderItemType, Product, Service} from '../api/types';

export function cartLineFromProduct(product: Product, quantity = 1): CartLine {
  return {
    key: `product-${product.id}`,
    type: 'product',
    resourceId: product.id,
    iri: resourceIri('products', product.id),
    name: product.name,
    price: String(product.price),
    quantity,
  };
}

export function cartLineFromService(service: Service, quantity = 1): CartLine {
  return {
    key: `service-${service.id}`,
    type: 'service',
    resourceId: service.id,
    iri: resourceIri('services', service.id),
    name: service.name,
    price: String(service.price),
    quantity,
  };
}

export function formatPrice(value: string | number): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return `₱${num.toFixed(2)}`;
}

export function customerIri(userId: number): string {
  return resourceIri('users', userId);
}

export function orderItemsFromCart(items: CartLine[]) {
  return items.map(line => ({
    name: line.name,
    price: line.price,
    quantity: line.quantity,
    type: line.type as OrderItemType,
    ...(line.type === 'product' ? {product: line.iri} : {service: line.iri}),
  }));
}
