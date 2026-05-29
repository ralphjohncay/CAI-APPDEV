import React, {useEffect} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import NotificationBar from './src/components/NotificationBar';
import AppNav from './src/navigations';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import {setUnauthorizedHandler} from './src/api/client';
import {authLogout} from './src/app/actions';
import {signOut} from './src/services/auth';

const {store, persistor, runSaga} = configureStore();
runSaga(rootSaga);

const UnauthorizedBridge = (): null => {
  const dispatch = useDispatch();
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut().finally(() => dispatch(authLogout()));
    });
    return () => setUnauthorizedHandler(null);
  }, [dispatch]);
  return null;
};

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <UnauthorizedBridge />
          <View style={{flex: 1}}>
            <NotificationBar />
            <AppNav />
          </View>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
