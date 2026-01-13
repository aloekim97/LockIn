// components/DrawingCanvas.tsx
import { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

interface DrawingCanvasProps {
  theme: any;
  onClose: () => void;
}

interface PathData {
  id: string;
  path: string;
  color: string;
  width: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface ActiveTouch {
  id: string;
  x: number;
  y: number;
}

export default function DrawingCanvas({ theme, onClose }: DrawingCanvasProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [showTouchPoints, setShowTouchPoints] = useState(true);
  const [activeTouches, setActiveTouches] = useState<ActiveTouch[]>([]);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const currentPathId = useRef<string>('');

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const drawColor = theme.primary || '#007AFF';
  const strokeWidth = 3;

  // Hand detection settings
  const MIN_TOUCHES_FOR_HAND = 3;
  const MAX_HAND_SPREAD = 300;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;

        // Multi-touch detection
        if (touches.length >= MIN_TOUCHES_FOR_HAND) {
          handleMultiTouch(touches);
          return; // Don't draw when hand is detected
        }

        const { locationX, locationY, pageX, pageY } = evt.nativeEvent;

        // Log touch info
        const xPercent = ((pageX / screenWidth) * 100).toFixed(1);
        const yPercent = ((pageY / screenHeight) * 100).toFixed(1);

        console.log('🎨 DRAWING START:');
        console.log(
          `  📍 Position: (${Math.round(pageX)}, ${Math.round(pageY)})`
        );
        console.log(`  📊 Screen %: X=${xPercent}%, Y=${yPercent}%`);

        // Add touch point
        setTouchPoints((prev) => [
          ...prev,
          {
            x: locationX,
            y: locationY,
            timestamp: Date.now(),
          },
        ]);

        // Start new path
        currentPathId.current = `path_${Date.now()}`;
        setCurrentPath(`M ${locationX} ${locationY}`);
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;

        // Multi-touch detection
        if (touches.length >= MIN_TOUCHES_FOR_HAND) {
          handleMultiTouch(touches);
          return; // Don't draw when hand is detected
        }

        const { locationX, locationY, pageX, pageY } = evt.nativeEvent;

        // Log movement
        const xPercent = ((pageX / screenWidth) * 100).toFixed(1);
        const yPercent = ((pageY / screenHeight) * 100).toFixed(1);

        console.log(
          `🖌️  DRAW: (${Math.round(pageX)}, ${Math.round(
            pageY
          )}) - ${xPercent}%, ${yPercent}%`
        );

        // Add to current path
        setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);

        // Add touch point (throttled - every 5th point)
        if (Math.random() > 0.8) {
          setTouchPoints((prev) => [
            ...prev,
            {
              x: locationX,
              y: locationY,
              timestamp: Date.now(),
            },
          ]);
        }
      },

      onPanResponderRelease: () => {
        console.log('🎨 DRAWING END');
        setActiveTouches([]);
        setIsHandDetected(false);

        // Save the completed path
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
      },
    })
  ).current;

  const handleMultiTouch = (touches: any[]) => {
    const touchData: ActiveTouch[] = touches.map((touch) => ({
      id: touch.identifier.toString(),
      x: touch.pageX,
      y: touch.pageY,
    }));

    setActiveTouches(touchData);

    const touchCount = touchData.length;
    const spread = calculateSpread(touchData);
    const isHand = spread <= MAX_HAND_SPREAD;

    console.log('👋 MULTI-TOUCH DETECTED:');
    console.log(`  🖐️  Touches: ${touchCount}`);
    console.log(`  📏 Spread: ${Math.round(spread)}px`);
    console.log(
      `  ${isHand ? '✅ HAND DETECTED!' : '❌ Not a hand (too wide)'}`
    );

    if (isHand) {
      setIsHandDetected(true);
      touchData.forEach((touch, index) => {
        const xPercent = ((touch.x / screenWidth) * 100).toFixed(1);
        const yPercent = ((touch.y / screenHeight) * 100).toFixed(1);
        console.log(
          `    Finger ${index + 1}: (${Math.round(touch.x)}, ${Math.round(
            touch.y
          )}) - ${xPercent}%, ${yPercent}%`
        );
      });
    } else {
      setIsHandDetected(false);
    }
  };

  const calculateSpread = (points: ActiveTouch[]): number => {
    if (points.length < 2) return 0;

    let maxDistance = 0;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    return maxDistance;
  };

  const handleClear = () => {
    setPaths([]);
    setTouchPoints([]);
    console.log('🗑️  Canvas cleared');
  };

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
    console.log(`↩️  Undo - ${paths.length - 1} paths remaining`);
  };

  const toggleTouchPoints = () => {
    setShowTouchPoints((prev) => !prev);
    console.log(`👁️  Touch points ${!showTouchPoints ? 'shown' : 'hidden'}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.textSecondary + '30',
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="brush" size={24} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            Drawing Mode
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={toggleTouchPoints}
            style={[
              styles.button,
              { backgroundColor: showTouchPoints ? theme.primary : theme.card },
            ]}
          >
            <Ionicons
              name="location"
              size={20}
              color={showTouchPoints ? 'white' : theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUndo}
            disabled={paths.length === 0}
            style={[
              styles.button,
              {
                backgroundColor: theme.card,
                opacity: paths.length > 0 ? 1 : 0.4,
              },
            ]}
          >
            <Ionicons name="arrow-undo" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClear}
            style={[styles.button, { backgroundColor: theme.card }]}
          >
            <Ionicons name="trash-outline" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="close" size={20} color="white" />
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View
        style={[styles.canvas, { backgroundColor: theme.background }]}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {/* Completed paths */}
          {paths.map((pathData) => (
            <Path
              key={pathData.id}
              d={pathData.path}
              stroke={pathData.color}
              strokeWidth={pathData.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current path being drawn */}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={drawColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Touch points visualization */}
          {showTouchPoints &&
            touchPoints.map((point, index) => (
              <Circle
                key={`${point.timestamp}_${index}`}
                cx={point.x}
                cy={point.y}
                r={2}
                fill={theme.primary}
                opacity={0.5}
              />
            ))}
        </Svg>

        {/* Instructions */}
        {paths.length === 0 && touchPoints.length === 0 && (
          <View style={styles.instructions}>
            <Ionicons
              name="finger-print"
              size={48}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.instructionText, { color: theme.textSecondary }]}
            >
              Draw anywhere on the screen
            </Text>
            <Text
              style={[styles.instructionSubtext, { color: theme.textTertiary }]}
            >
              Touch points will be logged to console
            </Text>
          </View>
        )}
      </View>

      {/* Stats Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.textSecondary + '30',
          },
        ]}
      >
        <Text style={[styles.stats, { color: theme.textSecondary }]}>
          {paths.length} strokes • {touchPoints.length} touch points • Screen:{' '}
          {screenWidth}×{screenHeight}px
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  button: {
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
  closeText: {
    color: 'white',
    fontWeight: '600',
  },
  canvas: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instructionSubtext: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  stats: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
