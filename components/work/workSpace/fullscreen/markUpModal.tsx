import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  StyleSheet,
  PanResponder,
  Animated,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import WritingOption from './markUpOptions/writingOptions';
import ColorPicker from './markUpOptions/colorPicker';
import ThicknessPicker from './markUpOptions/thicknessPicker';
import { MarkupMode } from './textCanvas';
import ActiveIcon from './markUpOptions/activeIcon';

interface MarkUpModalProps {
  onModeChange: (mode: MarkupMode) => void;
  currentMode: MarkupMode;
  visible?: boolean;
  onColorChange?: (color: string) => void;
  onThicknessChange?: (thickness: number) => void;
}

const MarkUpModal: React.FC<MarkUpModalProps> = ({
  onModeChange,
  currentMode,
  visible = true,
  onColorChange,
  onThicknessChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const [isLocked, setIsLocked] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedThickness, setSelectedThickness] = useState(4);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const lockProgressAnim = useRef(new Animated.Value(0)).current;

  if (!visible) return null;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const handleToggle = useCallback(() => {
    if (isLocked) return;
    Keyboard.dismiss();

    let currentX = 0;
    pan.x.addListener(({ value }) => {
      currentX = value;
    });
    pan.x.removeAllListeners();

    const currentXPos = screenWidth - 40 - 50 + currentX;
    setSide(currentXPos < screenWidth / 2 ? 'left' : 'right');

    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(backdropOpacity, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, pan.x, expandAnim, backdropOpacity, screenWidth, isLocked]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          Keyboard.dismiss();
          setIsPressing(true);
          lockProgressAnim.setValue(0);
          Animated.timing(lockProgressAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setIsLocked((prev) => !prev);
              setIsPressing(false);
            }
          });
          return true;
        },
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (isLocked || isOpen) return false;
          return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        },
        onPanResponderGrant: () => {
          if (isLocked || isOpen) return;
          pan.extractOffset();
        },
        onPanResponderMove: (_, gesture) => {
          if (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5) {
            setIsPressing(false);
            lockProgressAnim.stopAnimation();
          }
          if (isLocked || isOpen) return;
          Animated.event([null, { dx: pan.x, dy: pan.y }], {
            useNativeDriver: false,
          })(_, gesture);
        },
        onPanResponderRelease: (_, gesture) => {
          setIsPressing(false);
          lockProgressAnim.stopAnimation();
          if (!isLocked) pan.flattenOffset();

          // Only toggle if it's a tap, not a drag, and not locked
          if (
            Math.abs(gesture.dx) < 5 &&
            Math.abs(gesture.dy) < 5 &&
            !isLocked &&
            !isOpen
          ) {
            handleToggle();
          }
        },
      }),
    [pan, isLocked, isOpen, handleToggle]
  );

  const modalWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 600],
  });

  const growCorrection = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, side === 'left' ? 500 : 0],
  });

  const contentOpacity = expandAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const renderContent = useCallback(
    () => (
      <View style={styles.row}>
        {/* Selecting a mode here only triggers onModeChange, no toggle */}
        <WritingOption
          currentMode={currentMode || 'Draw'}
          onModeChange={(mode) => onModeChange(mode)}
        />
        <View style={styles.divider} />
        <ColorPicker
          current={selectedColor}
          onSelect={(c) => {
            setSelectedColor(c);
            onColorChange?.(c);
          }}
        />
        <View style={styles.divider} />
        <ThicknessPicker
          current={selectedThickness}
          selectedColor={selectedColor}
          onSelect={(t) => {
            setSelectedThickness(t);
            onThicknessChange?.(t);
          }}
        />
        <View style={styles.divider} />
        {/* This button is now the ONLY way to close the expanded modal */}
        <TouchableOpacity
          onPress={() => (isLocked ? setIsLocked(false) : handleToggle())}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.closeText,
              { color: isLocked ? '#FFA500' : '#ff4444' },
            ]}
          >
            {isLocked ? 'Unlock' : 'X'}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [
      currentMode,
      selectedColor,
      selectedThickness,
      isLocked,
      handleToggle,
      onModeChange,
      onColorChange,
      onThicknessChange,
    ]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {!isLocked && (
        <TouchableWithoutFeedback onPress={handleToggle}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
                pointerEvents: isOpen ? 'auto' : 'none',
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.circle,
          currentMode && styles.circleActive,
          isLocked && styles.circleLocked,
          {
            width: modalWidth,
            transform: [
              { translateX: Animated.add(pan.x, growCorrection) },
              { translateY: pan.y },
            ],
          },
        ]}
      >
        {isPressing && !isLocked && !isOpen && (
          <View style={styles.progressBorderContainer}>
            <Animated.View
              style={[
                styles.progressBorder,
                {
                  borderColor: '#4CAF50',
                  transform: [
                    {
                      scale: lockProgressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        )}

        {!isOpen ? (
          <ActiveIcon
            mode={currentMode}
            color={selectedColor}
            thickness={selectedThickness}
          />
        ) : (
          <Animated.View
            style={[styles.optionsContainer, { opacity: contentOpacity }]}
          >
            {renderContent()}
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  circle: {
    height: 100,
    backgroundColor: '#1b2026',
    position: 'absolute',
    bottom: 60,
    right: 40,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  circleActive: { backgroundColor: '#2a3139' },
  circleLocked: { borderWidth: 2, borderColor: '#4CAF50' },
  progressBorderContainer: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 56,
    overflow: 'hidden',
  },
  progressBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 56,
    borderWidth: 4,
  },
  activeIconContainer: { alignItems: 'center', justifyContent: 'center' },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    borderWidth: 2,
    borderColor: '#1b2026',
  },
  optionsContainer: { width: '100%', paddingHorizontal: 25 },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: { width: 1, height: 35, backgroundColor: 'rgba(255,255,255,0.1)' },
  closeText: { fontWeight: 'bold', fontSize: 20, padding: 10 },
});

export default React.memo(MarkUpModal);
