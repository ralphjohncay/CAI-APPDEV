/**
 * Central API config entry (Metro resolves `config/api` to this file before api.ts).
 * Base URL from api.config.js; helpers from api.ts.
 */
export {API_BASE_URL, getApiBaseUrl, apiPath} from './api.config';
export {productImageUrl, resourceIri, productIri, serviceIri} from './api.ts';
