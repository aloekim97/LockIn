import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilePreviewProps {
  fileName: string;
  theme: any;
  content: string;
  loading?: boolean;
  saving?: boolean;
  hasChanges?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  error?: string | null;
  readOnly?: boolean;
  charCount?: number;
  wordCount?: number;
  lineCount?: number;
  onShare?: () => void;
  onToggleEditMode?: () => void;
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
  canUndo = false,
  canRedo = false,
  error = null,
  readOnly = false,
  charCount = 0,
  wordCount = 0,
  lineCount = 0,
  onShare = () => {},
  onToggleEditMode = () => {},
  onDiscard = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onRetry = () => {},
}: FilePreviewProps) {
  const errorColor = '#ef4444';

  // Debug logging
  console.log('🖼️ FilePreview rendering:', {
    fileName,
    loading,
    error,
    contentLength: content?.length || 0,
    hasContent: !!content,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.textSecondary + '30' },
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
              style={[styles.badge, { backgroundColor: theme.primary + '20' }]}
            >
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                Read Only
              </Text>
            </View>
          )}

          {saving && (
            <View
              style={[styles.badge, { backgroundColor: theme.primary + '20' }]}
            >
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                Saving...
              </Text>
            </View>
          )}

          {hasChanges && !saving && (
            <View style={[styles.badge, { backgroundColor: '#f59e0b20' }]}>
              <Text style={[styles.badgeText, { color: '#f59e0b' }]}>
                Unsaved
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {/* Undo/Redo buttons */}
          {!readOnly && (
            <>
              <TouchableOpacity
                onPress={onUndo}
                disabled={!canUndo}
                style={[
                  styles.iconButton,
                  !canUndo && styles.iconButtonDisabled,
                ]}
              >
                <Ionicons
                  name="arrow-undo"
                  size={20}
                  color={canUndo ? theme.text : theme.textSecondary + '50'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRedo}
                disabled={!canRedo}
                style={[
                  styles.iconButton,
                  !canRedo && styles.iconButtonDisabled,
                ]}
              >
                <Ionicons
                  name="arrow-redo"
                  size={20}
                  color={canRedo ? theme.text : theme.textSecondary + '50'}
                />
              </TouchableOpacity>

              {hasChanges && (
                <TouchableOpacity onPress={onDiscard} style={styles.iconButton}>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={errorColor}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Edit button */}
          {!readOnly && (
            <TouchableOpacity
              onPress={onToggleEditMode}
              style={[styles.iconButton, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Share button */}
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading file...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {content ? (
            <Text style={[styles.contentText, { color: theme.text }]}>
              {content}
            </Text>
          ) : (
            <View style={styles.emptyContent}>
              <Ionicons
                name="document-outline"
                size={48}
                color={theme.textSecondary + '50'}
              />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                File is empty
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Footer Stats */}
      <View
        style={[styles.footer, { borderTopColor: theme.textSecondary + '30' }]}
      >
        <Text style={[styles.stats, { color: theme.textSecondary }]}>
          {charCount} characters • {wordCount} words • {lineCount} lines
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  stats: {
    fontSize: 12,
  },
});
