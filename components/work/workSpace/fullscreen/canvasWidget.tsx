import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import {
  useWidgetState,
  useWidgetTransform,
  useDrawing,
  useMovePanResponder,
  useDrawPanResponder,
} from '../../../../hooks/canvas/widgetHooks';

interface CanvasWidgetProps {
  theme: any;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  onClose: () => void;
  onPositionChange?: (
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export default function CanvasWidget({
  theme,
  initialX = 50,
  initialY = 100,
  initialWidth = 300,
  initialHeight = 400,
  onClose,
  onPositionChange,
  onInteractionStart,
  onInteractionEnd,
}: CanvasWidgetProps) {
  const drawColor = theme.primary || '#007AFF';
  const strokeWidth = 3;

  // Use custom hooks
  const { mode, isMinimized, toggleMode, toggleMinimize } = useWidgetState();

  const { position, size, handleResize, notifyPositionChange } =
    useWidgetTransform(
      initialX,
      initialY,
      initialWidth,
      initialHeight,
      onPositionChange
    );

  const {
    paths,
    currentPath,
    touchPoints,
    startDrawing,
    continueDrawing,
    endDrawing,
    handleClear,
    handleUndo,
  } = useDrawing(drawColor, strokeWidth);

  const movePanResponder = useMovePanResponder(
    mode,
    position,
    onInteractionStart,
    onInteractionEnd,
    notifyPositionChange
  );

  const drawPanResponder = useDrawPanResponder(
    mode,
    startDrawing,
    continueDrawing,
    endDrawing,
    onInteractionStart,
    onInteractionEnd
  );

  if (isMinimized) {
    return (
      <Animated.View
        style={[
          styles.minimizedContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.primary,
            transform: position.getTranslateTransform(),
          },
        ]}
        {...movePanResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={toggleMinimize}
          style={styles.minimizedContent}
        >
          <Ionicons name="brush" size={20} color={theme.primary} />
          <Text style={[styles.minimizedText, { color: theme.text }]}>
            Canvas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.minimizedClose}>
          <Ionicons name="close" size={16} color={theme.text} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.primary,
          width: size.width,
          height: size.height,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.textSecondary + '30' },
        ]}
        {...(mode === 'move' ? movePanResponder.panHandlers : {})}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="brush" size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Canvas</Text>
          <View
            style={[
              styles.modeBadge,
              {
                backgroundColor:
                  mode === 'draw'
                    ? theme.primary + '20'
                    : theme.textSecondary + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.modeText,
                {
                  color: mode === 'draw' ? theme.primary : theme.textSecondary,
                },
              ]}
            >
              {mode === 'draw' ? 'Draw' : 'Move'}
            </Text>
          </View>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggleMode} style={styles.iconButton}>
            <Ionicons
              name={mode === 'draw' ? 'move' : 'pencil'}
              size={18}
              color={theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUndo}
            disabled={paths.length === 0}
            style={[styles.iconButton, { opacity: paths.length > 0 ? 1 : 0.4 }]}
          >
            <Ionicons name="arrow-undo" size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMinimize} style={styles.iconButton}>
            <Ionicons name="remove" size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas Area */}
      <View
        style={[styles.canvasArea, { backgroundColor: theme.background }]}
        {...(mode === 'draw' ? drawPanResponder.panHandlers : {})}
      >
        <Svg width={size.width} height={size.height - 40}>
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

          {/* Current path */}
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

          {/* Touch points */}
          {touchPoints.map((point, index) => (
            <Circle
              key={`${index}`}
              cx={point.x}
              cy={point.y}
              r={1.5}
              fill={theme.primary}
              opacity={0.3}
            />
          ))}
        </Svg>

        {/* Instructions */}
        {paths.length === 0 && (
          <View style={styles.instructions}>
            <Ionicons
              name={mode === 'draw' ? 'brush' : 'move'}
              size={32}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.instructionText, { color: theme.textSecondary }]}
            >
              {mode === 'draw' ? 'Draw here' : 'Drag to move'}
            </Text>
          </View>
        )}
      </View>

      {/* Resize handles */}
      <View style={styles.resizeHandles}>
        <TouchableOpacity
          onPressIn={() => handleResize('width', 50)}
          style={[
            styles.resizeHandle,
            styles.resizeRight,
            { backgroundColor: theme.primary },
          ]}
        >
          <Ionicons name="resize" size={12} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={() => handleResize('height', 50)}
          style={[
            styles.resizeHandle,
            styles.resizeBottom,
            { backgroundColor: theme.primary },
          ]}
        >
          <Ionicons name="resize" size={12} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderRadius: 4,
  },
  canvasArea: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'none',
  },
  instructionText: {
    fontSize: 14,
  },
  resizeHandles: {
    position: 'absolute',
  },
  resizeHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  resizeRight: {
    right: -12,
    top: '50%',
  },
  resizeBottom: {
    bottom: -12,
    left: '50%',
  },
  minimizedContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minimizedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  minimizedClose: {
    padding: 4,
  },
});
