// hooks/useFileSystem.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getDirectoryContents,
  createFolder,
  writeFile,
  FileSystemItem,
} from '../utils/fileSystem';

export function useFileSystem(initialPath = '') {
  const [status, setStatus] = useState<string>('');
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);
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

  const refreshDirectory = useCallback(async () => {
    setStatus('Loading...');
    try {
      await loadDirectory(currentPath);
      setStatus('');
    } catch {
      setStatus('Error loading files');
    }
  }, [currentPath, loadDirectory]);

  const createNote = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const fileName = `note_${timestamp}.txt`;
      const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;

      await writeFile(filePath, '# New Note\n\nStart writing here...');
      await refreshDirectory();
      setStatusWithTimeout('Note created!');
    } catch (error) {
      console.error('Failed to create note:', error);
      setStatus('Error creating note');
    }
  }, [currentPath, refreshDirectory, setStatusWithTimeout]);

  const createNewFolder = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const folderName = `folder_${timestamp}`;
      const folderPath = currentPath
        ? `${currentPath}/${folderName}`
        : folderName;

      await createFolder(folderPath);
      await refreshDirectory();
      setStatusWithTimeout('Folder created!');
    } catch (error) {
      console.error('Failed to create folder:', error);
      setStatus('Error creating folder');
    }
  }, [currentPath, refreshDirectory, setStatusWithTimeout]);

  const navigateToParent = useCallback(() => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(parentPath);
      setSelectedItemPath(null);
    }
  }, [currentPath]);

  const navigateToPath = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const selectItem = useCallback((path: string | null) => {
    setSelectedItemPath(path);
  }, []);

  useEffect(() => {
    refreshDirectory();
  }, [currentPath]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    status,
    currentPath,
    items,
    selectedItemPath,
    setCurrentPath,
    createNote,
    createNewFolder,
    navigateToParent,
    navigateToPath,
    selectItem,
    refreshDirectory,
    setStatusWithTimeout,
  };
}
