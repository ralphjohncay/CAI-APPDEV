import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';
import type {RootState} from '../app/reducers';
import {authRestore} from '../app/actions';
import {colors} from '../theme/colors';

const AppNavigation = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = !!auth.session?.token;

  useEffect(() => {
    dispatch(authRestore());
  }, [dispatch]);

  if (auth.isRestoring) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return <NavigationContainer>{isLoggedIn ? <MainNav /> : <AuthNav />}</NavigationContainer>;
};

export default AppNavigation;
