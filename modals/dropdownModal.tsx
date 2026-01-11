// modals/dropdownModal.tsx
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';

interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (option: string) => void;
  anchorPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  title?: string;
}

export default function DropdownModal({
  visible,
  onClose,
  options,
  onSelect,
  anchorPosition,
  title,
}: DropdownModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate dropdown position
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const dropdownWidth = 180;
  const itemHeight = 48;
  const dropdownHeight = options.length * itemHeight + 16;

  let left = anchorPosition.x;
  let top = anchorPosition.y + anchorPosition.height + 8;

  // Adjust if dropdown goes off screen on right
  if (left + dropdownWidth > screenWidth - 16) {
    left = screenWidth - dropdownWidth - 16;
  }

  // Adjust if dropdown goes off screen at bottom
  if (top + dropdownHeight > screenHeight - 16) {
    top = anchorPosition.y - dropdownHeight - 8;
  }

  const handleOptionPress = (option: string) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.dropdownContainer,
              {
                top,
                left,
                backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
                shadowColor: isDark ? '#000' : '#666',
              },
            ]}
          >
            {title && (
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? '#FFFFFF' : '#2C3E50' },
                  ]}
                >
                  {title}
                </Text>
              </View>
            )}

            {options.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isDark ? '#FFFFFF' : '#2C3E50' },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dropdownContainer: {
    position: 'absolute',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  titleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
