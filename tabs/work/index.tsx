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
import { styles } from './workStyles';
import { Colors } from '../../globalcss';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Selection from '../../components/work/selection';

export default function WorkScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleFileAction = async () => {
    try {
      const baseDir = FileSystem.documentDirectory;
      if (!baseDir) {
        Alert.alert('Error', 'Storage directory is not available.');
        return;
      }

      const folderName = 'MyAppData';
      const fileName = 'test-file.txt';
      const folderUri = `${baseDir}${folderName}/`;
      const fileUri = `${folderUri}${fileName}`;

      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }

      await FileSystem.writeAsStringAsync(
        fileUri,
        `Updated: ${new Date().toLocaleTimeString()}`,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'File saved! View it in the iOS Files App.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Check terminal for details.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Selection />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleFileAction}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Create File
        </Text>
      </TouchableOpacity>
    </View>
  );
}
