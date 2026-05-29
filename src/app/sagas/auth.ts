import {call, put, takeLatest} from 'redux-saga/effects';
import {
  AUTH_RESTORE,
  AUTH_RESTORE_COMPLETE,
  AUTH_RESTORE_ERROR,
  USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_REGISTER,
  USER_REGISTER_COMPLETE,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  type AuthSession,
  type UserLoginAction,
  type UserRegisterAction,
} from '../actions';
import {normalizeApiUser} from '../../api/auth';
import * as authService from '../../services/auth';

function* sessionFromLogin(
  token: string,
  user: import('../../api/types').ApiUser,
): Generator {
  try {
    const fresh = yield call(authService.fetchCurrentUser);
    return {token, user: fresh} as AuthSession;
  } catch {
    return {token, user} as AuthSession;
  }
}

export function* userLoginAsync(action: UserLoginAction): Generator {
  try {
    yield put({type: USER_LOGIN_REQUEST});
    const {token, user} = yield call(
      authService.login,
      action.payload.email,
      action.payload.password,
    );
    const session = yield call(sessionFromLogin, token, user);
    yield put({type: USER_LOGIN_COMPLETE, payload: session});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    yield put({type: USER_LOGIN_ERROR, error: message});
  }
}

export function* userRegisterAsync(action: UserRegisterAction): Generator {
  try {
    yield put({type: USER_REGISTER_REQUEST});
    const result = yield call(authService.register, action.payload);

    if (result.success === false) {
      throw new Error(result.message || 'Registration failed');
    }

    let session: AuthSession | null = null;
    let message = result.message || 'Registration successful.';

    try {
      const {token, user} = yield call(
        authService.login,
        action.payload.email,
        action.payload.password,
      );
      session = yield call(sessionFromLogin, token, user);
      message = 'Welcome to RALPHS Footwear — you are signed in.';
    } catch {
      const registeredUser = normalizeApiUser(result.user);
      if (registeredUser) {
        message += ' You can sign in now.';
      }
    }

    yield put({
      type: USER_REGISTER_COMPLETE,
      payload: {message, session},
    });
  } catch (error) {
    let message = 'Registration failed';
    if (error instanceof Error) {
      message = error.message;
      if (message.includes('already') || message.includes('409')) {
        message += '\n\nTry a different email address.';
      }
    }
    yield put({type: USER_REGISTER_ERROR, error: message});
  }
}

export function* authRestoreAsync(): Generator {
  try {
    const token = yield call(authService.getStoredToken);
    if (!token) {
      yield put({type: AUTH_RESTORE_COMPLETE, payload: null});
      return;
    }
    const user = yield call(authService.fetchCurrentUser);
    yield put({type: AUTH_RESTORE_COMPLETE, payload: {token, user}});
  } catch {
    yield call(authService.signOut);
    yield put({type: AUTH_RESTORE_ERROR});
  }
}

export function* watchAuth(): Generator {
  yield takeLatest(USER_LOGIN, userLoginAsync);
  yield takeLatest(USER_REGISTER, userRegisterAsync);
  yield takeLatest(AUTH_RESTORE, authRestoreAsync);
}
