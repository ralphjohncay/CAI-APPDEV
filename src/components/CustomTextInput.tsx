import React from 'react';
import {StyleSheet, Text, type TextStyle, View, type ViewStyle} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {colors} from '../theme/colors';

interface CustomTextInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  editable?: boolean;
}

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry = false,
  autoCapitalize,
  keyboardType,
  editable = true,
}: CustomTextInputProps): React.JSX.Element => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholderTextColor={colors.muted}
        editable={editable}
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
    color: colors.heading,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default CustomTextInput;
