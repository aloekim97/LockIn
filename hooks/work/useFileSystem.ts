// hooks/useFileSystem.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getDirectoryContents,
  createFolder,
  writeFile,
  FileSystemItem,
  PendingItem,
} from '../../utils/fileSystem';

export function useFileSystem(initialPath = '') {
  const [status, setStatus] = useState<string>('');
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setStatusWithTimeout = useCallback(
    (message: string, duration = 2000) => {
      setStatus(message);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => setStatus(''), duration);
      }
    },
    []
  );

  const loadDirectory = useCallback(async (path: string) => {
    try {
      const contents = await getDirectoryContents(path);
      setItems(contents);
      return contents;
    } catch (error) {
      console.error('Failed to load directory:', error);
      throw error;
    }
  }, []);

  // Combined the two redundant path-watching useEffects into one
  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startCreatingItem = useCallback(
    (type: 'file' | 'folder') => {
      const id = `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const initialName =
        type === 'file' ? 'Untitled Note.txt' : 'Untitled Folder';

      const pendingItem: PendingItem = {
        id,
        type,
        initialName,
        path: currentPath,
        isEditing: true,
      };

      setPendingItems((prev) => [...prev, pendingItem]);
      return id;
    },
    [currentPath]
  );

  const savePendingItem = useCallback(
    async (pendingId: string, newName: string) => {
      const pendingItem = pendingItems.find((item) => item.id === pendingId);
      if (!pendingItem) return;

      setPendingItems((prev) => prev.filter((item) => item.id !== pendingId));

      if (!newName.trim()) {
        setStatus('Name cannot be empty');
        return;
      }

      try {
        if (pendingItem.type === 'file') {
          const fileName = newName.endsWith('.txt')
            ? newName
            : `${newName}.txt`;
          const filePath = currentPath
            ? `${currentPath}/${fileName}`
            : fileName;
          await writeFile(filePath, '');
        } else {
          const folderPath = currentPath
            ? `${currentPath}/${newName}`
            : newName;
          await createFolder(folderPath);
        }

        await loadDirectory(currentPath);
        setStatusWithTimeout(
          `${pendingItem.type === 'file' ? 'Note' : 'Folder'} created!`
        );
      } catch (error) {
        console.error('Failed to save item:', error);
        setStatus(
          `Error creating ${pendingItem.type === 'file' ? 'note' : 'folder'}`
        );
      }
    },
    [currentPath, pendingItems, loadDirectory, setStatusWithTimeout]
  );

  const cancelPendingItem = useCallback((pendingId: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== pendingId));
  }, []);

  const navigateToParent = useCallback(() => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(parentPath);
      setSelectedItemPath(null);
    }
  }, [currentPath]);

  return {
    status,
    currentPath,
    items,
    selectedItemPath,
    pendingItems,
    setCurrentPath,
    createNote: () => startCreatingItem('file'),
    createNewFolder: () => startCreatingItem('folder'),
    savePendingItem,
    cancelPendingItem,
    navigateToParent,
    navigateToPath: setCurrentPath,
    selectItem: setSelectedItemPath,
    refreshDirectory: () => loadDirectory(currentPath),
    setStatusWithTimeout,
    refreshCurrentPath: () => loadDirectory(currentPath),
  };
}
