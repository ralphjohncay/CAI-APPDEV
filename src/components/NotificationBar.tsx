import React, {useState} from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AppIcon, {type AppIconName} from './AppIcon';
import {useNotifications} from '../hooks/useNotifications';
import type {AppNotification, NotificationType} from '../api/types';
import {colors} from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TYPE_STYLES: Record<
  NotificationType,
  {bg: string; border: string; icon: AppIconName}
> = {
  info: {bg: '#e8f4fc', border: colors.info, icon: 'orders'},
  success: {bg: '#e8f5e9', border: colors.success, icon: 'check'},
  warning: {bg: '#fff5e6', border: colors.warning, icon: 'services'},
  danger: {bg: '#fdecea', border: colors.danger, icon: 'close'},
};

const NotificationCard = ({
  item,
  expanded,
  onToggle,
  onDismiss,
}: {
  item: AppNotification;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}): React.JSX.Element => {
  const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.info;
  const longMessage = item.message.length > 72;

  return (
    <View style={[styles.card, {backgroundColor: style.bg, borderLeftColor: style.border}]}>
      <Pressable style={styles.cardBody} onPress={onToggle}>
        <View style={styles.iconWrap}>
          <AppIcon name={style.icon} size={20} color={style.border} />
        </View>
        <View style={styles.textWrap}>
          {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
          <Text style={styles.message} numberOfLines={expanded ? undefined : 2}>
            {item.message}
          </Text>
          {longMessage && !expanded ? (
            <Text style={styles.tapHint}>Tap to read more</Text>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        style={styles.dismissBtn}
        onPress={onDismiss}
        accessibilityLabel="Dismiss notification"
        hitSlop={8}>
        <AppIcon name="close" size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
};

const NotificationBar = (): React.JSX.Element | null => {
  const insets = useSafeAreaInsets();
  const {visible, dismiss} = useNotifications();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (visible.length === 0) {
    return null;
  }

  const toggleExpand = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <View style={[styles.wrap, {paddingTop: insets.top > 0 ? 4 : 8}]}>
      {visible.map(item => (
        <NotificationCard
          key={item.dismissKey}
          item={item}
          expanded={expandedKey === item.dismissKey}
          onToggle={() => toggleExpand(item.dismissKey)}
          onDismiss={() => dismiss(item.dismissKey)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.navbar,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 140, 0, 0.35)',
    gap: 6,
    zIndex: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 4,
  },
  iconWrap: {
    marginRight: 10,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.heading,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  tapHint: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  dismissBtn: {
    padding: 10,
    justifyContent: 'center',
  },
});

export default NotificationBar;
