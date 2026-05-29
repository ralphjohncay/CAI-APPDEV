import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {authLogin} from '../../app/actions';
import type {RootState} from '../../app/reducers';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import LogoHeader from '../../components/LogoHeader';
import {ROUTES} from '../../utils';
import {colors} from '../../theme/colors';

const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Login failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LogoHeader size="hero" showTagline />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Sign in to your account</Text>

        <CustomTextInput
          label="Email Address"
          placeholder="customer@shoes.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.inputContainer}
        />

        <CustomTextInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.inputContainer}
        />

        <CustomButton
          label={auth.isLoading ? 'Signing in…' : 'Sign In'}
          disabled={auth.isLoading}
          variant="accent"
          containerStyle={styles.button}
          onPress={() => {
            if (!email || !password) {
              Alert.alert('Missing Fields', 'Please enter your email and password.');
              return;
            }
            dispatch(authLogin({email, password}));
          }}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <CustomButton
          label="Create New Account"
          variant="secondary"
          containerStyle={styles.button}
          onPress={() => navigation.navigate(ROUTES.REGISTER)}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Demo Credentials:</Text>
        <Text style={styles.footerCode}>customer@shoes.com / customer123</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginHorizontal: -20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.navbar,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.heading,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerCode: {
    fontSize: 11,
    fontFamily: 'Courier New',
    color: colors.heading,
    fontWeight: '500',
  },
});

export default Login;
