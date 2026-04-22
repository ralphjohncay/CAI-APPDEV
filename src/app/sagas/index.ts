import {all} from 'redux-saga/effects';
import {userLogin} from './auth';

export default function* rootSaga(): Generator {
  yield all([
    // AUTH/Login
    userLogin(),
  ]);
}
