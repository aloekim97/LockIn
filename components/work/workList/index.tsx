import { useEffect, useState } from 'react';
import {
  useColorScheme,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../globalcss';
import { styles as homeStyles } from '../../../tabs/home/homeStyles';
import BoxHeaderAdd from '../../../ui/nonspecific/box-header+';
import FileItem from '../../../ui/nonspecific/file-item';
import {
  getDirectoryContents,
  createFolder,
  writeFile,
  FileSystemItem,
} from '../../../utils/fileNavigation';

interface WorkListProps {
  setSelected?: (path: string, isDirectory: boolean) => void;
}

export default function WorkList({ setSelected }: WorkListProps) {
  const [status, setStatus] = useState<string>('Loading...');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [create, setCreate] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);

  const options = ['+ New Folder', '+ New Note'];

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  useEffect(() => {
    handleCreate();
  }, [create]);

  const loadDirectory = async (path: string) => {
    setStatus('Loading...');
    try {
      const contents = await getDirectoryContents(path);
      setItems(contents);
      setStatus(contents.length === 0 ? 'No files or folders' : '');
    } catch (error) {
      console.error('Failed to load directory:', error);
      setStatus('Error loading files');
    }
  };

  const handleCreate = async () => {
    if (create === '+ New Note') {
      setStatus('Creating New Note...');
      try {
        const timestamp = Date.now();
        const fileName = `note_${timestamp}.txt`;
        const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;

        await writeFile(filePath, '# New Note\n\nStart writing here...');
        await loadDirectory(currentPath);
        setStatus('Note created!');
        setTimeout(() => setStatus(''), 2000);
      } catch (error) {
        console.error('Failed to create note:', error);
        setStatus('Error creating note');
      }
    } else if (create === '+ New Folder') {
      setStatus('Creating New Folder...');
      try {
        const timestamp = Date.now();
        const folderName = `folder_${timestamp}`;
        const folderPath = currentPath
          ? `${currentPath}/${folderName}`
          : folderName;

        await createFolder(folderPath);
        await loadDirectory(currentPath);
        setStatus('Folder created!');
        setTimeout(() => setStatus(''), 2000);
      } catch (error) {
        console.error('Failed to create folder:', error);
        setStatus('Error creating folder');
      }
    }
    setCreate('');
  };

  const handleItemPress = (item: FileSystemItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
      setSelectedItemPath(null);
    } else {
      setSelectedItemPath(item.path);
      setSelected?.(item.path, item.isDirectory);
    }
  };

  const handleBackPress = () => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(parentPath);
      setSelectedItemPath(null);
    }
  };

  const handleOptionsPress = (item: FileSystemItem) => {
    console.log('Options for:', item.name);
    // TODO: Show action sheet with Rename, Delete, Move options
  };

  const renderBreadcrumb = () => {
    const parts = currentPath ? currentPath.split('/') : [];

    return (
      <View style={localStyles.breadcrumb}>
        <TouchableOpacity onPress={() => setCurrentPath('')}>
          <Text style={[localStyles.breadcrumbText, { color: theme.primary }]}>
            Home
          </Text>
        </TouchableOpacity>

        {parts.map((part, index) => (
          <View key={index} style={localStyles.breadcrumbItem}>
            <Text
              style={[
                localStyles.breadcrumbSeparator,
                { color: theme.textSecondary },
              ]}
            >
              {' / '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newPath = parts.slice(0, index + 1).join('/');
                setCurrentPath(newPath);
              }}
            >
              <Text
                style={[localStyles.breadcrumbText, { color: theme.primary }]}
              >
                {part}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 8,
        borderColor: theme.text,
        borderWidth: 1,
        borderRadius: 5,
      }}
    >
      <BoxHeaderAdd title="Note List" add={setCreate} options={options} />

      {status && (
        <Text style={[localStyles.statusText, { color: theme.textSecondary }]}>
          {status}
        </Text>
      )}

      {renderBreadcrumb()}

      {currentPath !== '' && (
        <TouchableOpacity
          style={[localStyles.backButton, { backgroundColor: theme.card }]}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
          <Text style={[localStyles.backButtonText, { color: theme.text }]}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={localStyles.itemWrapper}>
            {item.isDirectory && (
              <Ionicons
                name="folder"
                size={18}
                color={theme.primary}
                style={localStyles.folderIcon}
              />
            )}
            <View style={localStyles.fileItemContainer}>
              <FileItem
                name={item.name}
                onPress={() => handleItemPress(item)}
                onOptionsPress={() => handleOptionsPress(item)}
                isSelected={selectedItemPath === item.path}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  statusText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  breadcrumb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    fontSize: 13,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  backButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  folderIcon: {
    marginRight: 6,
  },
  fileItemContainer: {
    flex: 1,
  },
});
