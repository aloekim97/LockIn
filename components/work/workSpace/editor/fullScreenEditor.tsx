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
import { useRef, useState } from 'react';
import DrawingCanvas from './drawingCanvas';

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
    setMode((prev) => (prev === 'text' ? 'draw' : 'text'));
    if (mode === 'text') {
      Keyboard.dismiss();
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
                {saving && (
                  <View style={styles.savingIndicator}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text
                      style={[
                        styles.savingText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Saving...
                    </Text>
                  </View>
                )}
                {hasChanges && !saving && (
                  <Text style={[styles.unsavedText, { color: theme.primary }]}>
                    • Unsaved
                  </Text>
                )}
              </View>

              <View style={styles.headerButtons}>
                {hasChanges && (
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

                <TouchableOpacity
                  onPress={toggleMode}
                  style={[
                    styles.modeButton,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Ionicons name="brush" size={20} color="white" />
                </TouchableOpacity>

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

                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: theme.card }]}
                >
                  <Ionicons
                    name="contract-outline"
                    size={20}
                    color={theme.text}
                  />
                  <Text style={[styles.buttonText, { color: theme.text }]}>
                    Exit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Editor */}
            <View style={{ flex: 1 }} onTouchStart={() => Keyboard.dismiss()}>
              <TextInput
                style={[styles.editor, { color: theme.text }]}
                value={content}
                onChangeText={onContentChange}
                multiline
                placeholder="Start typing..."
                placeholderTextColor={theme.textTertiary}
                textAlignVertical="top"
                autoFocus
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 12,
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
  discardButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modeButton: {
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
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
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
