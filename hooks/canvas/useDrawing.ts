// hooks/useDrawing.ts
import { useRef, useState, useEffect } from 'react';
import { PanResponder } from 'react-native';

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

interface UseDrawingProps {
  color: string;
  strokeWidth: number;
  onPathComplete?: (path: DrawingPath) => void;
}

export function useDrawing({ color, strokeWidth, onPathComplete }: UseDrawingProps) {
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const currentPathRef = useRef<DrawingPath | null>(null);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);

  // Keep refs in sync with props
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath: DrawingPath = {
          points: [{ x: locationX, y: locationY }],
          color: colorRef.current,
          width: strokeWidthRef.current,
          timestamp: Date.now(),
        };
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
      },
      onPanResponderMove: (evt) => {
        if (currentPathRef.current) {
          const { locationX, locationY } = evt.nativeEvent;
          const updatedPath = {
            ...currentPathRef.current,
            points: [...currentPathRef.current.points, { x: locationX, y: locationY }],
          };
          currentPathRef.current = updatedPath;
          setCurrentPath(updatedPath);
        }
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current && currentPathRef.current.points.length > 0) {
          onPathComplete?.(currentPathRef.current);
        }
        currentPathRef.current = null;
        setCurrentPath(null);
      },
    })
  ).current;

  return {
    currentPath,
    panResponder,
  };
}

export function pathToSvgString(path: DrawingPath): string {
  if (path.points.length === 0) return '';
  const [first, ...rest] = path.points;
  let d = `M ${first.x} ${first.y}`;
  for (const point of rest) {
    d += ` L ${point.x} ${point.y}`;
  }
  return d;
}