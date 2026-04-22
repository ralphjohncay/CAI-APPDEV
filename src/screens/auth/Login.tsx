import React, {useEffect, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View, type TextStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {authLogin} from '../../app/actions';
import type {RootState} from '../../app/reducers';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import {IMG, ROUTES} from '../../utils';

const Login = (): React.JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Login failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  const inputStyle: TextStyle = {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
    fontWeight: '500',
    color: '#111827',
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image source={IMG.LOGO} style={{width: 220, height: 80, marginBottom: 30}} resizeMode="contain" />

      <View style={{width: '100%'}}>
        <CustomTextInput
          label="Email"
          placeholder="Enter Email"
          value={username}
          onChangeText={setUsername}
          containerStyle={{marginBottom: 15}}
          textStyle={inputStyle}
        />

        <CustomTextInput
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={{marginBottom: 20}}
          textStyle={inputStyle}
        />
      </View>

      <CustomButton
        label="LOGIN"
        containerStyle={{
          backgroundColor: '#1E3A8A',
          borderRadius: 12,
          width: '85%',
          marginVertical: 15,
        }}
        textStyle={{color: '#FFF', fontWeight: 'bold', fontSize: 16}}
        onPress={() => {
          if (!username || !password) {
            Alert.alert('Invalid Credentials', 'Please enter valid username and password');
            return;
          }
          dispatch(authLogin({username, password}));
        }}
      />

      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
        <Text style={{color: '#374151'}}>Create an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{color: '#10B981', marginLeft: 6, fontWeight: 'bold'}}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
