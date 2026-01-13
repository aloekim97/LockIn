// components/FileViewerEditor.tsx
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../globalcss';
import { useFileEditor } from '../../../../hooks/work/useFileEditor';
import FullscreenEditor from '../fullscreen/fullScreenEditor';
import PrewviewHeader from './previewHeader';

interface FileViewerEditorProps {
  filePath: string;
  fileName: string;
}

export default function FileViewerEditor({
  filePath,
  fileName,
}: FileViewerEditorProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const errorColor = '#ef4444';

  const {
    content,
    hasChanges,
    loading,
    saving,
    error,
    isEditing,
    isFullscreen,
    canUndo,
    canRedo,
    charCount,
    wordCount,
    lineCount,
    handleContentChange,
    handleShare,
    toggleEditMode,
    toggleFullscreen,
    handleDiscard,
    handleUndo,
    handleRedo,
    loadFile,
  } = useFileEditor({ filePath });

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {/* Header */}
        <PrewviewHeader
          fileName={fileName}
          theme={theme}
          isEditing={isEditing}
          saving={saving}
          hasChanges={hasChanges}
          canUndo={canUndo}
          canRedo={canRedo}
          isFullscreen={isFullscreen}
          errorColor={errorColor}
          onShare={handleShare}
          onToggleEditMode={toggleEditMode}
          onToggleFullscreen={toggleFullscreen}
          onDiscard={handleDiscard}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle" size={48} color={errorColor} />
            <Text style={[styles.errorText, { color: errorColor }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadFile}
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isEditing && !isFullscreen ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              <TextInput
                style={[
                  styles.editor,
                  { color: theme.text, backgroundColor: theme.background },
                ]}
                value={content}
                onChangeText={handleContentChange}
                multiline
                placeholder="Start typing..."
                placeholderTextColor={theme.textTertiary}
                textAlignVertical="top"
                scrollEnabled={true}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : !isEditing ? (
          <ScrollView style={styles.content}>
            {content ? (
              <Text style={[styles.contentText, { color: theme.text }]}>
                {content}
              </Text>
            ) : (
              <View style={styles.centered}>
                <Text style={{ color: theme.textSecondary }}>
                  File is empty
                </Text>
              </View>
            )}
          </ScrollView>
        ) : null}

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

      {/* Fullscreen Editor Modal */}
      <FullscreenEditor
        visible={isFullscreen}
        fileName={fileName}
        content={content}
        saving={saving}
        hasChanges={hasChanges}
        canUndo={canUndo}
        canRedo={canRedo}
        charCount={charCount}
        wordCount={wordCount}
        lineCount={lineCount}
        theme={theme}
        onContentChange={handleContentChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDiscard={handleDiscard}
        onClose={toggleFullscreen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  editor: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
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
