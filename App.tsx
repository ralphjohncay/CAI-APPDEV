import React from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import AppNav from './src/navigations';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';

const {store, persistor, runSaga} = configureStore();
runSaga(rootSaga);

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={{flex: 1}}>
          <AppNav />
        </View>
      </PersistGate>
    </Provider>
  );
};

export default App;
