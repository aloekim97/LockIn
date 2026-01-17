// work on dropdown options for read button
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageMode } from './fullScreenEditor';

interface FullscreenHeaderProps {
  fileName: string;
  theme: any;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  errorColor: string;
  mode: PageMode;
  isReadMode: boolean;
  onDiscard: () => void;
  onToggleMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onAddCanvas?: () => void;
  setTextCanvasMode: (mode: PageMode) => void;
}

export default function FullscreenHeader({
  fileName,
  theme,
  hasChanges,
  canUndo,
  canRedo,
  errorColor,
  mode,
  isReadMode,
  onDiscard,
  onToggleMode,
  onUndo,
  onRedo,
  onClose,
  onAddCanvas,
  setTextCanvasMode,
}: FullscreenHeaderProps) {
  const handleRead = () => {
    if (mode === 'Read') setTextCanvasMode('Draw');
    else setTextCanvasMode('Read');
  };
  return (
    <View
      style={[styles.header, { borderBottomColor: theme.textSecondary + '30' }]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onClose} style={[styles.closeButton]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text
          style={[styles.fileName, { color: theme.text }]}
          numberOfLines={1}
        >
          {fileName}
        </Text>
        {mode === 'Read' && (
          <View
            style={[
              styles.readModeBadge,
              { backgroundColor: theme.primary + '20' },
            ]}
          >
            <Text style={[styles.readModeText, { color: theme.primary }]}>
              Read Only
            </Text>
          </View>
        )}
      </View>

      {/* <TouchableOpacity
        onPress={onAddCanvas}
        style={[styles.iconButton, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="add-circle" size={20} color="white" />
      </TouchableOpacity> */}

      <View style={styles.headerButtons}>
        {/* Read Mode Toggle Button */}
        <TouchableOpacity
          onPress={handleRead}
          style={[
            styles.readModeButton,
            {
              backgroundColor: isReadMode ? theme.primary : theme.card,
              borderColor: theme.primary,
              borderWidth: isReadMode ? 0 : 1,
            },
          ]}
        >
          <Ionicons
            name={isReadMode ? 'eye' : 'eye-off'}
            size={20}
            color={isReadMode ? 'white' : theme.primary}
          />
        </TouchableOpacity>

        {hasChanges && !isReadMode && (
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

        {!isReadMode && (
          <TouchableOpacity
            onPress={onToggleMode}
            style={[styles.modeButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons
              name={mode === 'Text' ? 'brush' : 'create-outline'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        )}

        {!isReadMode && (
          <>
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
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: 16,
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
  readModeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  readModeButton: {
    padding: 8,
    borderRadius: 6,
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
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
});
