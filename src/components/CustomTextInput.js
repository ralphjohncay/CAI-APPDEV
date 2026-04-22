import { Text, View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry = false, // optional for password fields
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
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
    color: '#374151', // soft dark color
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android shadow
  },
});

export default CustomTextInput;