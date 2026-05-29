import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import AppIcon, {type AppIconName} from '../components/AppIcon';
import LogoHeader from '../components/LogoHeader';
import ProductCard from '../components/ProductCard';
import {productsFetch} from '../app/actions';
import type {RootState} from '../app/reducers';
import {ROUTES} from '../utils';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

const QUICK_LINKS: {label: string; route: string; icon: AppIconName}[] = [
  {label: 'Services', route: ROUTES.SERVICES, icon: 'services'},
  {label: 'Cart', route: ROUTES.CART, icon: 'cart'},
  {label: 'Orders', route: ROUTES.ORDERS, icon: 'orders'},
  {label: 'Profile', route: ROUTES.PROFILE, icon: 'profile'},
];

const HomeScreen = (): React.JSX.Element => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const {items: products, isLoading, isRefreshing, error} = useSelector(
    (state: RootState) => state.products,
  );

  const showInitialLoader = isLoading && !isRefreshing;

  return (
    <View style={sharedStyles.screen}>
      <View style={styles.header}>
        <LogoHeader size="hero" showTagline />
      </View>

      <View style={styles.quickNav}>
        {QUICK_LINKS.map(link => (
          <TouchableOpacity
            key={link.route}
            style={styles.navButton}
            onPress={() => navigation.navigate(link.route)}
            activeOpacity={0.7}>
            <View style={styles.navIconWrap}>
              <AppIcon name={link.icon} size={22} color={colors.accent} />
            </View>
            <Text style={styles.navButtonText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop</Text>
        <Text style={styles.sectionSub}>Quality shoes & services</Text>
      </View>

      {showInitialLoader ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.listContainer}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => dispatch(productsFetch({refresh: true}))}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="shoe" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No products available</Text>
              <Text style={styles.emptySubtext}>Pull to refresh</Text>
            </View>
          }
          renderItem={({item}) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate(ROUTES.PRODUCT_DETAIL, {productId: item.id})
              }
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navbar,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  quickNav: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    backgroundColor: colors.backgroundAlt,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  navButtonText: {color: colors.heading, fontWeight: '600', fontSize: 11},
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.heading,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {paddingHorizontal: 4, paddingBottom: 24},
  listContainer: {gap: 8},
  error: {color: colors.danger, textAlign: 'center', padding: 12, fontWeight: '500'},
  emptyContainer: {alignItems: 'center', paddingVertical: 40, gap: 8},
  emptyText: {fontSize: 16, fontWeight: '600', color: colors.heading},
  emptySubtext: {fontSize: 13, color: colors.muted},
});

export default HomeScreen;
