import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {colors} from '../theme/colors';

interface CustomButtonProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
}

const CustomButton = ({
  containerStyle,
  textStyle,
  label,
  onPress,
  disabled = false,
  variant = 'accent',
}: CustomButtonProps): React.JSX.Element => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'primary':
        return styles.primaryButton;
      default:
        return styles.accentButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'primary':
        return styles.primaryText;
      default:
        return styles.accentText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[getVariantStyle(), disabled && styles.disabled, containerStyle]}>
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  accentText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;
