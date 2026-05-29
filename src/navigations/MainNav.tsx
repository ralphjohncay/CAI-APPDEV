import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useProductsPolling} from '../hooks/useProductsPolling';
import {ROUTES} from '../utils';
import {colors} from '../theme/colors';
import LogoHeader from '../components/LogoHeader';

import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ServicesScreen from '../screens/ServicesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.navbar,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 140, 0, 0.25)',
  },
  headerTintColor: colors.accent,
  headerTitle: () => <LogoHeader size="header" />,
  headerTitleAlign: 'center' as const,
  headerBackTitleVisible: false,
};

const MainNavigation = (): React.JSX.Element => {
  useProductsPolling();

  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME} screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name={ROUTES.PRODUCT_DETAIL} component={ProductDetailScreen} />
      <Stack.Screen name={ROUTES.SERVICES} component={ServicesScreen} />
      <Stack.Screen name={ROUTES.CART} component={CartScreen} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={CheckoutScreen} />
      <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
