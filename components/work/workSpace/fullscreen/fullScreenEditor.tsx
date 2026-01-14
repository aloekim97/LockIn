import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import CanvasWidget from './canvasWidget';
import FullscreenHeader from './fullscreenHeader';
import FloatingCanvasWidget from './canvasWidget';
import TextCanvas from './textCanvas';

interface FullscreenEditorProps {
  visible: boolean;
  fileName: string;
  content: string;
  saving: boolean;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  charCount: number;
  wordCount: number;
  lineCount: number;
  theme: any;
  onContentChange: (text: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

type EditorMode = 'text' | 'draw';

interface CanvasWidget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FullscreenEditor({
  visible,
  fileName,
  content,
  saving,
  hasChanges,
  canUndo,
  canRedo,
  charCount,
  wordCount,
  lineCount,
  theme,
  onContentChange,
  onUndo,
  onRedo,
  onDiscard,
  onClose,
}: FullscreenEditorProps) {
  const errorColor = '#ef4444';
  const [mode, setMode] = useState<EditorMode>('text');
  const textInputRef = useRef<TextInput>(null);
  const [isReadMode, setIsReadMode] = useState(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const DOUBLE_TAP_DELAY = 400;
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidget[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);

  // Canvas creation state
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
  const [canvasCreationStart, setCanvasCreationStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<CanvasWidget | null>(null);

  const isEditingLocked =
    isReadMode || activeCanvasId !== null || mode === 'draw';

  const handleTouch = (evt: any, isDragging: boolean = false) => {
    const { pageX, pageY } = evt.nativeEvent;
    const now = Date.now();

    if (!isDragging && !isCreatingCanvas) {
      if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
        setIsCreatingCanvas(true);
        setCanvasCreationStart({ x: pageX, y: pageY });
        setPreviewCanvas({
          id: 'preview',
          x: pageX,
          y: pageY,
          width: 0,
          height: 0,
        });
        setLastTap(null);
        Keyboard.dismiss();
      } else {
        setLastTap(now);
      }
    } else if (isCreatingCanvas && canvasCreationStart) {
      const width = Math.abs(pageX - canvasCreationStart.x);
      const height = Math.abs(pageY - canvasCreationStart.y);
      const x = Math.min(pageX, canvasCreationStart.x);
      const y = Math.min(pageY, canvasCreationStart.y);

      setPreviewCanvas({ id: 'preview', x, y, width, height });
    }
  };

  const handleTouchEnd = () => {
    if (isCreatingCanvas && previewCanvas) {
      const minSize = 50;
      if (previewCanvas.width >= minSize && previewCanvas.height >= minSize) {
        const newWidget: CanvasWidget = {
          id: `canvas_${Date.now()}`,
          x: previewCanvas.x,
          y: previewCanvas.y,
          width: previewCanvas.width,
          height: previewCanvas.height,
        };
        setCanvasWidgets((prev) => [...prev, newWidget]);
      }
      setIsCreatingCanvas(false);
      setCanvasCreationStart(null);
      setPreviewCanvas(null);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'text' ? 'draw' : 'text';
    setMode(newMode);
    if (newMode === 'draw') Keyboard.dismiss();
  };

  const toggleReadMode = () => {
    setIsReadMode(!isReadMode);
    if (!isReadMode) Keyboard.dismiss();
  };

  const addCanvasWidget = () => {
    const newWidget: CanvasWidget = {
      id: `canvas_${Date.now()}`,
      x: 50,
      y: 150,
      width: 300,
      height: 400,
    };
    setCanvasWidgets((prev) => [...prev, newWidget]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {mode === 'draw' ? (
        <CanvasWidget theme={theme} onClose={toggleMode} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: theme.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FullscreenHeader
            fileName={fileName}
            theme={theme}
            hasChanges={hasChanges}
            canUndo={canUndo}
            canRedo={canRedo}
            errorColor={errorColor}
            mode={mode}
            isReadMode={isReadMode}
            onDiscard={onDiscard}
            onToggleMode={toggleMode}
            onToggleReadMode={toggleReadMode}
            onUndo={onUndo}
            onRedo={onRedo}
            onClose={onClose}
            onAddCanvas={addCanvasWidget}
          />

          <View style={{ flex: 1 }}>
            <TextCanvas
              ref={textInputRef}
              theme={theme}
              value={content}
              onChangeText={onContentChange}
              placeholder="Start typing..."
              editable={!isEditingLocked && !isCreatingCanvas}
              style={{
                backgroundColor: isReadMode
                  ? theme.background + '80'
                  : theme.background,
              }}
            />

            {/* Overlay for detecting double-tap to create canvas */}
            <View
              style={StyleSheet.absoluteFill}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => isCreatingCanvas}
              onResponderGrant={(e) => handleTouch(e)}
              onResponderMove={(e) => handleTouch(e, true)}
              onResponderRelease={handleTouchEnd}
              pointerEvents={isCreatingCanvas ? 'auto' : 'box-none'}
            />

            {previewCanvas && previewCanvas.width > 0 && (
              <View
                style={{
                  position: 'absolute',
                  left: previewCanvas.x,
                  top: previewCanvas.y,
                  width: previewCanvas.width,
                  height: previewCanvas.height,
                  borderWidth: 2,
                  borderColor: theme.textSecondary,
                  borderStyle: 'dashed',
                  backgroundColor: theme.background + '40',
                  borderRadius: 8,
                }}
                pointerEvents="none"
              />
            )}

            {canvasWidgets.map((widget) => (
              <FloatingCanvasWidget
                key={widget.id}
                theme={theme}
                initialX={widget.x}
                initialY={widget.y}
                initialWidth={widget.width}
                initialHeight={widget.height}
                onClose={() =>
                  setCanvasWidgets((prev) =>
                    prev.filter((w) => w.id !== widget.id)
                  )
                }
                onInteractionStart={() => {
                  setActiveCanvasId(widget.id);
                  Keyboard.dismiss();
                }}
                onInteractionEnd={() => setActiveCanvasId(null)}
              />
            ))}
          </View>

          <View
            style={[
              styles.footer,
              { borderTopColor: theme.textSecondary + '30' },
            ]}
          >
            <Text style={[styles.stats, { color: theme.textSecondary }]}>
              {charCount} chars • {wordCount} words • {canvasWidgets.length}{' '}
              canvases
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  stats: { fontSize: 12, fontStyle: 'italic' },
});
