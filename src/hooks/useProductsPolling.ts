import {useEffect} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {useDispatch} from 'react-redux';

import {productsFetch, productsPollingStart, productsPollingStop} from '../app/actions';

/**
 * Keeps the Redux product catalog in sync with admin add/update/remove (no manual refresh).
 */
export function useProductsPolling(): void {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(productsFetch());
    dispatch(productsPollingStart());

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        dispatch(productsFetch({refresh: true, silent: true}));
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      sub.remove();
      dispatch(productsPollingStop());
    };
  }, [dispatch]);
}
