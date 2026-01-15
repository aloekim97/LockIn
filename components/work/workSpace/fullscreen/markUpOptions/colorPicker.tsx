// components/ColorPicker.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface ColorPickerProps {
  current: string;
  onSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ current, onSelect }) => {
  const colors = ['#000000', '#4CAF50', '#2196F3', '#FF4444', '#FFA500'];

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
            current === c && styles.activeCircle
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
    borderWidth: .5,
    borderColor: 'white',
    transform: [{ scale: 1.25 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ColorPicker;


