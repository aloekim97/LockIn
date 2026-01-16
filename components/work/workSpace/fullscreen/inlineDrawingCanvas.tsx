import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  useDrawing,
  pathToSvgString,
} from '../../../../hooks/canvas/useDrawing';
import type { DrawingPath } from '../../../../hooks/canvas/useDrawing';

interface InlineDrawingCanvasProps {
  paths: DrawingPath[];
  onPathsChange: (paths: DrawingPath[]) => void;
  color: string;
  strokeWidth: number;
}

export default function InlineDrawingCanvas({
  paths,
  onPathsChange,
  color,
  strokeWidth,
}: InlineDrawingCanvasProps) {
  const pathsRef = useRef<DrawingPath[]>(paths);

  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  const { currentPath, panResponder } = useDrawing({
    color,
    strokeWidth,
    onPathComplete: (path) => {
      onPathsChange([...pathsRef.current, path]);
    },
  });

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {paths.map((path, index) => (
          <Path
            key={`path-${path.timestamp}-${index}`}
            d={pathToSvgString(path)}
            stroke={path.color}
            strokeWidth={path.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPath && currentPath.points.length > 0 && (
          <Path
            d={pathToSvgString(currentPath)}
            stroke={currentPath.color}
            strokeWidth={currentPath.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
}
