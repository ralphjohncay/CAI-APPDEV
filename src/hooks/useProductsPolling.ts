import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {productsFetch, productsPollingStart, productsPollingStop} from '../app/actions';

/**
 * Keeps the Redux product catalog in sync with admin changes while the user is in the main app.
 */
export function useProductsPolling(): void {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(productsFetch());
    dispatch(productsPollingStart());

    return () => {
      dispatch(productsPollingStop());
    };
  }, [dispatch]);
}
