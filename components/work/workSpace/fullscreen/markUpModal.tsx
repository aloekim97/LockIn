import React, { useRef, useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MarkUpModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        Keyboard.dismiss();
        return true;
      },
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          handleToggle();
        }
      },
    })
  ).current;

  const handleToggle = () => {
    Keyboard.dismiss();

    const currentXPos = SCREEN_WIDTH - 40 - 50 + (pan.x as any)._value;
    const currentSide = currentXPos < SCREEN_WIDTH / 2 ? 'left' : 'right';
    setSide(currentSide);

    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  const modalWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 280],
  });

  const growCorrection = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, side === 'left' ? 180 : 0],
  });

  const contentOpacity = expandAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const renderContent = () => {
    const closeBtn = (
      <TouchableOpacity onPress={handleToggle}>
        <Text style={[styles.optionText, { color: '#ff4444' }]}>Close</Text>
      </TouchableOpacity>
    );

    const opt1 = (
      <TouchableOpacity onPress={() => console.log('Edit')}>
        <Text style={styles.optionText}>Edit</Text>
      </TouchableOpacity>
    );

    const opt2 = (
      <TouchableOpacity onPress={() => console.log('Save')}>
        <Text style={styles.optionText}>Save</Text>
      </TouchableOpacity>
    );

    const divider = <View style={styles.divider} />;

    if (side === 'left') {
      return (
        <View style={styles.row}>
          {closeBtn}
          {divider}
          {opt1}
          {divider}
          {opt2}
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {opt1}
        {divider}
        {opt2}
        {divider}
        {closeBtn}
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {isOpen && (
        <TouchableWithoutFeedback onPress={handleToggle}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.circle,
          {
            width: modalWidth,
            transform: [
              { translateX: Animated.add(pan.x, growCorrection) },
              { translateY: pan.y },
            ],
          },
        ]}
      >
        {!isOpen ? (
          <Text style={styles.label}>+</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  label: {
    color: 'white',
    fontSize: 30,
    fontWeight: '300',
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    padding: 10,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#3d444d',
  },
});

export default MarkUpModal;
