// ui/nonspecific/confirm-button.tsx
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

interface ConfirmButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'confirm' | 'cancel';
  disabled?: boolean;
}

export default function ConfirmButton({ 
  label, 
  onPress, 
  variant = 'confirm',
  disabled = false 
}: ConfirmButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getBackgroundColor = () => {
    if (disabled) return isDark ? '#2C2C2E' : '#E0E0E0';
    if (variant === 'confirm') return isDark ? '#0A84FF' : '#4A6FA5';
    return isDark ? '#2C2C2E' : '#F0F0F0';
  };

  const getTextColor = () => {
    if (disabled) return isDark ? '#666' : '#999';
    if (variant === 'confirm') return '#FFFFFF';
    return isDark ? '#FFFFFF' : '#666';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});