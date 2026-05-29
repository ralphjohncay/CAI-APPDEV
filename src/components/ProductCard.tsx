import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AppIcon from './AppIcon';
import {productImageUrl} from '../config/api';
import type {Product} from '../api/types';
import {colors} from '../theme/colors';
import {formatPrice} from '../utils/cart';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard = ({product, onPress}: ProductCardProps): React.JSX.Element => {
  const uri = productImageUrl(product.image ?? undefined);
  const isOutOfStock = product.stock === 0;

  return (
    <TouchableOpacity
      style={[styles.card, isOutOfStock && styles.cardDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isOutOfStock}>
      <View style={styles.imageContainer}>
        {uri ? (
          <Image source={{uri}} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <AppIcon name="shoe" size={40} color={colors.accent} />
          </View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {product.stock != null && product.stock > 0 ? (
          <Text style={styles.stock}>Stock: {product.stock}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    maxWidth: '48%',
    shadowColor: colors.cardShadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: colors.backgroundAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.heading,
    minHeight: 32,
    lineHeight: 16,
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  stock: {
    marginTop: 4,
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
});

export default ProductCard;
