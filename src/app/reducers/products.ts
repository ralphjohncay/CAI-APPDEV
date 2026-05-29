import {
  PRODUCTS_FETCH_ERROR,
  PRODUCTS_FETCH_REQUEST,
  PRODUCTS_FETCH_SUCCESS,
  type ProductsFetchOptions,
} from '../actions';
import type {Product} from '../../api/types';

export interface ProductsState {
  items: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
}

interface FetchRequestAction {
  type: typeof PRODUCTS_FETCH_REQUEST;
  payload?: ProductsFetchOptions;
}

interface FetchSuccessAction {
  type: typeof PRODUCTS_FETCH_SUCCESS;
  payload: Product[];
}

interface FetchErrorAction {
  type: typeof PRODUCTS_FETCH_ERROR;
  error: string;
  meta?: {silent?: boolean};
}

type ProductsAction = FetchRequestAction | FetchSuccessAction | FetchErrorAction;

const INITIAL: ProductsState = {
  items: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdatedAt: null,
};

export default function reducer(
  state: ProductsState = INITIAL,
  action: ProductsAction,
): ProductsState {
  switch (action.type) {
    case PRODUCTS_FETCH_REQUEST:
      if (action.payload?.refresh) {
        return {...state, isRefreshing: true, error: null};
      }
      return {...state, isLoading: true, error: null};
    case PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdatedAt: Date.now(),
      };
    case PRODUCTS_FETCH_ERROR:
      if (action.meta?.silent) {
        return {...state, isLoading: false, isRefreshing: false};
      }
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        error: action.error,
      };
    default:
      return state;
  }
}
