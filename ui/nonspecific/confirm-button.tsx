import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from 'react-native';

interface ConfirmButtonProps {
  label: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmButton({
  label,
  onConfirm,
  onCancel,
}: ConfirmButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClose = () => {
    onConfirm ? onConfirm() : onCancel;
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.cancelButton,
          { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' },
        ]}
        onPress={handleClose}
      >
        <Text
          style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#666' }]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  addButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
