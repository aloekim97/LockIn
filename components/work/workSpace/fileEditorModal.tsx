// components/FileEditorModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../globalcss';
import { readFile, writeFile } from '../../../utils/fileSystem';

interface FileEditorModalProps {
  visible: boolean;
  filePath: string | null;
  fileName: string | null;
  onClose: () => void;
}

export default function FileEditorModal({
  visible,
  filePath,
  fileName,
  onClose,
}: FileEditorModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    if (visible && filePath) {
      loadFile();
    }
  }, [visible, filePath]);

  const loadFile = async () => {
    if (!filePath) return;

    try {
      setLoading(true);
      const fileContent = await readFile(filePath);
      setContent(fileContent);
      setOriginalContent(fileContent);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load file:', error);
      Alert.alert('Error', 'Failed to load file');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!filePath) return;

    try {
      setLoading(true);
      await writeFile(filePath, content, false);
      setOriginalContent(content);
      setHasChanges(false);
      Alert.alert('Success', 'File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      Alert.alert('Error', 'Failed to save file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before closing?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setContent('');
              setHasChanges(false);
              onClose();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== originalContent);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: theme.textSecondary + '30' },
            ]}
          >
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text
                style={[styles.fileName, { color: theme.text }]}
                numberOfLines={1}
              >
                {fileName || 'Untitled'}
              </Text>
              {hasChanges && (
                <Text
                  style={[styles.unsavedIndicator, { color: theme.primary }]}
                >
                  • Unsaved
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                { backgroundColor: hasChanges ? theme.primary : theme.card },
              ]}
              disabled={!hasChanges || loading}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color: hasChanges ? theme.buttonText : theme.textSecondary,
                  },
                ]}
              >
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Editor */}
          <TextInput
            style={[
              styles.editor,
              {
                color: theme.text,
                backgroundColor: theme.background,
              },
            ]}
            value={content}
            onChangeText={handleContentChange}
            multiline
            placeholder="Start typing..."
            placeholderTextColor={theme.textTertiary}
            autoFocus
            textAlignVertical="top"
            editable={!loading}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 17,
    fontWeight: '600',
  },
  unsavedIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editor: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
});
