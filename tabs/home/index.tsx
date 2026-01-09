import Constants from 'expo-constants';
import { useState } from 'react';
import {
  useColorScheme,
  View,
} from 'react-native';
import { styles } from './homeStyles';
import { Colors } from '../../globalcss';
import Tasks from '../../components/tasks';
import Calendar from '../../components/calendar';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Tasks />
      <Calendar />
    </View>
  );
}
