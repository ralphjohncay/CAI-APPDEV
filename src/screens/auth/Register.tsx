import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {authRegister} from '../../app/actions';
import type {RootState} from '../../app/reducers';
import AppIcon from '../../components/AppIcon';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import {ROUTES} from '../../utils';
import {colors} from '../../theme/colors';

const Register = (): React.JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Registration Failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  useEffect(() => {
    if (!auth.isLoading && auth.registerMessage && !auth.isError && !auth.session) {
      Alert.alert('Registration Successful', auth.registerMessage, [
        {text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN)},
      ]);
    }
  }, [auth.isLoading, auth.registerMessage, auth.isError, auth.session, navigation]);

  const onRegister = (): void => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please enter name, email, and password.');
      return;
    }
    if (!accepted) {
      Alert.alert('Terms Required', 'You must accept the terms to register.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    
    dispatch(authRegister({name, email, password}));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Join RALPHS</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <View style={styles.formContainer}>
        <CustomTextInput
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          containerStyle={styles.inputContainer}
        />

        <CustomTextInput
          label="Email Address"
          placeholder="you@example.com"
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

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={() => setAccepted(!accepted)}
            style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted ? <AppIcon name="check" size={18} color={colors.white} /> : null}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I accept the terms and conditions
          </Text>
        </View>

        <CustomButton
          label={auth.isLoading ? 'Creating Account…' : 'Create Account'}
          disabled={auth.isLoading}
          variant="accent"
          containerStyle={styles.registerButton}
          onPress={onRegister}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
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
    paddingTop: 32,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.heading,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxText: {
    flex: 1,
    color: colors.text,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: colors.text,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Register;
