import type {ApiUser, RegisterPayload} from '../api/types';
import type {CartLine} from '../api/types';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN';

export const USER_REGISTER = 'USER_REGISTER';
export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST';
export const USER_REGISTER_COMPLETE = 'USER_REGISTER_COMPLETE';
export const USER_REGISTER_ERROR = 'USER_REGISTER_ERROR';

export const AUTH_RESTORE = 'AUTH_RESTORE';
export const AUTH_RESTORE_COMPLETE = 'AUTH_RESTORE_COMPLETE';
export const AUTH_RESTORE_ERROR = 'AUTH_RESTORE_ERROR';

export const AUTH_SET_USER = 'AUTH_SET_USER';

export const CART_ADD = 'CART_ADD';
export const CART_REMOVE = 'CART_REMOVE';
export const CART_UPDATE_QTY = 'CART_UPDATE_QTY';
export const CART_CLEAR = 'CART_CLEAR';

export const PRODUCTS_FETCH = 'PRODUCTS_FETCH';
export const PRODUCTS_FETCH_REQUEST = 'PRODUCTS_FETCH_REQUEST';
export const PRODUCTS_FETCH_SUCCESS = 'PRODUCTS_FETCH_SUCCESS';
export const PRODUCTS_FETCH_ERROR = 'PRODUCTS_FETCH_ERROR';
export const PRODUCTS_POLLING_START = 'PRODUCTS_POLLING_START';
export const PRODUCTS_POLLING_STOP = 'PRODUCTS_POLLING_STOP';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserLoginAction {
  type: typeof USER_LOGIN;
  payload: LoginPayload;
  [key: string]: unknown;
}

export interface UserRegisterAction {
  type: typeof USER_REGISTER;
  payload: RegisterPayload;
  [key: string]: unknown;
}

export interface AuthRestoreAction {
  type: typeof AUTH_RESTORE;
  [key: string]: unknown;
}

export interface ResetUserLoginAction {
  type: typeof RESET_USER_LOGIN;
  [key: string]: unknown;
}

export interface CartAddAction {
  type: typeof CART_ADD;
  payload: CartLine;
  [key: string]: unknown;
}

export interface CartRemoveAction {
  type: typeof CART_REMOVE;
  payload: {key: string};
  [key: string]: unknown;
}

export interface CartUpdateQtyAction {
  type: typeof CART_UPDATE_QTY;
  payload: {key: string; quantity: number};
  [key: string]: unknown;
}

export const authLogin = (payload: LoginPayload): UserLoginAction => ({
  type: USER_LOGIN,
  payload,
});

export const authRegister = (payload: RegisterPayload): UserRegisterAction => ({
  type: USER_REGISTER,
  payload,
});

export const authRestore = (): AuthRestoreAction => ({
  type: AUTH_RESTORE,
});

export const authLogout = (): ResetUserLoginAction => ({
  type: RESET_USER_LOGIN,
});

export const authSetUser = (user: ApiUser): {type: typeof AUTH_SET_USER; payload: ApiUser; [key: string]: unknown} => ({
  type: AUTH_SET_USER,
  payload: user,
});

export const cartAdd = (payload: CartLine): CartAddAction => ({
  type: CART_ADD,
  payload,
});

export const cartRemove = (key: string): CartRemoveAction => ({
  type: CART_REMOVE,
  payload: {key},
});

export const cartUpdateQty = (key: string, quantity: number): CartUpdateQtyAction => ({
  type: CART_UPDATE_QTY,
  payload: {key, quantity},
});

export const cartClear = (): {type: typeof CART_CLEAR; [key: string]: unknown} => ({
  type: CART_CLEAR,
});

export interface ProductsFetchOptions {
  refresh?: boolean;
  silent?: boolean;
}

export interface ProductsFetchAction {
  type: typeof PRODUCTS_FETCH;
  payload?: ProductsFetchOptions;
  [key: string]: unknown;
}

export interface ProductsPollingStartAction {
  type: typeof PRODUCTS_POLLING_START;
  [key: string]: unknown;
}

export interface ProductsPollingStopAction {
  type: typeof PRODUCTS_POLLING_STOP;
  [key: string]: unknown;
}

export const productsFetch = (
  options: ProductsFetchOptions = {},
): ProductsFetchAction => ({
  type: PRODUCTS_FETCH,
  payload: options,
});

export const productsPollingStart = (): ProductsPollingStartAction => ({
  type: PRODUCTS_POLLING_START,
});

export const productsPollingStop = (): ProductsPollingStopAction => ({
  type: PRODUCTS_POLLING_STOP,
});

export type AuthSession = {
  token: string;
  user: ApiUser;
};
