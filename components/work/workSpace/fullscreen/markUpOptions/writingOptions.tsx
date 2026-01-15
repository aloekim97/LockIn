import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarkupMode } from '../textCanvas';

interface WritingOptionProps {
  currentMode: MarkupMode | 'Erase';
  onModeChange: (mode: any) => void;
}

const WritingOption: React.FC<WritingOptionProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes = [
    { id: 'Draw', icon: 'brush-outline' },
    { id: 'Write', icon: 'pencil-outline' },
    { id: 'Text', icon: 'text-outline' },
    // { id: 'Erase'},
  ];

  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.id}
          onPress={() => onModeChange(mode.id)}
          activeOpacity={0.7}
          style={[
            styles.modeButton,
            currentMode === mode.id && styles.activeButton,
          ]}
        >
          <Ionicons
            name={mode.icon as any}
            size={20}
            color={currentMode === mode.id ? '#4CAF50' : 'white'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
});

export default WritingOption;
