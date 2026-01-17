import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import FullscreenHeader from './fullscreenHeader';
import FloatingCanvasWidget from './canvasWidget';
import TextCanvas from './textCanvas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export type PageMode = 'Text' | 'Write' | 'Draw' | 'Erase' | 'Read' | null;

interface FullscreenEditorProps {
  visible: boolean;
  fileName: string;
  filePath: string;
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
  filePath,
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
  const textCanvasRef = useRef<any>(null);
  const [isReadMode, setIsReadMode] = useState(true);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const DOUBLE_TAP_DELAY = 400;
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidget[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [textCanvasMode, setTextCanvasMode] = useState<PageMode>('Read');

  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
  const [canvasCreationStart, setCanvasCreationStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<CanvasWidget | null>(null);

  const isEditingLocked =
    textCanvasMode === 'Read' ||
    activeCanvasId !== null ||
    textCanvasMode === 'Draw' ||
    textCanvasMode === 'Write';

  useEffect(() => {
    if (isEditingLocked || isCreatingCanvas) {
      Keyboard.dismiss();
      const sub = Keyboard.addListener('keyboardDidShow', () =>
        Keyboard.dismiss()
      );
      return () => sub.remove();
    }
  }, [isEditingLocked, isCreatingCanvas]);

  const handleTouch = (evt: any, isDragging: boolean = false) => {
    if (textCanvasMode === 'Draw' || textCanvasMode === 'Write') return;
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
      } else setLastTap(now);
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
      if (previewCanvas.width >= 50 && previewCanvas.height >= 50) {
        const newWidget: CanvasWidget = {
          id: `canvas_${Date.now()}`,
          x: previewCanvas.x,
          y: previewCanvas.y,
          width: previewCanvas.width,
          height: previewCanvas.height,
        };
        setCanvasWidgets((prev) => [...prev, newWidget]);
        setActiveCanvasId(newWidget.id);
      }
      setIsCreatingCanvas(false);
      setCanvasCreationStart(null);
      setPreviewCanvas(null);
    }
  };

  const toggleReadMode = () => {
    setIsReadMode(!isReadMode);
    if (!isReadMode) Keyboard.dismiss();
  };

  const addCanvasWidget = () => {
    const newWidget: CanvasWidget = {
      id: `canvas_${Date.now()}`,
      x: 50 + canvasWidgets.length * 30,
      y: 100 + canvasWidgets.length * 30,
      width: 300,
      height: 400,
    };
    setCanvasWidgets((prev) => [...prev, newWidget]);
    setActiveCanvasId(newWidget.id);
    Keyboard.dismiss();
  };

  const handleTextCanvasModeChange = (newMode: PageMode) => {
    setTextCanvasMode(newMode);
    if (newMode === 'Draw' || newMode === 'Write' || newMode === 'Read')
      Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
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
          isReadMode={isReadMode}
          onDiscard={onDiscard}
          setTextCanvasMode={setTextCanvasMode}
          onUndo={onUndo}
          onRedo={onRedo}
          onClose={onClose}
          onAddCanvas={addCanvasWidget}
          mode={textCanvasMode}
          onToggleMode={() => {
            const nextMode = textCanvasMode === 'Draw' ? null : 'Draw';
            handleTextCanvasModeChange(nextMode);
          }}
        />

        <View style={{ flex: 1 }}>
          <TextCanvas
            ref={textCanvasRef}
            filePath={filePath}
            theme={theme}
            placeholder="Start typing..."
            editable={!isEditingLocked && !isCreatingCanvas}
            onModeChange={handleTextCanvasModeChange}
            pointerEvents={
              textCanvasMode === 'Draw' || textCanvasMode === 'Write'
                ? 'none'
                : 'auto'
            }
            pageMode={textCanvasMode}
          />

          {/* Touch handler for canvas creation */}
          {textCanvasMode !== 'Draw' && textCanvasMode !== 'Write' && (
            <View
              style={StyleSheet.absoluteFill}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => isCreatingCanvas}
              onResponderGrant={(e) => handleTouch(e)}
              onResponderMove={(e) => handleTouch(e, true)}
              onResponderRelease={handleTouchEnd}
              pointerEvents={
                isCreatingCanvas || textCanvasMode === null
                  ? 'auto'
                  : 'box-none'
              }
            />
          )}

          {/* Preview canvas during creation */}
          {previewCanvas && previewCanvas.width > 0 && (
            <View
              style={{
                position: 'absolute',
                left: previewCanvas.x,
                top: previewCanvas.y,
                width: previewCanvas.width,
                height: previewCanvas.height,
                borderWidth: 2,
                borderColor: theme.primary || theme.text,
                borderStyle: 'dashed',
                backgroundColor: theme.background + '40',
                borderRadius: 8,
              }}
              pointerEvents="none"
            />
          )}

          {/* Floating canvas widgets */}
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
              onPositionChange={(x, y, width, height) => {
                setCanvasWidgets((prev) =>
                  prev.map((w) =>
                    w.id === widget.id ? { ...w, x, y, width, height } : w
                  )
                );
              }}
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
            {charCount} chars • {wordCount} words • {lineCount} lines
            {canvasWidgets.length > 0 &&
              ` • ${canvasWidgets.length} floating canvas${
                canvasWidgets.length > 1 ? 'es' : ''
              }`}
            {textCanvasMode && ` • Mode: ${textCanvasMode}`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  stats: { fontSize: 12, fontStyle: 'italic' },
});
