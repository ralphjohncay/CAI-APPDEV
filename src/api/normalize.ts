import type {Category, Product, Service} from './types';

type WithActive = {isActive?: boolean; active?: boolean};

export function isApiActive(item: WithActive): boolean {
  const flag = item.isActive ?? item.active;
  return flag !== false;
}

export function normalizeProduct(raw: Product & {active?: boolean}): Product {
  return {
    ...raw,
    isActive: isApiActive(raw),
  };
}

export function normalizeService(raw: Service & {active?: boolean}): Service {
  return {
    ...raw,
    isActive: isApiActive(raw),
  };
}

export function normalizeCategory(raw: Category & {active?: boolean}): Category {
  return {
    ...raw,
    isActive: isApiActive(raw),
  };
}
