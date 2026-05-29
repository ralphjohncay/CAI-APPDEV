import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../app/reducers';

import AppIcon from '../components/AppIcon';
import CustomButton from '../components/CustomButton';
import {PRODUCT_DETAIL_POLL_INTERVAL_MS} from '../config/polling';
import {productImageUrl} from '../config/api';
import {isApiActive} from '../api/normalize';
import {fetchProduct} from '../services/catalog';
import type {Product} from '../api/types';
import {cartAdd} from '../app/actions';
import {cartLineFromProduct, formatPrice} from '../utils/cart';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

function productFingerprint(p: Product): string {
  return `${p.id}:${p.name}:${p.price}:${p.stock ?? ''}:${p.image ?? ''}:${p.description ?? ''}:${p.isActive}`;
}

const ProductDetailScreen = (): React.JSX.Element => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const productId = route.params?.productId as number;
  const catalogProduct = useSelector((state: RootState) =>
    state.products.items.find(p => p.id === productId),
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const fingerprintRef = useRef('');
  const initialLoadDoneRef = useRef(false);
  const removedHandledRef = useRef(false);

  const applyProduct = useCallback((next: Product | null) => {
    if (!next) {
      return;
    }
    const fp = productFingerprint(next);
    if (fp === fingerprintRef.current) {
      return;
    }
    fingerprintRef.current = fp;
    setProduct(next);
  }, []);

  const loadSilent = useCallback(async () => {
    try {
      const next = await fetchProduct(productId, true);
      if (!isApiActive(next)) {
        Alert.alert('Unavailable', 'This product is no longer available.');
        return;
      }
      applyProduct(next);
    } catch {
      // Keep last known product during background poll errors
    }
  }, [applyProduct, productId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchProduct(productId, true);
      if (!isApiActive(next)) {
        Alert.alert('Unavailable', 'This product is no longer available.');
        setProduct(null);
        return;
      }
      applyProduct(next);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Product not found');
      setProduct(null);
    } finally {
      setLoading(false);
      initialLoadDoneRef.current = true;
    }
  }, [applyProduct, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (catalogProduct) {
      applyProduct(catalogProduct);
    }
  }, [applyProduct, catalogProduct]);

  useEffect(() => {
    if (
      !initialLoadDoneRef.current ||
      removedHandledRef.current ||
      catalogProduct !== undefined
    ) {
      return;
    }
    removedHandledRef.current = true;
    Alert.alert('Unavailable', 'This product is no longer available.', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  }, [catalogProduct, navigation]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let inFlight = false;

      const tick = async () => {
        if (cancelled || inFlight || !initialLoadDoneRef.current) {
          return;
        }
        inFlight = true;
        try {
          await loadSilent();
        } finally {
          inFlight = false;
        }
      };

      void tick();
      const intervalId = setInterval(() => void tick(), PRODUCT_DETAIL_POLL_INTERVAL_MS);

      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    }, [loadSilent]),
  );

  const showInitialLoader = loading || !product;

  if (showInitialLoader) {
    return (
      <View style={[sharedStyles.screen, styles.loader]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const uri = productImageUrl(product.image ?? undefined);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {uri ? (
          <Image source={{uri}} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <AppIcon name="shoe" size={64} color={colors.accent} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        {product.stock != null && (
          <View
            style={[
              styles.stockBadge,
              product.stock > 0 ? styles.stockAvailable : styles.stockUnavailable,
            ]}>
            <AppIcon
              name={product.stock > 0 ? 'check' : 'close'}
              size={18}
              color={product.stock > 0 ? colors.success : colors.danger}
            />
            <Text style={styles.stockText}>
              {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
            </Text>
          </View>
        )}

        {product.description ? (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}

        <CustomButton
          label="Add to Cart"
          variant="accent"
          disabled={product.stock === 0}
          containerStyle={styles.addButton}
          onPress={() => {
            dispatch(cartAdd(cartLineFromProduct(product)));
            Alert.alert('Success', `${product.name} added to your cart.`);
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {justifyContent: 'center', alignItems: 'center'},
  container: {padding: 16, paddingBottom: 32},
  imageContainer: {marginBottom: 24, borderRadius: 16, overflow: 'hidden'},
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.backgroundAlt,
  },
  placeholder: {alignItems: 'center', justifyContent: 'center'},
  content: {marginBottom: 24},
  name: {fontSize: 24, fontWeight: '800', color: colors.heading, letterSpacing: -0.5},
  price: {fontSize: 28, color: colors.accent, fontWeight: '800', marginTop: 8},
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stockAvailable: {
    backgroundColor: colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  stockUnavailable: {
    backgroundColor: colors.danger + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  stockText: {fontSize: 12, fontWeight: '700', color: colors.heading},
  descriptionBox: {marginTop: 20, marginBottom: 24},
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {fontSize: 15, color: colors.text, marginTop: 8, lineHeight: 24},
  addButton: {marginBottom: 12},
});

export default ProductDetailScreen;
