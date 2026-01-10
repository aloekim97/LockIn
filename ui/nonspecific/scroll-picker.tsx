// ui/nonspecific/scroll-picker.tsx
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface ScrollPickerProps {
  items: string[] | number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  label: string;
}

export default function ScrollPicker({
  items,
  selectedIndex,
  onSelect,
  label,
}: ScrollPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const scrollY = useRef(new Animated.Value(0)).current;
  const itemHeight = 50;
  const visibleItems = 3;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        scrollY.setOffset(scrollY._value);
        scrollY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: scrollY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        scrollY.flattenOffset();
        const offset = Math.round(gesture.dy / itemHeight);
        let newIndex = currentIndex - offset;

        // Clamp to valid range
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= items.length) newIndex = items.length - 1;

        setCurrentIndex(newIndex);
        onSelect(newIndex);

        // Animate back to position
        Animated.spring(scrollY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  const getItemStyle = (index: number) => {
    const inputRange = [
      (index - 2) * itemHeight,
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
      (index + 2) * itemHeight,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.6, 0.8, 1, 0.8, 0.6],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
      extrapolate: 'clamp',
    });

    const translateY = (index - currentIndex) * itemHeight;

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
        {label}
      </Text>

      <View
        style={[styles.pickerContainer, { height: itemHeight * visibleItems }]}
        {...panResponder.panHandlers}
      >
        {/* Selection indicator */}
        <View
          style={[
            styles.selectionIndicator,
            {
              top: itemHeight * 2,
              height: itemHeight,
              backgroundColor: isDark ? '#1e3a5f' : '#eff6ff',
            },
          ]}
        />

        {/* Items */}
        {items.map((item, index) => (
          <Animated.View
            key={index}
            style={[styles.item, { height: itemHeight }, getItemStyle(index)]}
          >
            <TouchableOpacity
              onPress={() => {
                setCurrentIndex(index);
                onSelect(index);
              }}
              style={styles.itemTouchable}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    fontSize: index === currentIndex ? 28 : 20,
                    fontWeight: index === currentIndex ? '700' : '400',
                    color:
                      index === currentIndex
                        ? isDark
                          ? '#60a5fa'
                          : '#2563eb'
                        : isDark
                        ? '#9ca3af'
                        : '#6b7280',
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  label: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8,
    zIndex: 0,
  },
  item: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
