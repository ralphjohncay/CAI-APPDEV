import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import AppIcon from '../components/AppIcon';
import CustomButton from '../components/CustomButton';
import type {RootState} from '../app/reducers';
import {cartClear} from '../app/actions';
import {cartTotal} from '../app/reducers/cart';
import {ensureValidSession} from '../services/auth';
import {createOrder} from '../services/orders';
import {formatPrice} from '../utils/cart';
import {ROUTES} from '../utils';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

const CheckoutScreen = (): React.JSX.Element => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.session?.user);
  const [submitting, setSubmitting] = useState(false);
  const total = cartTotal(items);

  const onPlaceOrder = async (): Promise<void> => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checkout.');
      return;
    }
    setSubmitting(true);
    try {
      await ensureValidSession();
      await createOrder(items);
      dispatch(cartClear());
      Alert.alert(
        'Order Submitted Successfully',
        'Your order is pending approval. You can view it in the Orders section.',
        [{text: 'View Orders', onPress: () => navigation.navigate(ROUTES.ORDERS)}],
      );
      navigation.navigate(ROUTES.ORDERS);
    } catch (e) {
      Alert.alert('Checkout Failed', e instanceof Error ? e.message : 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={sharedStyles.heading2}>Order Summary</Text>
        <Text style={sharedStyles.subheading}>Review your items before placing order</Text>
      </View>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Shipping to:</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Items</Text>
        {items.map(line => (
          <View key={line.key} style={styles.itemRow}>
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>{line.name}</Text>
              <View style={styles.itemMetaRow}>
                <AppIcon
                  name={line.type === 'product' ? 'shoe' : 'services'}
                  size={14}
                  color={colors.muted}
                />
                <Text style={styles.itemMeta}>× {line.quantity}</Text>
              </View>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(Number(line.price) * line.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping:</Text>
          <Text style={styles.totalValue}>Free</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.finalLabel}>Total:</Text>
          <Text style={styles.finalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      <CustomButton
        label={submitting ? 'Placing Order…' : 'Place Order'}
        variant="accent"
        disabled={submitting}
        containerStyle={styles.placeButton}
        onPress={onPlaceOrder}
      />

      <CustomButton
        label="Continue Shopping"
        variant="secondary"
        containerStyle={styles.continueButton}
        onPress={() => navigation.navigate(ROUTES.HOME)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 32},
  header: {marginBottom: 20},
  userInfo: {backgroundColor: colors.backgroundAlt, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border},
  userLabel: {fontSize: 11, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4},
  userName: {fontSize: 16, fontWeight: '700', color: colors.heading, marginTop: 4},
  userEmail: {fontSize: 13, color: colors.muted, marginTop: 2},
  itemsSection: {marginBottom: 20},
  sectionTitle: {fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12},
  itemRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border},
  itemName: {fontSize: 14, fontWeight: '700', color: colors.heading},
  itemMetaRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  itemMeta: {fontSize: 12, color: colors.muted},
  itemPrice: {fontSize: 14, fontWeight: '800', color: colors.accent},
  totalsSection: {backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border},
  totalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8},
  totalLabel: {fontSize: 13, color: colors.text, fontWeight: '500'},
  totalValue: {fontSize: 14, color: colors.heading, fontWeight: '700'},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 12},
  finalLabel: {fontSize: 16, fontWeight: '800', color: colors.heading},
  finalValue: {fontSize: 20, fontWeight: '800', color: colors.accent},
  placeButton: {marginBottom: 12},
  continueButton: {marginTop: 0},
});

export default CheckoutScreen;
