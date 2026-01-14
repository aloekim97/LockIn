// components/FullscreenEditor.tsx
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
  PanResponder,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import DrawingCanvas from './drawingCanvas';
import FullscreenHeader from './fullscreenHeader';
import FloatingCanvasWidget from './canvasWidget';

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
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [mode, setMode] = useState<EditorMode>('text');
  const textInputRef = useRef<TextInput>(null);
  const [isReadMode, setIsReadMode] = useState(false);
  
  // Canvas widgets state
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidget[]>([]);

  // Effect to prevent keyboard when mode is 'draw'
  useEffect(() => {
    if (mode === 'draw') {
      Keyboard.dismiss();

      const keyboardDidShowSubscription = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          if (mode === 'draw') {
            Keyboard.dismiss();
          }
        }
      );

      return () => {
        keyboardDidShowSubscription.remove();
      };
    }
  }, [mode]);

  const toggleReadMode = () => {
    const newReadMode = !isReadMode;
    setIsReadMode(newReadMode);

    if (newReadMode) {
      Keyboard.dismiss();
    } else {
      setTimeout(() => {
        if (textInputRef.current && mode === 'text') {
          textInputRef.current.focus();
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (isReadMode) {
      Keyboard.dismiss();

      const subscription = Keyboard.addListener('keyboardDidShow', () => {
        Keyboard.dismiss();
      });

      return () => subscription.remove();
    }
  }, [isReadMode]);

  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,

      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        logTouch(pageX, pageY, 'TAP');
      },

      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        logTouch(pageX, pageY, 'MOVE');
      },
    })
  ).current;

  const logTouch = (pageX: number, pageY: number, type: string) => {
    const xPercent = ((pageX / screenWidth) * 100).toFixed(1);
    const yPercent = ((pageY / screenHeight) * 100).toFixed(1);

    console.log(`👆 ${type}:`);
    console.log(`  📍 (${Math.round(pageX)}, ${Math.round(pageY)})`);
    console.log(`  📊 X=${xPercent}%, Y=${yPercent}%`);
  };

  const toggleMode = () => {
    const newMode = mode === 'text' ? 'draw' : 'text';
    setMode(newMode);

    if (newMode === 'draw') {
      Keyboard.dismiss();
    }

    if (newMode === 'text') {
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Add a new canvas widget
  const addCanvasWidget = () => {
    const newWidget: CanvasWidget = {
      id: `canvas_${Date.now()}`,
      x: 50 + canvasWidgets.length * 30, // Offset each new widget
      y: 100 + canvasWidgets.length * 30,
      width: 300,
      height: 400,
    };
    setCanvasWidgets((prev) => [...prev, newWidget]);
    console.log(`🎨 Added canvas widget: ${newWidget.id}`);
  };

  // Remove a canvas widget
  const removeCanvasWidget = (id: string) => {
    setCanvasWidgets((prev) => prev.filter((widget) => widget.id !== id));
    console.log(`🗑️ Removed canvas widget: ${id}`);
  };

  // Update canvas widget position/size
  const updateCanvasWidget = (id: string, x: number, y: number, width: number, height: number) => {
    setCanvasWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, x, y, width, height } : widget
      )
    );
    console.log(`📍 Updated canvas widget ${id}: (${x}, ${y}) ${width}x${height}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {mode === 'draw' ? (
        <DrawingCanvas theme={theme} onClose={toggleMode} />
      ) : (
        <KeyboardAvoidingView
          style={[{ flex: 1 }, { backgroundColor: theme.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
            {...panResponder.panHandlers}
          >
            {/* Header */}
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
              onAddCanvas={addCanvasWidget} // Add this prop to your header
            />

            {/* Editor */}
            <View style={{ flex: 1 }}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.editor,
                  {
                    color: theme.text,
                    backgroundColor: isReadMode
                      ? theme.background + '80'
                      : theme.background,
                  },
                ]}
                value={content}
                onChangeText={onContentChange}
                multiline
                placeholder="Start typing..."
                placeholderTextColor={theme.textTertiary}
                textAlignVertical="top"
                autoFocus={!isReadMode && mode === 'text'}
                showSoftInputOnFocus={!isReadMode}
                editable={!isReadMode}
                scrollEnabled={true}
                pointerEvents={isReadMode ? 'none' : 'auto'}
              />

              {/* Floating Canvas Widgets */}
              {canvasWidgets.map((widget) => (
                <FloatingCanvasWidget
                  key={widget.id}
                  theme={theme}
                  initialX={widget.x}
                  initialY={widget.y}
                  initialWidth={widget.width}
                  initialHeight={widget.height}
                  onClose={() => removeCanvasWidget(widget.id)}
                  onPositionChange={(x, y, width, height) =>
                    updateCanvasWidget(widget.id, x, y, width, height)
                  }
                />
              ))}
            </View>

            {/* Footer */}
            <View
              style={[
                styles.footer,
                { borderTopColor: theme.textSecondary + '30' },
              ]}
            >
              <Text style={[styles.stats, { color: theme.textSecondary }]}>
                {charCount} characters • {wordCount} words • {lineCount} lines
                {canvasWidgets.length > 0 && ` • ${canvasWidgets.length} canvas${canvasWidgets.length > 1 ? 'es' : ''}`}
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  editor: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    padding: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  stats: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});