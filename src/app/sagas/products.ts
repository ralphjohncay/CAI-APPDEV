import {call, cancel, delay, fork, put, take, takeLatest} from 'redux-saga/effects';
import type {Task} from 'redux-saga';

import {
  PRODUCTS_FETCH,
  PRODUCTS_FETCH_ERROR,
  PRODUCTS_FETCH_REQUEST,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_POLLING_START,
  PRODUCTS_POLLING_STOP,
  type ProductsFetchAction,
} from '../actions';
import {PRODUCTS_POLL_INTERVAL_MS} from '../../config/polling';
import {fetchProducts} from '../../services/catalog';

function* fetchProductsAsync(action: ProductsFetchAction): Generator {
  const refresh = action.payload?.refresh ?? false;
  const silent = action.payload?.silent ?? false;

  try {
    if (!silent) {
      yield put({
        type: PRODUCTS_FETCH_REQUEST,
        payload: {refresh},
      });
    }
    const items = yield call(fetchProducts, refresh || silent);
    yield put({type: PRODUCTS_FETCH_SUCCESS, payload: items});
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not load products';
    yield put({
      type: PRODUCTS_FETCH_ERROR,
      error: message,
      meta: {silent},
    });
  }
}

function* pollProductsLoop(): Generator {
  while (true) {
    yield delay(PRODUCTS_POLL_INTERVAL_MS);
    yield put({
      type: PRODUCTS_FETCH,
      payload: {refresh: true, silent: true},
    });
  }
}

function* watchProductsPolling(): Generator {
  let pollTask: Task | null = null;

  while (true) {
    yield take(PRODUCTS_POLLING_START);
    if (pollTask) {
      yield cancel(pollTask);
    }
    pollTask = yield fork(pollProductsLoop);

    yield take(PRODUCTS_POLLING_STOP);
    if (pollTask) {
      yield cancel(pollTask);
      pollTask = null;
    }
  }
}

export function* watchProducts(): Generator {
  yield takeLatest(PRODUCTS_FETCH, fetchProductsAsync);
  yield fork(watchProductsPolling);
}
