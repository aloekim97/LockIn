import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface ColorPickerProps {
  current: string;
  onSelect: (color: string) => void;
  theme?: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  current,
  onSelect,
  theme,
}) => {
  const themeColor = theme?.text || '#FFFFFF';
  const colors = [themeColor, '#4CAF50', '#2196F3', '#FF4444', '#FFA500'];
  const borderColor = theme?.text || '#FFFFFF';

  return (
    <View style={styles.container}>
      {colors.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          activeOpacity={0.7}
          style={[
            styles.colorCircle,
            { backgroundColor: c },
            current.toUpperCase() === c.toUpperCase() && [
              styles.activeCircle,
              { borderColor },
            ],
            (c.toUpperCase() === '#FFFFFF' ||
              c.toUpperCase() === themeColor.toUpperCase()) &&
              styles.lightColorBorder,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  activeCircle: {
    borderWidth: 2,
    transform: [{ scale: 1.25 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lightColorBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default ColorPicker;
