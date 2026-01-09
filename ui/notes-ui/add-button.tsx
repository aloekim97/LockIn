import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import SimpleStorage from '../../utils/SimpleStorage'; // Adjust the import path as needed

interface AddButtonProps {
  currentFolderId?: string;
  onFileCreated?: () => void;
  onFolderCreated?: () => void;
}

export default function AddButton({
  currentFolderId,
  onFileCreated,
  onFolderCreated,
}: AddButtonProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleOptionSelect = async (option: string) => {
    try {
      if (option === 'new file') {
        // Create a new text file/note
        const newNote = await SimpleStorage.createNote(currentFolderId);
        console.log('New file created:', newNote);

        // Call the callback if provided
        if (onFileCreated) {
          onFileCreated();
        }

        // You could also navigate to the new file editor here
        // navigation.navigate('NoteEditor', { noteId: newNote.id });

        Alert.alert('Success', 'New file created successfully!');
      } else if (option === 'new folder') {
        // Prompt for folder name (you can customize this)
        Alert.prompt(
          'New Folder',
          'Enter folder name:',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Create',
              onPress: (folderName?: string) => {
                if (folderName && folderName.trim()) {
                  SimpleStorage.createFolder(folderName.trim()).then(
                    (newFolder) => {
                      console.log('New folder created:', newFolder);

                      if (onFolderCreated) {
                        onFolderCreated();
                      }

                      Alert.alert('Success', 'Folder created successfully!');
                    }
                  );
                }
              },
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Error creating file/folder:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    }

    setMenuVisible(false);
  };

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={{
          padding: 10,
          width: 50,
          height: 50,
          borderRadius: 16,
          backgroundColor: '#007AFF', // Add background color
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 24,
            height: 2,
            backgroundColor: 'white',
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 2,
            height: 24,
            backgroundColor: 'white',
          }}
        />
      </TouchableOpacity>

      {menuVisible && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -screenHeight * 10,
              left: -screenWidth * 10,
              right: -screenWidth * 10,
              bottom: -screenHeight * 10,
              zIndex: 999,
            }}
            activeOpacity={0}
            onPress={() => setMenuVisible(false)}
          />

          {/* Menu */}
          <View
            style={{
              position: 'absolute',
              top: 60,
              right: 0,
              zIndex: 1000,
            }}
          >
            <View
              style={{
                backgroundColor: '#1e1e1e',
                borderRadius: 8,
                paddingVertical: 8,
                minWidth: 160,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
                onPress={() => handleOptionSelect('new file')}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    marginRight: 12,
                    fontWeight: '300',
                  }}
                >
                  +
                </Text>
                <Text
                  style={{ color: 'white', fontSize: 14, fontWeight: '400' }}
                >
                  New File
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  backgroundColor: '#333',
                  marginHorizontal: 16,
                }}
              />

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
                onPress={() => handleOptionSelect('new folder')}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    marginRight: 12,
                    fontWeight: '300',
                  }}
                >
                  +
                </Text>
                <Text
                  style={{ color: 'white', fontSize: 14, fontWeight: '400' }}
                >
                  New Folder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
