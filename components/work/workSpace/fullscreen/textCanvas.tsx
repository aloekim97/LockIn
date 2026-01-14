import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  TextInputContentSizeChangeEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import MarkUpModal from './markUpModal';

interface TextCanvasProps extends TextInputProps {
  theme?: {
    text?: string;
    background?: string;
    textTertiary?: string;
    lineColor?: string;
  };
  containerStyle?: ViewStyle;
  showLineBorders?: boolean;
}

const TextCanvas = forwardRef<TextInput, TextCanvasProps>(
  (
    {
      theme,
      containerStyle,
      style,
      value = '',
      showLineBorders = true,
      onContentSizeChange,
      editable = true,
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

    const flattenStyle = StyleSheet.flatten([
      styles.editor,
      style,
    ]) as TextStyle;
    const fontSize = flattenStyle?.fontSize || 18;
    const lineHeight = flattenStyle?.lineHeight || fontSize * 1.55;

    const lines = value ? value.split('\n') : [];
    const numLines = Math.max(lines.length + 5, 20); // Extra lines for scrolling room

    const handleContentSizeChange = (e: TextInputContentSizeChangeEvent) => {
      setContainerHeight(e.nativeEvent.contentSize.height);
      onContentSizeChange?.(e);
    };

    return (
      <View
        style={[
          styles.nativeContainer,
          containerStyle,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <TextInput
          ref={ref}
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
          value={value}
          editable={editable}
          onContentSizeChange={handleContentSizeChange}
          textAlignVertical="top"
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
                    // 20 is the padding, adjusted slightly for visual baseline alignment
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

        {editable && <MarkUpModal />}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  nativeContainer: { flex: 1, position: 'relative' },
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
