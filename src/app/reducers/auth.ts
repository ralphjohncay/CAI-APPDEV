import {
  AUTH_RESTORE,
  AUTH_RESTORE_COMPLETE,
  AUTH_RESTORE_ERROR,
  AUTH_SET_USER,
  RESET_USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_REGISTER_COMPLETE,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  type AuthSession,
} from '../actions';
import type {ApiUser} from '../../api/types';

export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isRestoring: boolean;
  isError: boolean;
  error: string | null;
  registerMessage: string | null;
}

interface LoginRequestAction {
  type: typeof USER_LOGIN_REQUEST;
}

interface LoginCompleteAction {
  type: typeof USER_LOGIN_COMPLETE;
  payload: AuthSession;
}

interface LoginErrorAction {
  type: typeof USER_LOGIN_ERROR;
  error: string;
}

interface RegisterRequestAction {
  type: typeof USER_REGISTER_REQUEST;
}

interface RegisterCompleteAction {
  type: typeof USER_REGISTER_COMPLETE;
  payload?: {message?: string; session?: AuthSession | null};
}

interface RegisterErrorAction {
  type: typeof USER_REGISTER_ERROR;
  error: string;
}

interface RestoreAction {
  type: typeof AUTH_RESTORE;
}

interface RestoreCompleteAction {
  type: typeof AUTH_RESTORE_COMPLETE;
  payload: AuthSession | null;
}

interface RestoreErrorAction {
  type: typeof AUTH_RESTORE_ERROR;
}

interface SetUserAction {
  type: typeof AUTH_SET_USER;
  payload: ApiUser;
}

interface ResetAction {
  type: typeof RESET_USER_LOGIN;
}

type AuthAction =
  | LoginRequestAction
  | LoginCompleteAction
  | LoginErrorAction
  | RegisterRequestAction
  | RegisterCompleteAction
  | RegisterErrorAction
  | RestoreAction
  | RestoreCompleteAction
  | RestoreErrorAction
  | SetUserAction
  | ResetAction;

const INITIALSTATE: AuthState = {
  session: null,
  isLoading: false,
  isRestoring: true,
  isError: false,
  error: null,
  registerMessage: null,
};

export default function reducer(
  state: AuthState = INITIALSTATE,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        isError: false,
        error: null,
        registerMessage: null,
      };
    case USER_LOGIN_COMPLETE:
      return {
        ...state,
        session: action.payload,
        isLoading: false,
        isRestoring: false,
        isError: false,
        error: null,
      };
    case USER_REGISTER_COMPLETE:
      return {
        ...state,
        session: action.payload?.session ?? state.session,
        isLoading: false,
        isError: false,
        error: null,
        registerMessage: action.payload?.message ?? 'Registration successful.',
      };
    case USER_LOGIN_ERROR:
    case USER_REGISTER_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.error,
      };
    case AUTH_RESTORE:
      return {...state, isRestoring: true};
    case AUTH_RESTORE_COMPLETE:
      return {
        ...state,
        session: action.payload,
        isRestoring: false,
        isLoading: false,
      };
    case AUTH_RESTORE_ERROR:
      return {
        ...state,
        session: null,
        isRestoring: false,
        isLoading: false,
      };
    case AUTH_SET_USER:
      if (!state.session) {
        return state;
      }
      return {
        ...state,
        session: {...state.session, user: action.payload},
      };
    case RESET_USER_LOGIN:
      return {...INITIALSTATE, isRestoring: false};
    default:
      return state;
  }
}
