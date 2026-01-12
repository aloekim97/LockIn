// components/WorkList.tsx
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import BoxHeaderAdd from '../../../ui/nonspecific/box-header+';
import FileItem from './file-item';
import Breadcrumb from './breadcrumb';
import DropdownModal from '../../../modals/dropdownModal';
import { FileSystemItem } from '../../../utils/fileSystem';
import { useFileSystem } from '../../../hooks/useFileSystem';

interface WorkListProps {
  setSelected?: (path: string, isDirectory: boolean) => void;
}

const ITEM_HEIGHT = 50;

export default function WorkList({ setSelected }: WorkListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [activeItem, setActiveItem] = useState<FileSystemItem | null>(null);
  const itemRefs = useRef<Record<string, View | null>>({});

  const {
    status,
    currentPath,
    items,
    selectedItemPath,
    pendingItems,
    setCurrentPath,
    createNote,
    createNewFolder,
    savePendingItem,
    cancelPendingItem,
    navigateToParent,
    navigateToPath,
    selectItem,
  } = useFileSystem();

  const headerOptions = useMemo(() => ['+ New Folder', '+ New Note'], []);
  const fileOptions = useMemo(() => ['Rename', 'Delete', 'Move'], []);

  const handleCreate = useCallback(
    (option: string) => {
      if (option === '+ New Note') {
        createNote();
      } else if (option === '+ New Folder') {
        createNewFolder();
      }
    },
    [createNote, createNewFolder]
  );

  const handleItemPress = useCallback(
    (item: FileSystemItem) => {
      if (item.isDirectory) {
        setCurrentPath(item.path);
        selectItem(null);
      } else {
        selectItem(item.path);
        setSelected?.(item.path, item.isDirectory);
      }
    },
    [setCurrentPath, selectItem, setSelected]
  );

  const handleOptionsPress = useCallback((item: FileSystemItem) => {
    setActiveItem(item);
    const ref = itemRefs.current[item.path];

    if (ref) {
      ref.measure((x, y, width, height, pageX, pageY) => {
        setDropdownAnchor({
          x: pageX + width - 40,
          y: pageY,
          width: 40,
          height,
        });
        setDropdownVisible(true);
      });
    }
  }, []);

  const handleDropdownSelect = useCallback(
    async (option: string) => {
      if (!activeItem) return;
      console.log(`${option}: ${activeItem.name}`);
      setDropdownVisible(false);
    },
    [activeItem]
  );

  const handleDropdownClose = useCallback(() => {
    setDropdownVisible(false);
    setActiveItem(null);
  }, []);

  // Combine regular items and pending items for FlatList
  const allItems = useMemo(() => {
    // Regular file system items
    const regularItems = items.map((item) => ({
      ...item,
      id: item.path,
      isPending: false,
      pendingId: null,
    }));

    // Pending items (being created/renamed)
    const pendingItemsList = pendingItems.map((pending) => ({
      name: pending.initialName,
      path: pending.path,
      isDirectory: pending.type === 'folder',
      id: pending.id,
      isPending: true,
      pendingId: pending.id,
      pendingType: pending.type,
    }));

    // New items on top, then regular items sorted by name
    return [...pendingItemsList, ...regularItems];
  }, [items, pendingItems]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isPending = item.isPending;
      const isEditing = isPending; // Pending items are always in edit mode

      const handleSaveEdit = (newName: string) => {
        if (isPending && item.pendingId) {
          savePendingItem(item.pendingId, newName);
        } else {
          // Handle renaming existing items here
          console.log('Rename existing item:', item.path, newName);
        }
      };

      const handleCancelEdit = () => {
        if (isPending && item.pendingId) {
          cancelPendingItem(item.pendingId);
        } else {
          // Handle cancel rename for existing items
          console.log('Cancel rename');
        }
      };

      return (
        <View
          ref={(ref) => {
            if (!isPending) {
              itemRefs.current[item.path] = ref;
            }
          }}
          style={localStyles.itemWrapper}
        >
          <View style={localStyles.fileItemContainer}>
            <FileItem
              name={item.name}
              onPress={() => !isEditing && handleItemPress(item)}
              onOptionsPress={() => !isEditing && handleOptionsPress(item)}
              isSelected={selectedItemPath === item.path}
              type={item.isDirectory}
              isEditing={isEditing}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          </View>
        </View>
      );
    },
    [
      handleItemPress,
      handleOptionsPress,
      selectedItemPath,
      savePendingItem,
      cancelPendingItem,
    ]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const containerStyle = useMemo(
    () => ({
      flex: 1,
      padding: 8,
      borderColor: theme.text,
      borderWidth: 1,
      borderRadius: 5,
    }),
    [theme.text]
  );

  const backButtonStyle = useMemo(
    () => [localStyles.backButton, { backgroundColor: theme.card }],
    [theme.card]
  );

  const backButtonTextStyle = useMemo(
    () => [localStyles.backButtonText, { color: theme.text }],
    [theme.text]
  );

  const statusTextStyle = useMemo(
    () => [localStyles.statusText, { color: theme.textSecondary }],
    [theme.textSecondary]
  );

  return (
    <View style={containerStyle}>
      <BoxHeaderAdd
        title="Note List"
        add={handleCreate}
        options={headerOptions}
      />

      {status && <Text style={statusTextStyle}>{status}</Text>}

      <Breadcrumb
        currentPath={currentPath}
        onNavigate={navigateToPath}
        theme={theme}
      />

      {currentPath && (
        <TouchableOpacity style={backButtonStyle} onPress={navigateToParent}>
          <Ionicons name="arrow-back" size={18} color={theme.text} />
          <Text style={backButtonTextStyle}>Back</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        ListEmptyComponent={
          pendingItems.length === 0 && items.length === 0 ? (
            <Text
              style={[localStyles.emptyText, { color: theme.textSecondary }]}
            >
              No files or folders
            </Text>
          ) : null
        }
      />

      <DropdownModal
        visible={dropdownVisible}
        onClose={handleDropdownClose}
        options={fileOptions}
        onSelect={handleDropdownSelect}
        anchorPosition={dropdownAnchor}
        title={activeItem?.name}
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
  fileItemContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
