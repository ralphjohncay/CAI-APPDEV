import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';

export type AppIconName =
  | 'home'
  | 'cart'
  | 'orders'
  | 'services'
  | 'profile'
  | 'shoe'
  | 'check'
  | 'close'
  | 'add'
  | 'remove'
  | 'refresh'
  | 'chevron-back';

/** Ionicons glyph names (Ionicons.ttf must be linked in native projects). */
const ICONS: Record<AppIconName, string> = {
  home: 'home-outline',
  cart: 'cart-outline',
  orders: 'receipt-outline',
  services: 'construct-outline',
  profile: 'person-outline',
  shoe: 'footsteps-outline',
  check: 'checkmark-circle',
  close: 'close-circle',
  add: 'add',
  remove: 'remove',
  refresh: 'refresh',
  'chevron-back': 'chevron-back',
};

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

const AppIcon = ({
  name,
  size = 22,
  color = colors.accent,
}: AppIconProps): React.JSX.Element => {
  return <Ionicons name={ICONS[name]} size={size} color={color} />;
};

export default AppIcon;
