import {fetchAllHydraMembers} from './hydra';
import {isApiActive, normalizeCategory, normalizeProduct, normalizeService} from './normalize';
import {apiRequest} from './client';
import type {Category, Product, Service} from './types';

function withCacheBust(path: string, refresh: boolean): string {
  if (!refresh) {
    return path;
  }
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}_=${Date.now()}`;
}

/** Public catalog; retries with JWT if Railway requires auth and user is logged in. */
export async function fetchProducts(refresh = false): Promise<Product[]> {
  const items = await fetchAllHydraMembers<Product>(
    withCacheBust('/api/products?order[id]=desc', refresh),
    'auto',
  );
  return items.map(normalizeProduct).filter(p => isApiActive(p));
}

export async function fetchProduct(id: number, refresh = false): Promise<Product> {
  const product = await apiRequest<Product & {active?: boolean}>(
    withCacheBust(`/api/products/${id}`, refresh),
    {auth: 'auto'},
  );
  return normalizeProduct(product);
}

export async function fetchServices(refresh = false): Promise<Service[]> {
  const items = await fetchAllHydraMembers<Service>(
    withCacheBust('/api/services?order[id]=desc', refresh),
    'auto',
  );
  return items.map(normalizeService).filter(s => isApiActive(s));
}

export async function fetchCategories(refresh = false): Promise<Category[]> {
  const items = await fetchAllHydraMembers<Category & {active?: boolean}>(
    withCacheBust('/api/categories', refresh),
    'auto',
  );
  return items.map(normalizeCategory).filter(c => isApiActive(c));
}
