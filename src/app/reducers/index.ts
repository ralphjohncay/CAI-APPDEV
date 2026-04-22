import AsyncStorage from '@react-native-async-storage/async-storage';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import type {Persistor} from 'redux-persist';
import createSagaMiddleware, {type Saga, type Task} from 'redux-saga';

import auth from './auth';
import type {AuthState} from './auth';

const sagaMiddleware = createSagaMiddleware();
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: [],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, auth),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer as any);

export interface RootState {
  auth: AuthState;
}

interface ConfiguredStore {
  store: any;
  persistor: Persistor;
  runSaga: (saga: Saga) => Task;
}

export default (): ConfiguredStore => {
  const store = createStore(persistedReducer as any, applyMiddleware(sagaMiddleware));
  const persistor = persistStore(store);
  const runSaga = sagaMiddleware.run;

  return {store, persistor, runSaga};
};
