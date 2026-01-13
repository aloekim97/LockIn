// components/HandDetection.tsx
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Animated,
} from 'react-native';

interface HandDetectionProps {
  children: React.ReactNode;
  theme: any;
  onHandDetected?: (touchCount: number) => void;
  onHandRemoved?: () => void;
}

interface TouchPoint {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export default function HandDetection({
  children,
  theme,
  onHandDetected,
  onHandRemoved,
}: HandDetectionProps) {
  const [activeTouches, setActiveTouches] = useState<TouchPoint[]>([]);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Hand detection thresholds
  const MIN_TOUCHES_FOR_HAND = 3; // At least 3 fingers = likely a hand
  const MAX_HAND_SPREAD = 300; // Maximum spread of touches in pixels
  const TOUCH_TIMEOUT = 100; // Time window to detect simultaneous touches (ms)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        updateTouches(touches);
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        updateTouches(touches);
      },

      onPanResponderRelease: () => {
        // Wait a bit to see if other touches are still active
        setTimeout(() => {
          setActiveTouches([]);
          setIsHandDetected(false);
          onHandRemoved?.();
        }, 50);
      },
    })
  ).current;

  const updateTouches = (touches: any[]) => {
    const touchPoints: TouchPoint[] = touches.map((touch) => ({
      id: touch.identifier.toString(),
      x: touch.pageX,
      y: touch.pageY,
      timestamp: Date.now(),
    }));

    setActiveTouches(touchPoints);

    const touchCount = touchPoints.length;

    // Log touch information
    console.log('👋 TOUCH INFO:');
    console.log(`  🖐️  Active touches: ${touchCount}`);

    if (touchCount >= MIN_TOUCHES_FOR_HAND) {
      // Calculate spread of touches
      const spread = calculateSpread(touchPoints);
      const isLikelyHand = spread <= MAX_HAND_SPREAD;

      console.log(`  📏 Spread: ${Math.round(spread)}px`);
      console.log(
        `  ${
          isLikelyHand ? '✅ HAND DETECTED!' : '❌ Not a hand (spread too wide)'
        }`
      );

      if (isLikelyHand && !isHandDetected) {
        setIsHandDetected(true);
        onHandDetected?.(touchCount);
        showDetectionIndicator();
      }

      // Log each touch point
      touchPoints.forEach((touch, index) => {
        const xPercent = ((touch.x / screenWidth) * 100).toFixed(1);
        const yPercent = ((touch.y / screenHeight) * 100).toFixed(1);
        console.log(
          `    Finger ${index + 1}: (${Math.round(touch.x)}, ${Math.round(
            touch.y
          )}) - ${xPercent}%, ${yPercent}%`
        );
      });
    } else {
      if (isHandDetected) {
        setIsHandDetected(false);
        onHandRemoved?.();
      }
    }
  };

  const calculateSpread = (points: TouchPoint[]): number => {
    if (points.length < 2) return 0;

    let maxDistance = 0;

    // Find maximum distance between any two points
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

  const showDetectionIndicator = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}

      {/* Visual touch points */}
      {activeTouches.map((touch) => (
        <View
          key={touch.id}
          style={[
            styles.touchPoint,
            {
              left: touch.x - 20,
              top: touch.y - 20,
              backgroundColor: isHandDetected
                ? theme.primary
                : theme.textSecondary,
            },
          ]}
        />
      ))}

      {/* Hand detected indicator */}
      <Animated.View
        style={[
          styles.handIndicator,
          {
            opacity,
            backgroundColor: theme.primary,
          },
        ]}
      >
        <Text style={styles.handIndicatorText}>
          ✋ Hand Detected! ({activeTouches.length} fingers)
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchPoint: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.6,
    borderWidth: 2,
    borderColor: 'white',
  },
  handIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handIndicatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
