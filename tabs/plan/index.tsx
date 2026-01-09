// planScreen
import Constants from 'expo-constants';
import { useState } from 'react';
import {
  useColorScheme,
  Alert,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { styles } from './planStyles';
import { Colors } from '../../globalcss';

export default function PlanScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.status, { color: theme.text }]}>Profile Screen</Text>
      <Text style={[styles.subText, { color: theme.text }]}>
        View your profile information
      </Text>
    </View>
  );
}
