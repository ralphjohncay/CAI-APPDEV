import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';

import CustomButton from '../components/CustomButton';
import AppIcon from '../components/AppIcon';
import LoadingView from '../components/LoadingView';
import {useRefreshOnFocus} from '../hooks/useRefreshOnFocus';
import {fetchServices} from '../services/catalog';
import type {Service} from '../api/types';
import {cartAdd} from '../app/actions';
import {cartLineFromService, formatPrice} from '../utils/cart';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

const ServicesScreen = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      setServices(await fetchServices(isRefresh));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRefreshOnFocus(load);

  if (loading && !refreshing) {
    return <LoadingView />;
  }

  return (
    <View style={sharedStyles.screen}>
      <FlatList
        data={services}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={sharedStyles.heading2}>Our Services</Text>
            <Text style={sharedStyles.subheading}>Professional shoe care & customization</Text>
          </View>
        }
        renderItem={({item}) => (
          <View style={sharedStyles.card}>
            <View style={styles.iconRow}>
              <AppIcon name="services" size={22} color={colors.accent} />
              <Text style={styles.name}>{item.name}</Text>
            </View>
            {item.description ? (
              <Text style={styles.desc}>{item.description}</Text>
            ) : null}
            <View style={styles.footer}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <CustomButton
                label="Add"
                variant="accent"
                containerStyle={styles.addBtn}
                onPress={() => {
                  dispatch(cartAdd(cartLineFromService(item)));
                  Alert.alert('Added', `${item.name} added to your cart.`);
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppIcon name="services" size={48} color={colors.muted} />
            <Text style={styles.emptyText}>No services available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {padding: 16},
  header: {marginBottom: 16},
  iconRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  name: {fontSize: 17, fontWeight: '800', color: colors.heading, flex: 1},
  desc: {fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 20},
  footer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12},
  price: {fontSize: 18, fontWeight: '800', color: colors.accent},
  addBtn: {paddingHorizontal: 16, paddingVertical: 10},
  emptyContainer: {alignItems: 'center', justifyContent: 'center', paddingVertical: 48},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {fontSize: 16, fontWeight: '600', color: colors.muted},
});

export default ServicesScreen;
