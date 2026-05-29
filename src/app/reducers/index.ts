import AsyncStorage from '@react-native-async-storage/async-storage';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import type {Persistor} from 'redux-persist';
import createSagaMiddleware, {type Saga, type Task} from 'redux-saga';

import auth from './auth';
import type {AuthState} from './auth';
import cart from './cart';
import type {CartState} from './cart';
import products from './products';
import type {ProductsState} from './products';

const sagaMiddleware = createSagaMiddleware();
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth', 'products'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isLoading', 'isRestoring', 'isError', 'error', 'registerMessage'],
};

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, auth),
  cart: persistReducer(cartPersistConfig, cart),
  products,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer as any);

export interface RootState {
  auth: AuthState;
  cart: CartState;
  products: ProductsState;
}

interface ConfiguredStore {
  store: ReturnType<typeof createStore>;
  persistor: Persistor;
  runSaga: (saga: Saga) => Task;
}

export default (): ConfiguredStore => {
  const store = createStore(persistedReducer as any, applyMiddleware(sagaMiddleware));
  const persistor = persistStore(store);
  const runSaga = sagaMiddleware.run;

  return {store, persistor, runSaga};
};
