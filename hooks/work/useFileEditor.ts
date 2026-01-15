// hooks/useFileEditor.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { readFile, writeFile, shareFile } from '../../utils/fileSystem';
import { MarkupData } from '../../components/work/workSpace/fullscreen/textCanvas';

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

  // Markup data
  markupData: MarkupData | null;

  // Actions
  handleContentChange: (newContent: string) => void;
  handleShare: () => Promise<void>;
  toggleEditMode: () => void;
  toggleFullscreen: () => void;
  handleDiscard: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  loadFile: () => Promise<void>;
  setMarkupData: (data: MarkupData) => void;
  saveMarkup: () => Promise<void>;
}

const MAX_HISTORY = 50;

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
  const [markupData, setMarkupData] = useState<MarkupData | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markupSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasChanges = content !== originalContent;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Calculate stats
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;

  // Get markup file path
  const getMarkupFilePath = useCallback(() => {
    const pathWithoutExt = filePath.replace(/\.txt$/, '');
    return `${pathWithoutExt}.markup.json`;
  }, [filePath]);

  // Cleanup on unmount
  useEffect(() => {
    loadFile();
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      if (markupSaveTimeoutRef.current) clearTimeout(markupSaveTimeoutRef.current);
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

      // Try to load markup data
      try {
        const markupPath = getMarkupFilePath();
        const markupJson = await readFile(markupPath);
        const data: MarkupData = JSON.parse(markupJson);
        setMarkupData(data);
      } catch (err) {
        // No markup file exists yet
        setMarkupData(null);
      }
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Failed to load file');
      setContent('');
      setOriginalContent('');
      setHistory([]);
      setCurrentIndex(-1);
      setMarkupData(null);
    } finally {
      setLoading(false);
    }
  }, [filePath, getMarkupFilePath]);

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

  const saveMarkup = useCallback(async () => {
    if (!markupData) return;

    try {
      const markupPath = getMarkupFilePath();
      await writeFile(markupPath, JSON.stringify(markupData, null, 2), false);
    } catch (err) {
      console.error('Failed to save markup:', err);
    }
  }, [markupData, getMarkupFilePath]);

  // Auto-save markup when it changes
  useEffect(() => {
    if (markupData) {
      if (markupSaveTimeoutRef.current) {
        clearTimeout(markupSaveTimeoutRef.current);
      }

      markupSaveTimeoutRef.current = setTimeout(() => {
        saveMarkup();
      }, 1500);
    }
  }, [markupData, saveMarkup]);

  const addToHistory = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          content: newContent,
          timestamp: Date.now(),
        });

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

      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }

      historyTimeoutRef.current = setTimeout(() => {
        addToHistory(newContent);
      }, 1000);

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

      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveFile(previousContent);
    }
  }, [canUndo, currentIndex, history, saveFile]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const nextContent = history[newIndex].content;
      setContent(nextContent);

      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveFile(nextContent);
    }
  }, [canRedo, currentIndex, history, saveFile]);

  const handleShare = useCallback(async () => {
    try {
      if (hasChanges) {
        await saveFile(content);
      }
      if (markupData) {
        await saveMarkup();
      }
      await shareFile(filePath);
    } catch (err) {
      console.error('Failed to share file:', err);
      setError('Failed to share file');
    }
  }, [content, hasChanges, filePath, saveFile, markupData, saveMarkup]);

  const toggleEditMode = useCallback(() => {
    if (isEditing && hasChanges) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
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

    setHistory([{ content: originalContent, timestamp: Date.now() }]);
    setCurrentIndex(0);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
  }, [originalContent]);

  return {
    content,
    originalContent,
    hasChanges,
    loading,
    saving,
    error,
    isEditing,
    isFullscreen,
    canUndo,
    canRedo,
    charCount,
    wordCount,
    lineCount,
    markupData,
    handleContentChange,
    handleShare,
    toggleEditMode,
    toggleFullscreen,
    handleDiscard,
    handleUndo,
    handleRedo,
    loadFile,
    setMarkupData,
    saveMarkup,
  };
}