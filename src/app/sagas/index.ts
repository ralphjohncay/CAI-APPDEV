import {all, fork} from 'redux-saga/effects';

import {watchAuth} from './auth';
import {watchProducts} from './products';

export default function* rootSaga(): Generator {
  yield all([fork(watchAuth), fork(watchProducts)]);
}
