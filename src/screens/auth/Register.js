import React, { useState } from 'react';
import { Text, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../utils';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [accepted, setAccepted] = useState(false);

    const navigation = useNavigation();

    const onRegister = () => {
        if (!firstName || !lastName || !birthdate) {
            Alert.alert('Missing fields', 'Please fill First Name, Last Name and Birthdate');
            return;
        }
        if (!accepted) {
            Alert.alert('Terms', 'You must accept terms and conditions to register');
            return;
        }
        //Null
        Alert.alert('Success', 'Registration complete');
        navigation.navigate(ROUTES.LOGIN);
    };

    return (
        <ScrollView
        contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            backgroundColor: '#F8FAFC',
            justifyContent: 'center',
        }}
        >
        <View style={{ width: '100%' }}>
            {['First Name', 'Middle Name', 'Last Name', 'Birthdate'].map((label, idx) => (
            <CustomTextInput
                key={idx}
                label={label}
                placeholder={`Enter ${label}`}
                value={
                label === 'First Name'
                    ? firstName
                    : label === 'Middle Name'
                    ? middleName
                    : label === 'Last Name'
                    ? lastName
                    : birthdate
                }
                onChangeText={
                label === 'First Name'
                    ? setFirstName
                    : label === 'Middle Name'
                    ? setMiddleName
                    : label === 'Last Name'
                    ? setLastName
                    : setBirthdate
                }
                containerStyle={{ marginBottom: 15 }}
                textStyle={{
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: '#CBD5E1',
                backgroundColor: '#FFF',
                fontWeight: '500',
                color: '#111827',
                }}
            />
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
                onPress={() => setAccepted(!accepted)}
                style={{
                width: 24,
                height: 24,
                borderWidth: 1,
                borderColor: '#6B7280',
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accepted ? '#16A34A' : 'transparent',
                }}
            >
                {accepted && <Text style={{ color: '#FFF', fontSize: 16 }}>✓</Text>}
            </TouchableOpacity>
            <Text style={{ marginLeft: 10, color: '#374151', fontWeight: '500' }}>
                I accept the Terms and Conditions
            </Text>
            </View>

            <CustomButton
            label="REGISTER"
            containerStyle={{
                backgroundColor: '#16A34A',
                borderRadius: 12,
                width: '85%',
                alignSelf: 'center',
                paddingVertical: 10,
            }}
            textStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}
            onPress={onRegister}
            />
        </View>
        </ScrollView>
    );
};

export default Register;