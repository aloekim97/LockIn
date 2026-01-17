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
} from 'react-native';

// Helpers
import * as Helpers from '../../../../hooks/markUpModal/useMarkUpModal';

// Sub-components
import WritingOption from './markUpOptions/writingOptions';
import ColorPicker from './markUpOptions/colorPicker';
import ThicknessPicker from './markUpOptions/thicknessPicker';
import ActiveIcon from './markUpOptions/activeIcon';
import { PageMode } from './fullScreenEditor';

interface MarkUpModalProps {
  onModeChange: (mode: PageMode) => void;
  currentMode: PageMode;
  visible?: boolean;
  onColorChange?: (color: string) => void;
  onThicknessChange?: (thickness: number) => void;
  theme?: any;
}

const MarkUpModal: React.FC<MarkUpModalProps> = ({
  onModeChange,
  currentMode,
  visible = true,
  onColorChange,
  onThicknessChange,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [isLocked, setIsLocked] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  
  // Determine initial color based on theme
  const getInitialColor = () => {
    if (!theme) return '#000000';
    // If theme.text is light/white, we're in dark mode
    const isDarkMode =
      theme.text &&
      (theme.text.toLowerCase().includes('fff') ||
        theme.text.toLowerCase().includes('white'));
    return isDarkMode ? '#FFFFFF' : '#000000';
  };

  const [selectedColor, setSelectedColor] = useState(getInitialColor());
  const [selectedThickness, setSelectedThickness] = useState(4);

  // Update initial color when theme changes
  useEffect(() => {
    const initialColor = getInitialColor();
    setSelectedColor(initialColor);
    onColorChange?.(initialColor);
  }, [theme]);

  // Animated Values
  const pan = useRef(
    new Animated.ValueXY({ x: Helpers.getInitialX('right'), y: 0 })
  ).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const lockProgressAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = useCallback(() => {
    if (isLocked) return;
    Keyboard.dismiss();

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
  }, [isOpen, isLocked, expandAnim, backdropOpacity]);

  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      onColorChange?.(color);
    },
    [onColorChange]
  );

  const handleThicknessChange = useCallback(
    (thickness: number) => {
      setSelectedThickness(thickness);
      onThicknessChange?.(thickness);
    },
    [onThicknessChange]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (isLocked || isOpen) return false;
          return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        },
        onPanResponderGrant: () => {
          if (isLocked || isOpen) return;
          pan.extractOffset();
          setIsPressing(true);

          lockProgressAnim.setValue(0);
          Animated.timing(lockProgressAnim, {
            toValue: 1,
            duration: Helpers.LOCK_DURATION,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setIsLocked((prev) => !prev);
              setIsPressing(false);
            }
          });
        },
        onPanResponderMove: (e, gesture) => {
          if (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5) {
            setIsPressing(false);
            lockProgressAnim.stopAnimation();
          }
          if (isLocked || isOpen) return;

          Animated.event([null, { dx: pan.x, dy: pan.y }], {
            useNativeDriver: false,
          })(e, gesture);
        },
        onPanResponderRelease: (_, gesture) => {
          setIsPressing(false);
          lockProgressAnim.stopAnimation();
          pan.flattenOffset();

          const currentX = (pan.x as any)._value;
          setSide(Helpers.calculateSide(currentX));

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
    [pan, isLocked, isOpen, handleToggle, lockProgressAnim]
  );

  const { modalWidth, translateX, contentOpacity } = Helpers.getAnimationStyles(
    expandAnim,
    side
  );

  if (!visible) return null;

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
              { translateX: Animated.add(pan.x, translateX) },
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
            <View style={styles.row}>
              <WritingOption
                currentMode={currentMode || 'Draw'}
                onModeChange={(mode) => onModeChange(mode)}
              />
              <View style={styles.divider} />
              <ColorPicker
                current={selectedColor}
                onSelect={handleColorChange}
                theme={theme}
              />
              <View style={styles.divider} />
              <ThicknessPicker
                current={selectedThickness}
                selectedColor={selectedColor}
                onSelect={handleThicknessChange}
              />
              <View style={styles.divider} />
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
    left: 0,
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
