// components/TouchTracker.tsx
import { useRef, useEffect } from 'react';
import { View, Dimensions, PanResponder, StyleSheet } from 'react-native';

interface TouchTrackerProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function TouchTracker({ children, enabled = true }: TouchTrackerProps) {
  const touchedPoints = useRef(new Set<string>());
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const gridSize = 20; // Size of grid cells in pixels
  
  const cols = Math.ceil(screenWidth / gridSize);
  const rows = Math.ceil(screenHeight / gridSize);
  const totalCells = cols * rows;

  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      const touchedCount = touchedPoints.current.size;
      const percentage = ((touchedCount / totalCells) * 100).toFixed(2);
      
      console.log('📊 Touch Coverage Stats:');
      console.log(`  - Cells touched: ${touchedCount} / ${totalCells}`);
      console.log(`  - Coverage: ${percentage}%`);
      console.log(`  - Grid: ${cols}x${rows} (${gridSize}px cells)`);
      console.log(`  - Screen: ${screenWidth}x${screenHeight}px`);
    }, 2000); // Log every 2 seconds

    return () => clearInterval(interval);
  }, [enabled, totalCells, cols, rows]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderGrant: (evt) => {
        if (!enabled) return;
        trackTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
      onPanResponderMove: (evt) => {
        if (!enabled) return;
        trackTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
    })
  ).current;

  const trackTouch = (x: number, y: number) => {
    const cellX = Math.floor(x / gridSize);
    const cellY = Math.floor(y / gridSize);
    const key = `${cellX},${cellY}`;
    
    if (!touchedPoints.current.has(key)) {
      touchedPoints.current.add(key);
      
      const touchedCount = touchedPoints.current.size;
      const percentage = ((touchedCount / totalCells) * 100).toFixed(2);
      
      console.log(`👆 Touch at (${Math.round(x)}, ${Math.round(y)}) - Cell [${cellX}, ${cellY}] - Coverage: ${percentage}%`);
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
