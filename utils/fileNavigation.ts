import * as FileSystem from 'expo-file-system';
import { getLockInFolderUri } from '../utils/folderHelper' // Update path

export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

/**
 * Get all items (files and folders) in a specific directory
 * @param relativePath - Path relative to LockIn folder (e.g., "Projects/2024")
 * @returns Array of items with metadata
 */
export const getDirectoryContents = async (
  relativePath: string = ''
): Promise<FileSystemItem[]> => {
  const baseUri = getLockInFolderUri();
  const fullPath = relativePath ? `${baseUri}${relativePath}/` : baseUri;
  
  const folderInfo = await FileSystem.getInfoAsync(fullPath);
  if (!folderInfo.exists) {
    return [];
  }

  const items = await FileSystem.readDirectoryAsync(fullPath);
  const itemsWithMetadata: FileSystemItem[] = [];

  for (const item of items) {
    const itemUri = `${fullPath}${item}`;
    const itemInfo = await FileSystem.getInfoAsync(itemUri);
    
    itemsWithMetadata.push({
      name: item,
      path: relativePath ? `${relativePath}/${item}` : item,
      isDirectory: itemInfo.isDirectory,
    });
  }

  // Sort: folders first, then files, alphabetically within each group
  return itemsWithMetadata.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });
};

/**
 * Create a new folder
 * @param relativePath - Path relative to LockIn folder
 */
export const createFolder = async (relativePath: string): Promise<void> => {
  const baseUri = getLockInFolderUri();
  const fullPath = `${baseUri}${relativePath}`;
  
  await FileSystem.makeDirectoryAsync(fullPath, {
    intermediates: true,
  });
  
  console.log('✅ Folder created:', relativePath);
};

/**
 * Delete a file or folder
 * @param relativePath - Path relative to LockIn folder
 */
export const deleteItem = async (relativePath: string): Promise<void> => {
  const baseUri = getLockInFolderUri();
  const fullPath = `${baseUri}${relativePath}`;
  
  await FileSystem.deleteAsync(fullPath, { idempotent: true });
  console.log('✅ Deleted:', relativePath);
};

/**
 * Rename/move a file or folder
 * @param oldPath - Current path relative to LockIn folder
 * @param newPath - New path relative to LockIn folder
 */
export const renameItem = async (
  oldPath: string,
  newPath: string
): Promise<void> => {
  const baseUri = getLockInFolderUri();
  const oldFullPath = `${baseUri}${oldPath}`;
  const newFullPath = `${baseUri}${newPath}`;
  
  await FileSystem.moveAsync({
    from: oldFullPath,
    to: newFullPath,
  });
  
  console.log('✅ Renamed:', oldPath, '->', newPath);
};

/**
 * Read file content
 * @param relativePath - Path relative to LockIn folder
 */
export const readFile = async (relativePath: string): Promise<string> => {
  const baseUri = getLockInFolderUri();
  const fullPath = `${baseUri}${relativePath}`;
  
  return await FileSystem.readAsStringAsync(fullPath, {
    encoding: FileSystem.EncodingType.UTF8,
  });
};

/**
 * Write file content
 * @param relativePath - Path relative to LockIn folder
 * @param content - Content to write
 */
export const writeFile = async (
  relativePath: string,
  content: string
): Promise<void> => {
  const baseUri = getLockInFolderUri();
  const fullPath = `${baseUri}${relativePath}`;
  
  await FileSystem.writeAsStringAsync(fullPath, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  console.log('✅ File saved:', relativePath);
};