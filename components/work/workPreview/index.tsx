import Constants from 'expo-constants';
import { useState, useEffect } from 'react';
import {
  useColorScheme,
  Alert,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { styles } from '../../../tabs/work/workStyles';
import { Colors } from '../../../globalcss';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@work_notes';

interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export default function NoteScreen() {
  const [status, setStatus] = useState<string>('Ready');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notes', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save notes', error);
    }
  };

  const createNewNote = (): void => {
    setCurrentNote(null);
    setNoteText('');
    setCurrentView('edit');
  };

  const openNote = (note: Note): void => {
    setCurrentNote(note);
    setNoteText(note.content);
    setCurrentView('edit');
  };

  const saveCurrentNote = (): void => {
    if (!noteText.trim()) {
      setCurrentView('list');
      return;
    }

    const lines = noteText.split('\n').filter((line) => line.trim());
    const title = lines[0]?.substring(0, 50) || 'New Note';
    const preview = lines.slice(0, 2).join(' ').substring(0, 100);
    const timestamp = new Date().toISOString();

    if (currentNote) {
      const updated = notes.map((note) =>
        note.id === currentNote.id
          ? { ...note, title, content: noteText, preview, updatedAt: timestamp }
          : note
      );
      saveNotes(updated);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content: noteText,
        preview,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      saveNotes([newNote, ...notes]);
    }

    setCurrentView('list');
  };

  const deleteNote = (noteId: string): void => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = notes.filter((note) => note.id !== noteId);
          saveNotes(updated);
          if (currentNote?.id === noteId) {
            setCurrentView('list');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const handleFileAction = async (): Promise<void> => {
    try {
      const baseDir = FileSystem.documentDirectory;
      if (!baseDir) {
        Alert.alert('Error', 'Storage directory is not available.');
        return;
      }
      const folderName = 'MyAppData';
      const fileName = 'test-file.txt';
      const folderUri = `${baseDir}${folderName}/`;
      const fileUri = `${folderUri}${fileName}`;
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }
      await FileSystem.writeAsStringAsync(
        fileUri,
        `Updated: ${new Date().toLocaleTimeString()}`,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );
      setStatus('File Saved!');
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'File saved! View it in the iOS Files App.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Check terminal for details.');
    }
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: theme.card }]}
      onPress={() => openNote(item)}
      onLongPress={() => deleteNote(item.id)}
    >
      <Text style={[styles.noteTitle, { color: theme.text }]}>
        {item.title}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
          {formatDate(item.updatedAt)}
        </Text>
        <Text
          style={[styles.notePreview, { color: theme.textTertiary }]}
          numberOfLines={1}
        >
          {item.preview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Edit View
  if (currentView === 'edit') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editContainer}
        >
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={saveCurrentNote}>
              <Text style={[styles.doneButton, { color: theme.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
            {currentNote && (
              <TouchableOpacity onPress={() => deleteNote(currentNote.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.editInput, { color: theme.text }]}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Start typing..."
            placeholderTextColor={theme.textTertiary}
            multiline
            autoFocus
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </View>
    );
  }

  // List View
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notes</Text>
        <TouchableOpacity
          onPress={createNewNote}
          style={[styles.newButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.newButtonText, { color: theme.buttonText }]}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No notes yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Tap + to create your first note
            </Text>
          </View>
        }
      />

      {/* Original file action button - kept at bottom */}
      <View style={styles.bottomSection}>
        <Text style={[styles.status, { color: theme.text }]}>{status}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={handleFileAction}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Create File
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
