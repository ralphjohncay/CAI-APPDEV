import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ROUTES} from '../utils';
import {colors} from '../theme/colors';
import LogoHeader from '../components/LogoHeader';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

const Stack = createStackNavigator();

const AuthNavigation = (): React.JSX.Element => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={Register}
        options={{
          headerStyle: {
            backgroundColor: colors.navbar,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 140, 0, 0.25)',
          },
          headerTintColor: colors.accent,
          headerTitle: () => <LogoHeader size="header" />,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
