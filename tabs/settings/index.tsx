// Settings Screen
import Constants from 'expo-constants';
import { useState } from 'react';
import {
  useColorScheme,
  Alert,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { styles } from './settingStyles'
import { Colors } from '../../globalcss';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.status, { color: theme.text }]}>Settings Screen</Text>
      <Text style={[styles.subText, { color: theme.text }]}>Configure your app here</Text>
    </View>
  );
}
