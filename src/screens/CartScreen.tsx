import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import AppIcon from '../components/AppIcon';
import CustomButton from '../components/CustomButton';
import type {RootState} from '../app/reducers';
import {cartRemove, cartUpdateQty} from '../app/actions';
import {cartTotal} from '../app/reducers/cart';
import {ROUTES, formatPrice} from '../utils';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

const CartScreen = (): React.JSX.Element => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const total = cartTotal(items);

  return (
    <View style={sharedStyles.screen}>
      <FlatList
        data={items}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppIcon name="cart" size={56} color={colors.muted} />
            <Text style={styles.emptyTitle}>Cart is Empty</Text>
            <Text style={styles.emptyText}>Browse the shop to add items</Text>
          </View>
        }
        renderItem={({item}) => (
          <View style={sharedStyles.card}>
            <View style={styles.itemHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <AppIcon
                    name={item.type === 'product' ? 'shoe' : 'services'}
                    size={14}
                    color={colors.muted}
                  />
                  <Text style={styles.meta}>
                    {item.type === 'product' ? 'Product' : 'Service'} · {formatPrice(item.price)} each
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.qtyRow}>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    dispatch(cartUpdateQty(item.key, Math.max(1, item.quantity - 1)))
                  }>
                  <AppIcon name="remove" size={18} color={colors.heading} />
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => dispatch(cartUpdateQty(item.key, item.quantity + 1))}>
                  <AppIcon name="add" size={18} color={colors.heading} />
                </TouchableOpacity>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.lineTotal}>
                  {formatPrice(Number(item.price) * item.quantity)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => dispatch(cartRemove(item.key))}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <AppIcon name="close" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {items.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
          </View>
          <CustomButton
            label="Proceed to Checkout"
            variant="accent"
            containerStyle={{marginTop: 12}}
            onPress={() => navigation.navigate(ROUTES.CHECKOUT)}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {padding: 16, flexGrow: 1},
  emptyContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.heading, marginTop: 12, marginBottom: 4},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  emptyText: {fontSize: 14, color: colors.muted},
  itemHeader: {flexDirection: 'row', marginBottom: 12},
  name: {fontSize: 16, fontWeight: '700', color: colors.heading},
  meta: {fontSize: 12, color: colors.muted, marginTop: 4},
  qtyRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  qtyControl: {flexDirection: 'row', alignItems: 'center', gap: 8},
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qty: {fontSize: 14, fontWeight: '700', color: colors.heading, minWidth: 24, textAlign: 'center'},
  lineTotal: {fontSize: 16, fontWeight: '800', color: colors.accent, textAlign: 'right'},
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  totalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  totalLabel: {fontSize: 16, fontWeight: '600', color: colors.heading},
  totalAmount: {fontSize: 20, fontWeight: '800', color: colors.accent},
});

export default CartScreen;
