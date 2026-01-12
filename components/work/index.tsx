import { useColorScheme, View, Text } from 'react-native';
import LeftBox from '../../ui/nonspecific/left-box';
import RightBox from '../../ui/nonspecific/right-box';
import { styles } from '../../tabs/home/homeStyles';
import { Colors } from '../../globalcss';
import { useEffect, useState } from 'react';
import WorkList from './workList';
import { listLockInItems } from '../../utils/fileSystem';

export default function Work() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selected, setSelected] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const allItems = await listLockInItems();
      setFiles(allItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LeftBox>
        <WorkList setSelected={setSelected} />
      </LeftBox>
      <RightBox>
        <Text style={{ color: 'white' }}>Found {files.length} file(s)</Text>
      </RightBox>
    </View>
  );
}
