import { useColorScheme, View, Text } from 'react-native';
import LeftBox from '../../ui/nonspecific/left-box';
import RightBox from '../../ui/nonspecific/right-box';
import { styles } from '../../tabs/home/homeStyles';
import { Colors } from '../../globalcss';
import { useState } from 'react';
import WorkList from './workList';
import FileViewerEditor from './workSpace/preview/fileViewEditor';

export default function Work() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    name: string;
  } | null>(null);

  const handleFileSelect = (path: string, isDirectory: boolean) => {
    if (!isDirectory) {
      // Extract filename from path
      const fileName = path.split('/').pop() || path;
      setSelectedFile({ path, name: fileName });
    } else {
      // Clear selection when navigating to a directory
      setSelectedFile(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LeftBox>
        <WorkList setSelected={handleFileSelect} />
      </LeftBox>
      <RightBox>
        {selectedFile ? (
          <FileViewerEditor
            key={selectedFile.path}
            filePath={selectedFile.path}
            fileName={selectedFile.name}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              Select a file to preview
            </Text>
          </View>
        )}
      </RightBox>
    </View>
  );
}
