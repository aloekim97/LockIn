// hooks/useFileEditor.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { readFile, writeFile, shareFile } from '../../utils/fileSystem';

interface UseFileEditorProps {
  filePath: string;
}

interface HistoryEntry {
  content: string;
  timestamp: number;
}

interface UseFileEditorReturn {
  // Content state
  content: string;
  originalContent: string;
  hasChanges: boolean;

  // UI state
  loading: boolean;
  saving: boolean;
  error: string;
  isEditing: boolean;
  isFullscreen: boolean;

  // Undo/Redo state
  canUndo: boolean;
  canRedo: boolean;

  // Stats
  charCount: number;
  wordCount: number;
  lineCount: number;

  // Actions
  handleContentChange: (newContent: string) => void;
  handleShare: () => Promise<void>;
  toggleEditMode: () => void;
  toggleFullscreen: () => void;
  handleDiscard: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  loadFile: () => Promise<void>;
}

const MAX_HISTORY = 50; // Keep last 50 changes

export function useFileEditor({
  filePath,
}: UseFileEditorProps): UseFileEditorReturn {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasChanges = content !== originalContent;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Calculate stats
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;

  // Cleanup on unmount
  useEffect(() => {
    loadFile();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [filePath]);

  const loadFile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const fileContent = await readFile(filePath);
      setContent(fileContent);
      setOriginalContent(fileContent);
      setIsEditing(false);
      setIsFullscreen(false);

      // Initialize history with the loaded content
      setHistory([{ content: fileContent, timestamp: Date.now() }]);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Failed to load file');
      setContent('');
      setOriginalContent('');
      setHistory([]);
      setCurrentIndex(-1);
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  const saveFile = useCallback(
    async (contentToSave: string) => {
      try {
        setSaving(true);
        await writeFile(filePath, contentToSave, false);
        setOriginalContent(contentToSave);
        setError('');
      } catch (err) {
        console.error('Failed to save file:', err);
        setError('Failed to save changes');
      } finally {
        setSaving(false);
      }
    },
    [filePath]
  );

  const addToHistory = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        // Remove any "future" history if we're not at the end
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new entry
        newHistory.push({
          content: newContent,
          timestamp: Date.now(),
        });

        // Keep only MAX_HISTORY entries
        if (newHistory.length > MAX_HISTORY) {
          return newHistory.slice(-MAX_HISTORY);
        }

        return newHistory;
      });

      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
      });
    },
    [currentIndex]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setError('');

      // Add to history after 1 second of no typing (debounced)
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }

      historyTimeoutRef.current = setTimeout(() => {
        addToHistory(newContent);
      }, 1000);

      // Auto-save after 1.5 seconds of no typing
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveFile(newContent);
      }, 1500);
    },
    [addToHistory, saveFile]
  );

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const previousContent = history[newIndex].content;
      setContent(previousContent);

      // Clear pending timers
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Auto-save the undo
      saveFile(previousContent);
    }
  }, [canUndo, currentIndex, history, saveFile]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const nextContent = history[newIndex].content;
      setContent(nextContent);

      // Clear pending timers
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Auto-save the redo
      saveFile(nextContent);
    }
  }, [canRedo, currentIndex, history, saveFile]);

  const handleShare = useCallback(async () => {
    try {
      // Save first to ensure latest content
      if (hasChanges) {
        await saveFile(content);
      }
      await shareFile(filePath);
    } catch (err) {
      console.error('Failed to share file:', err);
      setError('Failed to share file');
    }
  }, [content, hasChanges, filePath, saveFile]);

  const toggleEditMode = useCallback(() => {
    if (isEditing && hasChanges) {
      // Save immediately when exiting edit mode
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      saveFile(content);
    }
    setIsEditing(!isEditing);
    setIsFullscreen(false);
  }, [isEditing, hasChanges, content, saveFile]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleDiscard = useCallback(() => {
    setContent(originalContent);
    setIsEditing(false);
    setIsFullscreen(false);

    // Reset history to original content
    setHistory([{ content: originalContent, timestamp: Date.now() }]);
    setCurrentIndex(0);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
  }, [originalContent]);

  return {
    // Content state
    content,
    originalContent,
    hasChanges,

    // UI state
    loading,
    saving,
    error,
    isEditing,
    isFullscreen,

    // Undo/Redo state
    canUndo,
    canRedo,

    // Stats
    charCount,
    wordCount,
    lineCount,

    // Actions
    handleContentChange,
    handleShare,
    toggleEditMode,
    toggleFullscreen,
    handleDiscard,
    handleUndo,
    handleRedo,
    loadFile,
  };
}
