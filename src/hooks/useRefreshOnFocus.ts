import {useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';

/**
 * Reload live API data whenever the screen is opened (picks up admin website changes).
 */
export function useRefreshOnFocus(reload: (isRefresh: boolean) => void | Promise<void>): void {
  const isFirst = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }
      void reload(true);
    }, [reload]),
  );
}
