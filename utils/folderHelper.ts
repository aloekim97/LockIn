import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCKIN_FOLDER = 'LockIn';
const INIT_KEY = '@lockin_folder_initialized';

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

const getFileUri = (fileName: string): string => {
  return `${getLockInFolderUri()}${fileName}`;
};

const createReadmeContent = (): string => {
  return `Welcome to LockIn!

This folder is used by the LockIn app to store your files.

Created: ${new Date().toLocaleString()}
Environment: ${isExpoGo() ? 'Expo Go (Development)' : 'Production Build'}
`;
};

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

    const readmeUri = `${lockInFolderUri}README.txt`;
    await FileSystem.writeAsStringAsync(readmeUri, createReadmeContent(), {
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

export const saveToLockInFolder = async (
  fileName: string,
  content: string,
  openShareSheet: boolean = isExpoGo()
): Promise<string> => {
  const fileUri = getFileUri(fileName);

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  console.log('✅ File saved:', fileName);

  if (openShareSheet) {
    await Sharing.shareAsync(fileUri, {
      UTI: 'public.plain-text',
      mimeType: 'text/plain',
    });
  }

  return fileUri;
};

export const readFromLockInFolder = async (fileName: string): Promise<string> => {
  const fileUri = getFileUri(fileName);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    throw new Error(`File not found: ${fileName}`);
  }

  return await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
};

export const deleteFromLockInFolder = async (fileName: string): Promise<void> => {
  const fileUri = getFileUri(fileName);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (fileInfo.exists) {
    await FileSystem.deleteAsync(fileUri);
    console.log('✅ File deleted:', fileName);
  }
};

export const listLockInItems = async (): Promise<string[]> => {
  const lockInFolderUri = getLockInFolderUri();
  const folderInfo = await FileSystem.getInfoAsync(lockInFolderUri);

  if (!folderInfo.exists) {
    return [];
  }

  return await FileSystem.readDirectoryAsync(lockInFolderUri);
};

export const listLockInFiles = async (): Promise<string[]> => {
  const lockInFolderUri = getLockInFolderUri();
  const folderInfo = await FileSystem.getInfoAsync(lockInFolderUri);

  if (!folderInfo.exists) {
    return [];
  }

  const items = await FileSystem.readDirectoryAsync(lockInFolderUri);
  
  // Filter out directories, return only files
  const files: string[] = [];
  for (const item of items) {
    const itemUri = `${lockInFolderUri}${item}`;
    const itemInfo = await FileSystem.getInfoAsync(itemUri);
    if (!itemInfo.isDirectory) {
      files.push(item);
    }
  }
  
  return files;
};

export const shareFromLockInFolder = async (fileName: string): Promise<void> => {
  const fileUri = getFileUri(fileName);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    throw new Error(`File not found: ${fileName}`);
  }

  await Sharing.shareAsync(fileUri, {
    UTI: 'public.plain-text',
    mimeType: 'text/plain',
  });
};