import React, {
  forwardRef,
  useState,
  useCallback,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  TextInput,
  TextInputProps,
  TextInputContentSizeChangeEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
  Keyboard,
  Text,
  ActivityIndicator,
} from 'react-native';
import MarkUpModal from './markUpModal';
import InlineDrawingCanvas from './inlineDrawingCanvas';
import { readFile, writeFile } from '../../../../utils/fileSystem';

export type MarkupMode = 'Text' | 'Write' | 'Draw' | 'Erase' | null;

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

export interface MarkupData {
  text: string;
  drawingPaths: DrawingPath[];
  writingPaths: DrawingPath[];
  metadata?: {
    createdAt: string;
    lastModified: string;
    version: string;
  };
}

interface TextCanvasProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  filePath: string;
  theme?: {
    text?: string;
    background?: string;
    textTertiary?: string;
    lineColor?: string;
  };
  containerStyle?: ViewStyle;
  showLineBorders?: boolean;
  onModeChange?: (mode: MarkupMode) => void;
  onDataChange?: (data: MarkupData) => void;
}

export interface TextCanvasRef {
  getData: () => MarkupData;
  saveMarkup: () => Promise<void>;
  loadMarkup: () => Promise<void>;
  clearDrawings: () => void;
  clearWritings: () => void;
  clearAll: () => void;
}

