import {call, put, takeLatest} from 'redux-saga/effects';
import {
  USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  type LoginPayload,
} from '../actions';
import {userLogin as userLoginApi} from '../api/auth';

interface UserLoginAction {
  type: typeof USER_LOGIN;
  payload: LoginPayload;
}

export function* userLoginAsync(action: UserLoginAction): Generator {
  console.log('User login saga started: ', action);

  try {
    yield put({type: USER_LOGIN_REQUEST});

    const data = yield call(userLoginApi, action.payload);

    yield put({
      type: USER_LOGIN_COMPLETE,
      payload: data,
    });
  } catch (error) {
    console.log('User login saga error: ', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    yield put({
      type: USER_LOGIN_ERROR,
      error: message,
    });
  }
}

export function* userLogin(): Generator {
  yield takeLatest(USER_LOGIN, userLoginAsync);
}
