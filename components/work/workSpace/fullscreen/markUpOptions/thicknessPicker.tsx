// components/ThicknessPicker.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface ThicknessPickerProps {
  current: number;
  onSelect: (thickness: number) => void;
  selectedColor: string;
}

const ThicknessPicker: React.FC<ThicknessPickerProps> = ({
  current,
  onSelect,
  selectedColor,
}) => {
  const thicknesses = [0.5, 2, 4, 8, 12];

  return (
    <View style={styles.container}>
      {thicknesses.map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onSelect(t)}
          activeOpacity={0.7}
          style={[
            styles.dotBase,
            {
              width: t + 10,
              height: t + 10,
              borderRadius: (t + 10) / 2,
              backgroundColor: current === t ? selectedColor : '#555',
            },
            current === t && styles.activeDot,
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
  dotBase: {},
  activeDot: {
    transform: [{ scale: 1.2 }],
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});

export default ThicknessPicker;