const TextCanvas = forwardRef<TextCanvasRef, TextCanvasProps>(
  (
    {
      filePath,
      theme,
      containerStyle,
      style,
      showLineBorders = true,
      onContentSizeChange,
      editable = true,
      onModeChange,
      onDataChange,
      ...props
    },
    ref
  ) => {
    const defaultTheme = {
      text: '#000000',
      background: '#FFFFFF',
      textTertiary: '#888888',
      lineColor: '#F3F4F6',
    };

    const currentTheme = theme || defaultTheme;
    const [containerHeight, setContainerHeight] = useState(0);
    const [mode, setMode] = useState<MarkupMode>(null);
    const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
    const [writingPaths, setWritingPaths] = useState<DrawingPath[]>([]);
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(true);

    const flattenStyle = StyleSheet.flatten([
      styles.editor,
      style,
    ]) as TextStyle;

    const fontSize = flattenStyle?.fontSize || 18;
    const lineHeight = flattenStyle?.lineHeight || fontSize * 1.55;
    const lines = textContent ? textContent.split('\n') : [];
    const numLines = Math.max(lines.length + 5, 20);

    const getMarkupFilePath = useCallback(() => {
      const pathWithoutExt = filePath.replace(/\.txt$/, '');
      return `${pathWithoutExt}.markup.json`;
    }, [filePath]);

    const loadMarkup = useCallback(async () => {
      try {
        setLoading(true);

        const content = await readFile(filePath);
        setTextContent(content);

        try {
          const markupPath = getMarkupFilePath();
          const markupJson = await readFile(markupPath);
          const markupData: MarkupData = JSON.parse(markupJson);

          setDrawingPaths(markupData.drawingPaths || []);
          setWritingPaths(markupData.writingPaths || []);
        } catch (err) {
          setDrawingPaths([]);
          setWritingPaths([]);
        }
      } catch (error) {
        console.error('Failed to load markup:', error);
      } finally {
        setLoading(false);
      }
    }, [filePath, getMarkupFilePath]);

    const saveMarkup = useCallback(async () => {
      try {
        const markupData: MarkupData = {
          text: textContent,
          drawingPaths,
          writingPaths,
          metadata: {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0',
          },
        };

        const markupPath = getMarkupFilePath();
        await writeFile(markupPath, JSON.stringify(markupData, null, 2), false);

        onDataChange?.(markupData);
      } catch (error) {
        console.error('Failed to save markup:', error);
        throw error;
      }
    }, [
      textContent,
      drawingPaths,
      writingPaths,
      getMarkupFilePath,
      onDataChange,
    ]);

    useEffect(() => {
      if (!loading && (drawingPaths.length > 0 || writingPaths.length > 0)) {
        const timer = setTimeout(() => {
          saveMarkup();
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [drawingPaths, writingPaths, loading, saveMarkup]);

    useEffect(() => {
      loadMarkup();
    }, [filePath]);

    useImperativeHandle(ref, () => ({
      getData: (): MarkupData => ({
        text: textContent,
        drawingPaths,
        writingPaths,
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: '1.0',
        },
      }),
      saveMarkup,
      loadMarkup,
      clearDrawings: () => {
        setDrawingPaths([]);
        saveMarkup();
      },
      clearWritings: () => {
        setWritingPaths([]);
        saveMarkup();
      },
      clearAll: () => {
        setTextContent('');
        setDrawingPaths([]);
        setWritingPaths([]);
        saveMarkup();
      },
    }));

    const handleContentSizeChange = (e: TextInputContentSizeChangeEvent) => {
      setContainerHeight(e.nativeEvent.contentSize.height);
      onContentSizeChange?.(e);
    };

    const handleModeChange = useCallback(
      (newMode: MarkupMode) => {
        setMode(newMode);
        onModeChange?.(newMode);

        if (newMode === 'Write' || newMode === 'Draw') {
          Keyboard.dismiss();
        }
      },
      [onModeChange]
    );

    const handleTextChange = useCallback((text: string) => {
      setTextContent(text);
    }, []);

    const handleDrawingPathsChange = useCallback((paths: DrawingPath[]) => {
      setDrawingPaths(paths);
    }, []);

    const handleWritingPathsChange = useCallback((paths: DrawingPath[]) => {
      setWritingPaths(paths);
    }, []);

    const isTextInputEditable = editable && (mode === null || mode === 'Text');

    if (loading) {
      return (
        <View
          style={[
            styles.nativeContainer,
            styles.loadingContainer,
            containerStyle,
          ]}
        >
          <ActivityIndicator size="large" color={currentTheme.text} />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.nativeContainer,
          containerStyle,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <TextInput
          style={[
            styles.editor,
            {
              color: currentTheme.text,
              lineHeight: lineHeight,
              opacity: editable ? 1 : 0.8,
            },
            style,
          ]}
          placeholderTextColor={currentTheme.textTertiary}
          multiline
          value={textContent}
          editable={isTextInputEditable}
          onContentSizeChange={handleContentSizeChange}
          textAlignVertical="top"
          onChangeText={handleTextChange}
          {...props}
        />

        {showLineBorders && (
          <View
            style={[
              styles.lineContainer,
              { height: Math.max(containerHeight, numLines * lineHeight) },
            ]}
            pointerEvents="none"
          >
            {Array.from({ length: numLines }).map((_, index) => (
              <View
                key={`line-${index}`}
                style={[
                  styles.line,
                  {
                    top:
                      index * lineHeight +
                      (Platform.OS === 'ios' ? 20 : 22) +
                      lineHeight,
                    borderBottomColor: currentTheme.lineColor,
                    borderBottomWidth: 1,
                    opacity: editable
                      ? index < lines.length
                        ? 0.8
                        : 0.3
                      : 0.1,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {mode === 'Draw' && (
          <InlineDrawingCanvas
            paths={drawingPaths}
            onPathsChange={handleDrawingPathsChange}
            color="#FF0000"
            strokeWidth={3}
          />
        )}

        {mode === 'Write' && (
          <InlineDrawingCanvas
            paths={writingPaths}
            onPathsChange={handleWritingPathsChange}
            color="#0000FF"
            strokeWidth={2}
          />
        )}

        {(mode === 'Draw' || 'Write') && (
          <MarkUpModal onModeChange={handleModeChange} currentMode={mode} />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  nativeContainer: { flex: 1, position: 'relative' },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editor: {
    flex: 1,
    fontSize: 18,
    padding: 20,
    zIndex: 1,
    paddingTop: 20,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 0,
  },
  line: { position: 'absolute', left: 20, right: 20, height: 1 },
});

export default TextCanvas;
