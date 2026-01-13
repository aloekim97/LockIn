// components/FilePreview.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilePreviewProps {
  fileName: string;
  theme: any;
  content: string;
  loading?: boolean;
  saving?: boolean;
  hasChanges?: boolean;
  isEditing?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  isFullscreen?: boolean;
  error?: string | null;
  readOnly?: boolean;
  charCount?: number;
  wordCount?: number;
  lineCount?: number;
  onShare?: () => void;
  onToggleEditMode?: () => void;
  onToggleFullscreen?: () => void;
  onDiscard?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRetry?: () => void;
}

export default function FilePreview({
  fileName,
  theme,
  content,
  loading = false,
  saving = false,
  hasChanges = false,
  isEditing = false,
  canUndo = false,
  canRedo = false,
  isFullscreen = false,
  error = null,
  readOnly = false,
  charCount = 0,
  wordCount = 0,
  lineCount = 0,
  onShare = () => {},
  onToggleEditMode = () => {},
  onToggleFullscreen = () => {},
  onDiscard = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onRetry = () => {},
}: FilePreviewProps) {
  const errorColor = '#ef4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.textSecondary + '30',
            backgroundColor: theme.card,
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

          {readOnly && (
            <View
              style={[
                styles.readOnlyBadge,
                { backgroundColor: theme.primary + '20' },
              ]}
            >
              <Text style={[styles.readOnlyText, { color: theme.primary }]}>
                Read Only
              </Text>
            </View>
          )}

          {saving && !readOnly && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.savingText, { color: theme.textSecondary }]}>
                Saving...
              </Text>
            </View>
          )}

          {hasChanges && !saving && isEditing && !readOnly && (
            <Text style={[styles.unsavedText, { color: theme.primary }]}>
              • Unsaved
            </Text>
          )}
        </View>

        <View style={styles.headerButtons}>
          {/* Share button - only in non-edit mode and not readOnly */}
          {!isEditing && !readOnly && (
            <TouchableOpacity
              onPress={onShare}
              style={[styles.iconButton, { backgroundColor: theme.card }]}
            >
              <Ionicons name="share-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {/* Fullscreen button - only in edit mode, not fullscreen, and not readOnly */}
          {isEditing && !isFullscreen && !readOnly && (
            <TouchableOpacity
              onPress={onToggleFullscreen}
              style={[styles.iconButton, { backgroundColor: theme.card }]}
            >
              <Ionicons name="expand-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {/* Undo/Redo buttons - only in edit mode and not readOnly */}
          {isEditing && !readOnly && (
            <>
              <TouchableOpacity
                onPress={onUndo}
                disabled={!canUndo}
                style={[
                  styles.iconButton,
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
                  styles.iconButton,
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

          {/* Discard button - only in edit mode with changes and not readOnly */}
          {isEditing && hasChanges && !readOnly && (
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

          {/* Edit button - only if not readOnly */}
          {!readOnly && (
            <TouchableOpacity
              onPress={onToggleEditMode}
              style={[
                styles.editButton,
                { backgroundColor: isEditing ? theme.card : theme.primary },
              ]}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={20}
                color={isEditing ? theme.text : 'white'}
              />
              <Text
                style={[
                  styles.editButtonText,
                  { color: isEditing ? theme.text : 'white' },
                ]}
              >
                {isEditing ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          {content ? (
            <Text style={[styles.contentText, { color: theme.text }]}>
              {content}
            </Text>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={{ color: theme.textSecondary }}>File is empty</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Footer Stats */}
      {!isEditing && (
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.textSecondary + '30' },
          ]}
        >
          <Text style={[styles.stats, { color: theme.textSecondary }]}>
            {charCount} characters • {wordCount} words • {lineCount} lines
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
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
  readOnlyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readOnlyText: {
    fontSize: 12,
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
  iconButton: {
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
  content: {
    flex: 1,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    userSelect: 'none', // Prevents text selection
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  stats: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
