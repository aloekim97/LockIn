// components/FileItem.tsx (Enhanced version)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../globalcss';

interface FileItemProps {
  name: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
  isSelected?: boolean;
  type: boolean;
  isEditing?: boolean;
  onSaveEdit?: (newName: string) => void;
  onCancelEdit?: () => void;
}

export default function FileItem({
  name,
  onPress,
  onOptionsPress,
  isSelected = false,
  type,
  isEditing = false,
  onSaveEdit,
  onCancelEdit,
}: FileItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [editName, setEditName] = useState(name);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      const keyboardHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          handleSubmit();
        }
      );

      return () => {
        clearTimeout(timer);
        keyboardHideListener.remove();
      };
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (editName.trim() && onSaveEdit) {
      onSaveEdit(editName);
    } else if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Escape' && onCancelEdit) {
      onCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.card,
            borderColor: theme.primary,
          },
        ]}
      >
        {type ? (
          <Ionicons
            name="folder"
            size={18}
            color={theme.textSecondary}
            style={styles.folderIcon}
          />
        ) : (
          <Ionicons
            name="document-text"
            size={18}
            color={theme.textSecondary}
            style={styles.folderIcon}
          />
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
              borderColor: theme.textSecondary,
            },
          ]}
          value={editName}
          onChangeText={setEditName}
          onSubmitEditing={handleSubmit}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus
          returnKeyType="done"
          blurOnSubmit
        />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, { backgroundColor: theme.primary + '20' }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="checkmark" size={18} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancelEdit}
            style={[
              styles.button,
              { backgroundColor: theme.textSecondary + '20' },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: isSelected ? theme.primary : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {type ? (
        <Ionicons
          name="folder"
          size={18}
          color={theme.primary}
          style={styles.folderIcon}
        />
      ) : (
        <Ionicons
          name="document-text"
          size={18}
          color={theme.primary}
          style={styles.folderIcon}
        />
      )}
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {name}
      </Text>

      <TouchableOpacity
        style={styles.optionsButton}
        onPress={onOptionsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 2,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderBottomWidth: 1,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  folderIcon: {
    marginRight: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  button: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 4,
  },
});
