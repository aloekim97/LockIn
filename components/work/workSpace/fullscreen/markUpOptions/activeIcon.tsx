// components/ActiveIcon.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarkupMode } from '../textCanvas';

interface ActiveIconProps {
  color: string;
  thickness: number;
  mode: MarkupMode;
}

export default function ActiveIcon({
  color,
  thickness,
  mode
}: ActiveIconProps) {
  const getIconName = () => {
    switch (mode) {
      case 'Draw':
        return 'brush-outline';
      case 'Write':
        return 'pencil-outline';
      case 'Text':
        return 'text-outline';
      default:
        return 'brush-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* The Icon */}
      <Ionicons name={getIconName() as any} size={28} color="white" />

      {/* The Indicator Dot: Shows current color and relative thickness */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: color,
            width: Math.min(thickness + 4, 16), // Visual scale for thickness
            height: Math.min(thickness + 4, 16),
            borderRadius: 8,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    borderWidth: 1.5,
    borderColor: '#1b2026',
  },
});
