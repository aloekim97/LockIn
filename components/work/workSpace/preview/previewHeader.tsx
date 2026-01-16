// components/MultiIconHeader.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PreviewHeaderProps {
  fileName: string;
  theme: any;
  isEditing: boolean;
  saving: boolean;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isFullscreen: boolean;
  errorColor: string;
  onShare: () => void;
  onToggleEditMode: () => void;
  onToggleFullscreen: () => void;
  onDiscard: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function PreviewHeader({
  fileName,
  theme,
  isEditing,
  saving,
  hasChanges,
  canUndo,
  canRedo,
  isFullscreen,
  errorColor,
  onShare,
  onToggleEditMode,
  onToggleFullscreen,
  onDiscard,
  onUndo,
  onRedo,
}: PreviewHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: theme.textSecondary + '30',
          backgroundColor: isEditing ? theme.background : theme.card,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <Text
          style={[styles.fileName, { color: theme.text }]}
          numberOfLines={1}
        >
          {fileName}
        </Text>
        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.savingText, { color: theme.textSecondary }]}>
              Saving...
            </Text>
          </View>
        )}
        {hasChanges && !saving && isEditing && (
          <Text style={[styles.unsavedText, { color: theme.primary }]}>
            • Unsaved
          </Text>
        )}
      </View>

      <View style={styles.headerButtons}>
        {!isEditing && (
          <TouchableOpacity
            onPress={onShare}
            style={[styles.shareButton, { backgroundColor: theme.card }]}
          >
            <Ionicons name="share-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        )}

        {isEditing && (
          <>
            <TouchableOpacity
              onPress={onUndo}
              disabled={!canUndo}
              style={[
                styles.undoButton,
                {
                  backgroundColor: theme.card,
                  opacity: canUndo ? 1 : 0.4,
                },
              ]}
            >
              <Ionicons name="arrow-undo" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRedo}
              disabled={!canRedo}
              style={[
                styles.redoButton,
                {
                  backgroundColor: theme.card,
                  opacity: canRedo ? 1 : 0.4,
                },
              ]}
            >
              <Ionicons name="arrow-redo" size={20} color={theme.text} />
            </TouchableOpacity>
          </>
        )}

        {isEditing && hasChanges && (
          <TouchableOpacity
            onPress={onDiscard}
            style={[
              styles.discardButton,
              { borderColor: errorColor, borderWidth: 1 },
            ]}
          >
            <Text style={{ color: errorColor, fontWeight: '600' }}>
              Discard
            </Text>
          </TouchableOpacity>
        )}

        {/* Changed: Edit button now becomes Fullscreen button when not editing */}
        <TouchableOpacity
          onPress={isEditing ? onToggleEditMode : onToggleFullscreen}
          style={[
            styles.editButton,
            { backgroundColor: isEditing ? theme.card : theme.primary },
          ]}
        >
          <Ionicons
            name={isEditing ? 'checkmark' : 'expand'}
            size={20}
            color={isEditing ? theme.text : 'white'}
          />
          <Text
            style={[
              styles.editButtonText,
              { color: isEditing ? theme.text : 'white' },
            ]}
          >
            {isEditing ? 'Done' : 'Fullscreen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  unsavedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    borderRadius: 6,
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 6,
  },
  undoButton: {
    padding: 8,
    borderRadius: 6,
  },
  redoButton: {
    padding: 8,
    borderRadius: 6,
  },
  discardButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  editButtonText: {
    fontWeight: '600',
  },
});
