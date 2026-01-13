// components/FullscreenEditor.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import DrawingCanvas from './drawingCanvas';
import FullscreenHeader from './fullscreenHeader';

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
  const [keyboardAllowed, setKeyboardAllowed] = useState(true);
  const [isReadMode, setIsReadMode] = useState(false);

  // Effect to prevent keyboard when mode is 'draw'
  useEffect(() => {
    if (mode === 'draw') {
      setKeyboardAllowed(false);
      Keyboard.dismiss();

      // Add listener to prevent keyboard from showing
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
    } else {
      setKeyboardAllowed(true);
    }
  }, [mode]);
  const toggleReadMode = () => {
    const newReadMode = !isReadMode;
    setIsReadMode(newReadMode);

    if (newReadMode) {
      // When enabling read mode, dismiss keyboard
      Keyboard.dismiss();
    } else {
      // When disabling read mode, focus the input after a delay
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

      // Prevent keyboard from showing
      const subscription = Keyboard.addListener('keyboardDidShow', () => {
        Keyboard.dismiss();
      });

      return () => subscription.remove();
    }
  }, [isReadMode]);

  // Also dismiss keyboard when modal closes
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

    // When switching to draw mode, dismiss keyboard
    if (newMode === 'draw') {
      Keyboard.dismiss();
    }

    // When switching back to text mode, focus the input
    if (newMode === 'text') {
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
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
              isReadMode={isReadMode} // Pass read mode state
              onDiscard={onDiscard}
              onToggleMode={toggleMode}
              onToggleReadMode={toggleReadMode} // Pass toggle function
              onUndo={onUndo}
              onRedo={onRedo}
              onClose={onClose}
            />

            {/* Editor */}
            <View style={{ flex: 1 }}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.editor,
                  {
                    color: theme.text,
                    // Optional: Change background in read mode
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
