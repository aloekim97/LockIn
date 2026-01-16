import { Animated, Dimensions } from 'react-native';

// --- Constants ---
export const COLLAPSED_SIZE = 100;
export const EXPANDED_SIZE = 600;
export const MARGIN = 40;
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const LOCK_DURATION = 1000;

/**
 * Calculates whether the modal is on the left or right side of the screen
 */
export const calculateSide = (currentX: number): 'left' | 'right' => {
  const centerPoint = currentX + COLLAPSED_SIZE / 2;
  return centerPoint < SCREEN_WIDTH / 2 ? 'left' : 'right';
};

/**
 * Returns the initial X position based on the desired side
 */
export const getInitialX = (side: 'left' | 'right') => {
  return side === 'right' ? SCREEN_WIDTH - COLLAPSED_SIZE - MARGIN : MARGIN;
};

/**
 * Returns the animation configurations for expansion and opacity
 */
export const getAnimationStyles = (
  expandAnim: Animated.Value,
  side: 'left' | 'right'
) => {
  const modalWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_SIZE, EXPANDED_SIZE],
  });

  // If on the right, translate left by the growth amount to keep the right edge stable
  const translateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, side === 'right' ? -(EXPANDED_SIZE - COLLAPSED_SIZE) : 0],
  });

  const contentOpacity = expandAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const progressScale = {
    scale: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return { modalWidth, translateX, contentOpacity, progressScale };
};
