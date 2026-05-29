import {API_BASE_URL, apiPath, getApiBaseUrl} from './api.config.js';

export {API_BASE_URL, getApiBaseUrl, apiPath};

export function productImageUrl(filename: string | null | undefined): string | null {
  if (!filename) {
    return null;
  }
  if (filename.startsWith('http')) {
    return filename;
  }
  const base = getApiBaseUrl();
  const path = filename.startsWith('/uploads')
    ? filename
    : `/uploads/products/${filename}`;
  return `${base}${path}`;
}

export function resourceIri(resource: string, id: number | string): string {
  const path = resource.startsWith('/') ? resource : `/api/${resource}`;
  return `${path.replace(/\/$/, '')}/${id}`;
}

export function productIri(productId: number): string {
  return resourceIri('products', productId);
}

export function serviceIri(serviceId: number): string {
  return resourceIri('services', serviceId);
}
