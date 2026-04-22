import React from 'react';
import {StyleSheet, Text, type TextStyle, View, type ViewStyle} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';

interface CustomTextInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
}

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry = false,
}: CustomTextInputProps): React.JSX.Element => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, textStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CustomTextInput;
