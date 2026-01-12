import { useColorScheme, View } from 'react-native';
import { styles } from './workStyles';
import { Colors } from '../../globalcss';
import Work from '../../components/work';

export default function WorkScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Work />
    </View>
  );
}
