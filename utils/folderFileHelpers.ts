import {
  getDirectoryContents,
  createFolder as createFolderBase,
  writeFile,
  deleteItem,
  renameItem as renameItemBase,
  readFile,
  getItemInfo,
  getLockInFolderUri,
  FileSystemItem,
} from './fileSystem';

export interface File {
  id: string;
  title: string;
  folder: string;
  fileName: string;
  updatedAt: string;
  isNew?: boolean;
}

export interface Folder {
  name: string;
  fileCount: number;
}

/**
 * Load all folders with their file counts
 * @returns Array of folders with file counts
 */
export const loadFolders = async (): Promise<Folder[]> => {
  try {
    const items = await getDirectoryContents('');
    const folders = items.filter(item => item.isDirectory);
    
    const foldersWithCounts: Folder[] = [];
    
    for (const folder of folders) {
      const files = await getDirectoryContents(folder.name);
      foldersWithCounts.push({
        name: folder.name,
        fileCount: files.filter(item => !item.isDirectory).length,
      });
    }
    
    return foldersWithCounts;
  } catch (error) {
    console.error('Failed to load folders:', error);
    throw error;
  }
};

/**
 * Load all files from a specific folder
 * @param folderName - Name of the folder to load files from
 * @returns Array of files in the folder
 */
export const loadFilesFromFolder = async (folderName: string): Promise<File[]> => {
  try {
    const items = await getDirectoryContents(folderName);
    const files = items.filter(item => !item.isDirectory && item.name.endsWith('.txt'));
    
    return files.map(file => ({
      id: file.name,
      title: file.name.replace('.txt', ''),
      folder: folderName,
      fileName: file.name,
      updatedAt: file.modificationTime 
        ? new Date(file.modificationTime).toISOString() 
        : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to load files from folder:', error);
    throw error;
  }
};

/**
 * Create a new folder
 * @param folderName - Name of the folder to create
 * @returns Success boolean
 */
export const createFolder = async (folderName: string): Promise<boolean> => {
  try {
    if (!folderName.trim()) {
      throw new Error('Folder name cannot be empty');
    }

    await createFolderBase(folderName);
    return true;
  } catch (error) {
    console.error('Failed to create folder:', error);
    throw error;
  }
};

/**
 * Create a new file in a folder
 * @param folderName - Name of the folder
 * @param fileName - Name of the file (without .txt extension)
 * @param content - Optional initial content
 * @returns URI of the created file
 */
export const createFile = async (
  folderName: string,
  fileName: string,
  content?: string
): Promise<string> => {
  try {
    if (!fileName.trim()) {
      throw new Error('File name cannot be empty');
    }

    const fullFileName = `${fileName}.txt`;
    const relativePath = `${folderName}/${fullFileName}`;
    const fileContent = content || `# ${fileName}\n\nStart writing here...`;
    
    const fileUri = await writeFile(relativePath, fileContent, false);
    return fileUri;
  } catch (error) {
    console.error('Failed to create file:', error);
    throw error;
  }
};

/**
 * Delete a folder and all its files
 * @param folderName - Name of the folder to delete
 * @returns Success boolean
 */
export const deleteFolder = async (folderName: string): Promise<boolean> => {
  try {
    await deleteItem(folderName);
    return true;
  } catch (error) {
    console.error('Failed to delete folder:', error);
    throw error;
  }
};

/**
 * Delete a specific file
 * @param folderName - Name of the folder containing the file
 * @param fileName - Name of the file to delete (with extension)
 * @returns Success boolean
 */
export const deleteFile = async (
  folderName: string,
  fileName: string
): Promise<boolean> => {
  try {
    const relativePath = `${folderName}/${fileName}`;
    await deleteItem(relativePath);
    console.log('✅ File deleted:', fileName);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete file:', error);
    throw error;
  }
};

/**
 * Delete a file or folder by full path
 * @param path - Full path to the item to delete (relative to LockIn folder)
 * @returns Success boolean
 */
export const deleteItemByPath = async (path: string): Promise<boolean> => {
  try {
    // Remove LockIn prefix if present
    const lockInUri = getLockInFolderUri();
    const relativePath = path.startsWith(lockInUri) 
      ? path.replace(lockInUri, '') 
      : path;
    
    await deleteItem(relativePath);
    console.log('✅ Item deleted:', relativePath);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete item:', error);
    throw error;
  }
};

/**
 * Read the content of a file
 * @param folderName - Name of the folder containing the file
 * @param fileName - Name of the file to read (with extension)
 * @returns File content as string
 */
export const readFileContent = async (
  folderName: string,
  fileName: string
): Promise<string> => {
  try {
    const relativePath = `${folderName}/${fileName}`;
    return await readFile(relativePath);
  } catch (error) {
    console.error('Failed to read file content:', error);
    throw error;
  }
};

/**
 * Update the content of a file
 * @param folderName - Name of the folder containing the file
 * @param fileName - Name of the file to update (with extension)
 * @param content - New content for the file
 * @returns Success boolean
 */
export const updateFileContent = async (
  folderName: string,
  fileName: string,
  content: string
): Promise<boolean> => {
  try {
    const relativePath = `${folderName}/${fileName}`;
    await writeFile(relativePath, content, false);
    return true;
  } catch (error) {
    console.error('Failed to update file content:', error);
    throw error;
  }
};

/**
 * Rename a file
 * @param folderName - Name of the folder containing the file
 * @param oldFileName - Current file name (with extension)
 * @param newFileName - New file name (without extension)
 * @returns Success boolean
 */
export const renameFile = async (
  folderName: string,
  oldFileName: string,
  newFileName: string
): Promise<boolean> => {
  try {
    const oldPath = `${folderName}/${oldFileName}`;
    const newPath = `${folderName}/${newFileName}.txt`;
    
    await renameItemBase(oldPath, newPath);
    return true;
  } catch (error) {
    console.error('Failed to rename file:', error);
    throw error;
  }
};

/**
 * Get file metadata
 * @param folderName - Name of the folder containing the file
 * @param fileName - Name of the file (with extension)
 * @returns File info object
 */
export const getFileMetadata = async (
  folderName: string,
  fileName: string
): Promise<any> => {
  try {
    const relativePath = `${folderName}/${fileName}`;
    return await getItemInfo(relativePath);
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    throw error;
  }
};