// components/InlineDrawingCanvas.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

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
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath: DrawingPath = {
          points: [{ x: locationX, y: locationY }],
          color,
          width: strokeWidth,
          timestamp: Date.now(),
        };
        setCurrentPath(newPath);
      },
      onPanResponderMove: (evt) => {
        if (currentPath) {
          const { locationX, locationY } = evt.nativeEvent;
          const updatedPath = {
            ...currentPath,
            points: [...currentPath.points, { x: locationX, y: locationY }],
          };
          setCurrentPath(updatedPath);
        }
      },
      onPanResponderRelease: () => {
        if (currentPath && currentPath.points.length > 1) {
          onPathsChange([...paths, currentPath]);
        }
        setCurrentPath(null);
      },
    })
  ).current;

  const pathToSvgString = (path: DrawingPath): string => {
    if (path.points.length === 0) return '';
    const [first, ...rest] = path.points;
    let d = `M ${first.x} ${first.y}`;
    for (const point of rest) {
      d += ` L ${point.x} ${point.y}`;
    }
    return d;
  };

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {/* Render saved paths */}
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
        {/* Render current path being drawn */}
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