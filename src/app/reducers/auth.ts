import {
  RESET_USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../actions';

export interface AuthState {
  data: Record<string, unknown> | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

interface LoginRequestAction {
  type: typeof USER_LOGIN_REQUEST;
}

interface LoginCompleteAction {
  type: typeof USER_LOGIN_COMPLETE;
  payload?: Record<string, unknown> | null;
}

interface LoginErrorAction {
  type: typeof USER_LOGIN_ERROR;
  error?: string;
}

interface ResetLoginAction {
  type: typeof RESET_USER_LOGIN;
}

type AuthAction =
  | LoginRequestAction
  | LoginCompleteAction
  | LoginErrorAction
  | ResetLoginAction;

const INITIALSTATE: AuthState = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
};

export default function reducer(
  state: AuthState = INITIALSTATE,
  action: AuthAction,
): AuthState {
  console.log(action.type);
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      };
    case USER_LOGIN_COMPLETE:
      return {
        ...state,
        data: action.payload || null,
        isLoading: false,
        isError: false,
        error: null,
      };
    case USER_LOGIN_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        error: action.error || 'Login failed',
      };
    case RESET_USER_LOGIN:
      return INITIALSTATE;
    default:
      return state;
  }
}
