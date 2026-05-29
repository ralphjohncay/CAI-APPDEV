import React from 'react';
import {Image, StyleSheet, View, Text} from 'react-native';
import {IMG} from '../utils';
import {colors} from '../theme/colors';

interface LogoHeaderProps {
  showTagline?: boolean;
  size?: 'header' | 'hero';
}

const SIZES = {
  header: {logo: {width: 120, height: 44}, tagline: 11},
  hero: {logo: {width: 200, height: 72}, tagline: 13},
};

const LogoHeader = ({
  showTagline = false,
  size = 'header',
}: LogoHeaderProps): React.JSX.Element => {
  const dim = SIZES[size];

  return (
    <View style={[styles.container, size === 'hero' && styles.hero]}>
      <Image source={IMG.LOGO} style={[styles.logo, dim.logo]} resizeMode="contain" />
      {showTagline ? (
        <Text style={[styles.tagline, {fontSize: dim.tagline}]}>Quality shoes & services</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingVertical: 8,
  },
  logo: {},
  tagline: {
    color: colors.accentLight,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default LogoHeader;
