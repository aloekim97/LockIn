import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCKIN_FOLDER = 'LockIn';
const INIT_KEY = '@lockin_folder_initialized';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

export const getLockInFolderUri = (): string => {
  const baseDir = FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('Storage directory is not available');
  }
  return `${baseDir}${LOCKIN_FOLDER}/`;
};

const getFullPath = (relativePath: string): string => {
  const baseUri = getLockInFolderUri();
  return relativePath ? `${baseUri}${relativePath}` : baseUri;
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initializeLockInFolder = async (): Promise<void> => {
  try {
    const initialized = await AsyncStorage.getItem(INIT_KEY);
    if (initialized === 'true') {
      console.log('✅ LockIn folder already initialized');
      return;
    }

    console.log('🔄 Initializing LockIn folder...');
    const lockInFolderUri = getLockInFolderUri();

    await FileSystem.makeDirectoryAsync(lockInFolderUri, {
      intermediates: true,
    });

    const readmeContent = `Welcome to LockIn!

This folder is used by the LockIn app to store your files.

Created: ${new Date().toLocaleString()}
Environment: ${isExpoGo() ? 'Expo Go (Development)' : 'Production Build'}
`;

    const readmeUri = `${lockInFolderUri}README.txt`;
    await FileSystem.writeAsStringAsync(readmeUri, readmeContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await AsyncStorage.setItem(INIT_KEY, 'true');
    console.log('✅ LockIn folder initialized at:', lockInFolderUri);

    if (isExpoGo()) {
      await Sharing.shareAsync(readmeUri, {
        dialogTitle: 'Save to Files app to access LockIn folder',
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize LockIn folder:', error);
  }
};

export const resetLockInInitialization = async (): Promise<void> => {
  await AsyncStorage.removeItem(INIT_KEY);
  console.log('🔄 LockIn initialization flag reset');
};

// ============================================================================
// DIRECTORY OPERATIONS
// ============================================================================

export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modificationTime?: number;
}

/**
 * Get all items (files and folders) in a directory
 * @param relativePath - Path relative to LockIn folder (e.g., "Projects/2024")
 * @returns Array of items sorted (folders first, then files)
 */
export const getDirectoryContents = async (
  relativePath: string = ''
): Promise<FileSystemItem[]> => {
  const fullPath = getFullPath(relativePath);
  const folderInfo = await FileSystem.getInfoAsync(fullPath);
  
  if (!folderInfo.exists) {
    return [];
  }

  const items = await FileSystem.readDirectoryAsync(fullPath);
  const itemsWithMetadata: FileSystemItem[] = [];

  for (const item of items) {
    const itemPath = relativePath ? `${relativePath}/${item}` : item;
    const itemFullPath = getFullPath(itemPath);
    const itemInfo = await FileSystem.getInfoAsync(itemFullPath);
    
    itemsWithMetadata.push({
      name: item,
      path: itemPath,
      isDirectory: itemInfo.isDirectory,
      size: itemInfo.exists ? (itemInfo as any).size : undefined,
      modificationTime: itemInfo.exists ? (itemInfo as any).modificationTime : undefined,
    });
  }

  // Sort: folders first, then files, alphabetically
  return itemsWithMetadata.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });
};

/**
 * Create a new folder
 * @param relativePath - Path relative to LockIn folder (e.g., "Projects/2024")
 */
export const createFolder = async (relativePath: string): Promise<void> => {
  const fullPath = getFullPath(relativePath);
  await FileSystem.makeDirectoryAsync(fullPath, { intermediates: true });
  console.log('✅ Folder created:', relativePath);
};

/**
 * List all subfolders in a directory
 * @param relativePath - Path relative to LockIn folder
 * @returns Array of folder names
 */
export const listSubfolders = async (relativePath: string = ''): Promise<string[]> => {
  const items = await getDirectoryContents(relativePath);
  return items.filter(item => item.isDirectory).map(item => item.name);
};

/**
 * List all files in a directory
 * @param relativePath - Path relative to LockIn folder
 * @returns Array of file names
 */
export const listFiles = async (relativePath: string = ''): Promise<string[]> => {
  const items = await getDirectoryContents(relativePath);
  return items.filter(item => !item.isDirectory).map(item => item.name);
};

/**
 * List all items (files and folders) in a directory
 * @param relativePath - Path relative to LockIn folder
 * @returns Array of all item names
 */
export const listLockInItems = async (relativePath: string = ''): Promise<string[]> => {
  const items = await getDirectoryContents(relativePath);
  return items.map(item => item.name);
};

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Read file content
 * @param relativePath - Path relative to LockIn folder (e.g., "Notes/todo.txt")
 */
export const readFile = async (relativePath: string): Promise<string> => {
  const fullPath = getFullPath(relativePath);
  const fileInfo = await FileSystem.getInfoAsync(fullPath);
  
  if (!fileInfo.exists) {
    throw new Error(`File not found: ${relativePath}`);
  }

  return await FileSystem.readAsStringAsync(fullPath, {
    encoding: FileSystem.EncodingType.UTF8,
  });
};

/**
 * Write/create file
 * @param relativePath - Path relative to LockIn folder
 * @param content - Content to write
 * @param openShareSheet - Whether to open share sheet (default: true in Expo Go)
 */
export const writeFile = async (
  relativePath: string,
  content: string,
  openShareSheet: boolean = isExpoGo()
): Promise<string> => {
  const fullPath = getFullPath(relativePath);
  
  await FileSystem.writeAsStringAsync(fullPath, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  console.log('✅ File saved:', relativePath);

  if (openShareSheet) {
    await Sharing.shareAsync(fullPath, {
      UTI: 'public.plain-text',
      mimeType: 'text/plain',
    });
  }

  return fullPath;
};

/**
 * Delete a file or folder
 * @param relativePath - Path relative to LockIn folder
 */
export const deleteItem = async (relativePath: string): Promise<void> => {
  const fullPath = getFullPath(relativePath);
  await FileSystem.deleteAsync(fullPath, { idempotent: true });
  console.log('✅ Deleted:', relativePath);
};

/**
 * Rename/move a file or folder
 * @param oldPath - Current path relative to LockIn folder
 * @param newPath - New path relative to LockIn folder
 */
export const renameItem = async (oldPath: string, newPath: string): Promise<void> => {
  const oldFullPath = getFullPath(oldPath);
  const newFullPath = getFullPath(newPath);
  
  await FileSystem.moveAsync({
    from: oldFullPath,
    to: newFullPath,
  });
  
  console.log('✅ Renamed:', oldPath, '->', newPath);
};

/**
 * Share a file
 * @param relativePath - Path relative to LockIn folder
 */
export const shareFile = async (relativePath: string): Promise<void> => {
  const fullPath = getFullPath(relativePath);
  const fileInfo = await FileSystem.getInfoAsync(fullPath);

  if (!fileInfo.exists) {
    throw new Error(`File not found: ${relativePath}`);
  }

  await Sharing.shareAsync(fullPath, {
    UTI: 'public.plain-text',
    mimeType: 'text/plain',
  });
};

/**
 * Get file or folder metadata
 * @param relativePath - Path relative to LockIn folder
 */
export const getItemInfo = async (relativePath: string): Promise<FileSystem.FileInfo> => {
  const fullPath = getFullPath(relativePath);
  return await FileSystem.getInfoAsync(fullPath);
};