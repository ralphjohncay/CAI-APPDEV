export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserLoginAction {
  type: typeof USER_LOGIN;
  payload: LoginPayload;
  [key: string]: unknown;
}

export interface ResetUserLoginAction {
  type: typeof RESET_USER_LOGIN;
  [key: string]: unknown;
}

export const authLogin = (payload: LoginPayload): UserLoginAction => ({
  type: USER_LOGIN,
  payload,
});

export const authLogout = (): ResetUserLoginAction => ({
  type: RESET_USER_LOGIN,
});
