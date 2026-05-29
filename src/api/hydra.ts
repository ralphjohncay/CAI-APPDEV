import {apiRequest, type AuthMode} from './client';
import type {HydraCollection} from './types';

export function hydraMembers<T>(data: HydraCollection<T> | null | undefined): T[] {
  if (!data) {
    return [];
  }
  return data['hydra:member'] ?? data.member ?? data.orders ?? [];
}

export function hydraNextUrl<T>(data: HydraCollection<T>): string | null {
  const view = data['hydra:view'];
  if (!view?.['hydra:next']) {
    return null;
  }
  return view['hydra:next'];
}

/** Follow hydra:next until all pages are loaded (admin catalog changes always visible after refresh). */
export async function fetchAllHydraMembers<T>(
  initialPath: string,
  auth: AuthMode = true,
): Promise<T[]> {
  const items: T[] = [];
  let path: string | null = initialPath;

  while (path) {
    const page: HydraCollection<T> = await apiRequest<HydraCollection<T>>(path, {auth});
    items.push(...hydraMembers(page));
    path = hydraNextUrl(page);
  }

  return items;
}

export function extractIdFromIri(iri: string | undefined | null): number | null {
  if (!iri) {
    return null;
  }
  const match = iri.match(/\/(\d+)(?:\?.*)?$/);
  return match ? Number(match[1]) : null;
}

export function entityIri(entity: {['@id']?: string; id?: number}, fallbackPath: string): string {
  if (entity['@id']) {
    return entity['@id'];
  }
  if (entity.id != null) {
    return `${fallbackPath}/${entity.id}`;
  }
  return fallbackPath;
}

export function isOrderForUser(
  order: {customer?: string | {['@id']?: string; id?: number} | null},
  userId: number,
): boolean {
  const customer = order.customer;
  if (!customer) {
    return false;
  }
  if (typeof customer === 'string') {
    return extractIdFromIri(customer) === userId;
  }
  if (customer.id != null) {
    return customer.id === userId;
  }
  return extractIdFromIri(customer['@id']) === userId;
}
