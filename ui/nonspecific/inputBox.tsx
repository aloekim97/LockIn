import {
  View,
  Text,
  TextInput,
  useColorScheme,
  StyleSheet,
} from 'react-native';

interface InputBoxProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function InputBox({
  label,
  value,
  onChangeText,
  placeholder = '',
  autoFocus = false,
  multiline = false,
  numberOfLines = 1,
}: InputBoxProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View>
      <Text style={[styles.label, { color: isDark ? '#AAAAAA' : '#666666' }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
            color: isDark ? '#FFFFFF' : '#000000',
            borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#8E8E93' : '#999'}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
});
