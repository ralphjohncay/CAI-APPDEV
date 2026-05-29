import React, {useCallback, useEffect, useState} from 'react';
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import CustomButton from '../components/CustomButton';
import LoadingView from '../components/LoadingView';
import type {RootState} from '../app/reducers';
import {authLogout, authSetUser} from '../app/actions';
import {useRefreshOnFocus} from '../hooks/useRefreshOnFocus';
import LogoHeader from '../components/LogoHeader';
import {fetchCurrentUser, signOut} from '../services/auth';
import {colors} from '../theme/colors';
import {sharedStyles} from '../theme/styles';

const ProfileScreen = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.auth.session);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = session?.user;

  const refreshProfile = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const profile = await fetchCurrentUser();
      dispatch(authSetUser(profile));
    } catch (e) {
      Alert.alert('Profile', e instanceof Error ? e.message : 'Could not refresh profile');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useRefreshOnFocus(refreshProfile);

  if (!user) {
    return <LoadingView />;
  }

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshProfile} tintColor={colors.accent} />
      }>
      <View style={styles.header}>
        <LogoHeader size="hero" />
        <Text style={styles.brand}>My Profile</Text>
      </View>

      <View style={[sharedStyles.cardLarge, styles.infoCard]}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={[styles.label, {marginTop: 16}]}>Email Address</Text>
        <Text style={styles.value}>{user.email}</Text>

        {user.roles?.length ? (
          <>
            <Text style={[styles.label, {marginTop: 16}]}>Account Type</Text>
            <View style={styles.rolesContainer}>
              {user.roles.map((role, index) => (
                <View key={index} style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{role}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {user.isActive === false && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ Account Disabled</Text>
            <Text style={styles.warningSubtext}>Please contact support for assistance</Text>
          </View>
        )}
      </View>

      <CustomButton
        label="Sign Out"
        variant="primary"
        containerStyle={styles.signOutBtn}
        onPress={async () => {
          await signOut();
          dispatch(authLogout());
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {width: 80, height: 64, marginBottom: 12},
  brand: {fontSize: 24, fontWeight: '800', color: colors.heading, letterSpacing: -0.5},
  infoCard: {
    width: '100%',
    marginBottom: 20,
  },
  label: {fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600'},
  value: {fontSize: 18, color: colors.heading, fontWeight: '700', marginTop: 4},
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: colors.warning + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {fontSize: 14, fontWeight: '600', color: colors.warning},
  warningSubtext: {fontSize: 12, color: colors.muted, marginTop: 2},
  signOutBtn: {width: '100%', marginTop: 16},
});

export default ProfileScreen;
