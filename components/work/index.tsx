// components/Work.tsx
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import LeftBox from '../../ui/nonspecific/left-box';
import RightBox from '../../ui/nonspecific/right-box';
import { Colors } from '../../globalcss';
import WorkList from './workList';
import FilePreview from './workSpace/preview/filePreview';
import FullscreenEditor from './workSpace/fullscreen/fullScreenEditor';
import { useFileEditor } from '../../hooks/work/useFileEditor';

interface FilePreviewWrapperProps {
  filePath: string;
  fileName: string;
}

function FilePreviewWrapper({ filePath, fileName }: FilePreviewWrapperProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  console.log('📦 FilePreviewWrapper rendering:', { filePath, fileName });

  const {
    content,
    hasChanges,
    loading,
    saving,
    error,
    canUndo,
    canRedo,
    charCount,
    wordCount,
    lineCount,
    handleContentChange,
    handleShare,
    handleUndo,
    handleRedo,
    handleDiscard,
    loadFile,
  } = useFileEditor({ filePath });

  console.log('📊 useFileEditor state:', {
    loading,
    error,
    contentLength: content?.length || 0,
  });

  const handleOpenFullscreen = () => {
    setIsFullscreenOpen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  return (
    <>
      <FilePreview
        fileName={fileName}
        theme={theme}
        content={content}
        loading={loading}
        saving={saving}
        hasChanges={hasChanges}
        canUndo={canUndo}
        canRedo={canRedo}
        error={error}
        readOnly={false}
        charCount={charCount}
        wordCount={wordCount}
        lineCount={lineCount}
        onShare={handleShare}
        onToggleEditMode={handleOpenFullscreen}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDiscard={handleDiscard}
        onRetry={loadFile}
      />

      <FullscreenEditor
        visible={isFullscreenOpen}
        fileName={fileName}
        filePath={filePath}
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
        onClose={handleCloseFullscreen}
      />
    </>
  );
}

interface SelectedFile {
  path: string;
  name: string;
}

export default function Work() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  const handleFileSelect = (path: string, isDirectory: boolean) => {
    if (!isDirectory) {
      const fileName = path.split('/').pop() || path;
      setSelectedFile({ path, name: fileName });
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <View
      style={[localStyles.container, { backgroundColor: theme.background }]}
    >
      <LeftBox>
        <WorkList setSelected={handleFileSelect} />
      </LeftBox>

      <RightBox>
        {selectedFile ? (
          <FilePreviewWrapper
            key={selectedFile.path}
            filePath={selectedFile.path}
            fileName={selectedFile.name}
          />
        ) : (
          <View style={localStyles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.textSecondary + '50'}
            />
            <Text
              style={[localStyles.emptyText, { color: theme.textSecondary }]}
            >
              Select a file to preview
            </Text>
          </View>
        )}
      </RightBox>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
