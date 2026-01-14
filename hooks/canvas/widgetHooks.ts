// hooks/widgetHooks.ts
import { useRef, useState } from 'react';
import { PanResponder, Animated } from 'react-native';

// ============================================================
// Types
// ============================================================

interface PathData {
  id: string;
  path: string;
  color: string;
  width: number;
}

interface TouchPoint {
  x: number;
  y: number;
}

// ============================================================
// useWidgetState - Manages mode and minimization state
// ============================================================

export function useWidgetState() {
  const [mode, setMode] = useState<'draw' | 'move'>('draw');
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMode = () => {
    setMode((prev) => (prev === 'draw' ? 'move' : 'draw'));
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return { mode, isMinimized, toggleMode, toggleMinimize };
}

// ============================================================
// useWidgetTransform - Manages position and size
// ============================================================

export function useWidgetTransform(
  initialX: number,
  initialY: number,
  initialWidth: number,
  initialHeight: number,
  onPositionChange?: (
    x: number,
    y: number,
    width: number,
    height: number
  ) => void
) {
  const [position] = useState(
    new Animated.ValueXY({ x: initialX, y: initialY })
  );
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const handleResize = (direction: 'width' | 'height', delta: number) => {
    setSize((prev) => {
      const newSize = {
        width:
          direction === 'width'
            ? Math.max(200, prev.width + delta)
            : prev.width,
        height:
          direction === 'height'
            ? Math.max(200, prev.height + delta)
            : prev.height,
      };
      if (onPositionChange) {
        const currentX = (position.x as any)._value;
        const currentY = (position.y as any)._value;
        onPositionChange(currentX, currentY, newSize.width, newSize.height);
      }
      return newSize;
    });
  };

  const notifyPositionChange = () => {
    if (onPositionChange) {
      const currentX = (position.x as any)._value;
      const currentY = (position.y as any)._value;
      onPositionChange(currentX, currentY, size.width, size.height);
    }
  };

  return { position, size, handleResize, notifyPositionChange };
}

// ============================================================
// useDrawing - Manages drawing state and operations
// ============================================================

export function useDrawing(drawColor: string, strokeWidth: number) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const currentPathId = useRef<string>('');

  const startDrawing = (locationX: number, locationY: number) => {
    currentPathId.current = `path_${Date.now()}`;
    setCurrentPath(`M ${locationX} ${locationY}`);
    setTouchPoints((prev) => [...prev, { x: locationX, y: locationY }]);
  };

  const continueDrawing = (locationX: number, locationY: number) => {
    setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
    if (Math.random() > 0.8) {
      setTouchPoints((prev) => [
        ...prev.slice(-500),
        { x: locationX, y: locationY },
      ]);
    }
  };

  const endDrawing = () => {
    if (currentPath) {
      setPaths((prev) => [
        ...prev,
        {
          id: currentPathId.current,
          path: currentPath,
          color: drawColor,
          width: strokeWidth,
        },
      ]);
      setCurrentPath('');
    }
  };

  const handleClear = () => {
    setPaths([]);
    setTouchPoints([]);
  };

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  return {
    paths,
    currentPath,
    touchPoints,
    startDrawing,
    continueDrawing,
    endDrawing,
    handleClear,
    handleUndo,
  };
}

// ============================================================
// useMovePanResponder - Creates pan responder for moving widget
// ============================================================

export function useMovePanResponder(
  mode: 'draw' | 'move',
  position: Animated.ValueXY,
  onInteractionStart?: () => void,
  onInteractionEnd?: () => void,
  onPositionChangeComplete?: () => void
) {
  const movePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'move',
      onMoveShouldSetPanResponder: () => mode === 'move',
      onPanResponderGrant: () => {
        if (onInteractionStart) onInteractionStart();
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
        if (onPositionChangeComplete) onPositionChangeComplete();
        if (onInteractionEnd) onInteractionEnd();
      },
    })
  ).current;

  return movePanResponder;
}

// ============================================================
// useDrawPanResponder - Creates pan responder for drawing
// ============================================================

export function useDrawPanResponder(
  mode: 'draw' | 'move',
  startDrawing: (x: number, y: number) => void,
  continueDrawing: (x: number, y: number) => void,
  endDrawing: () => void,
  onInteractionStart?: () => void,
  onInteractionEnd?: () => void
) {
  const drawPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'draw',
      onMoveShouldSetPanResponder: () => mode === 'draw',
      onPanResponderGrant: (evt) => {
        if (onInteractionStart) onInteractionStart();
        const { locationX, locationY } = evt.nativeEvent;
        startDrawing(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        continueDrawing(locationX, locationY);
      },
      onPanResponderRelease: () => {
        endDrawing();
        if (onInteractionEnd) onInteractionEnd();
      },
    })
  ).current;

  return drawPanResponder;
}
