import { X } from 'lucide-react-native';
import {
  View,
  Text,
  TextInput,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface BoxHeaderProps {
  label: string;
  handleButton?: () => void;
}

export default function BoxHeaderX({ label, handleButton }: BoxHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#2C3E50' }]}>
        {label}
      </Text>
      <TouchableOpacity onPress={handleButton}>
        <X size={24} color={isDark ? '#FFFFFF' : '#2C3E50'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
