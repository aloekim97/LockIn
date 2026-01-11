import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../globalcss';

interface FileItemProps {
  name: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
  isSelected?: boolean;
  type: boolean;
}

export default function FileItem({
  name,
  onPress,
  onOptionsPress,
  isSelected = false,
  type,
}: FileItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: isSelected ? theme.primary : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {type && (
        <Ionicons
          name="folder"
          size={18}
          color={theme.primary}
          style={styles.folderIcon}
        />
      )}
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {name}
      </Text>

      <TouchableOpacity
        style={styles.optionsButton}
        onPress={onOptionsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 2,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  folderIcon: {
    marginRight: 16,
  },
});
