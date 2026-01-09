// components/AddButton.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AddButtonProps {
  onOptionSelect?: (option: string) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  color?: string;
}

export default function AddButton({ 
  onOptionSelect,
  position = 'bottom-right',
  size = 60,
  color = '#007AFF'
}: AddButtonProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleOption = (option: string) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
    setMenuVisible(false);
  };

  // Calculate position based on prop
  const positionStyle = {
    'bottom-right': { bottom: 30, right: 20 },
    'bottom-left': { bottom: 30, left: 20 },
    'top-right': { top: 30, right: 20 },
    'top-left': { top: 30, left: 20 },
  }[position];

  return (
    <View style={[{ position: 'absolute' }, positionStyle]}>
      {/* Main Button */}
      <TouchableOpacity
        onPress={() => setMenuVisible(!menuVisible)}
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: size * 0.5, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* Menu */}
      {menuVisible && (
        <>
          {/* Overlay to close menu when tapping outside */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
              zIndex: 998,
            }}
            activeOpacity={0}
            onPress={() => setMenuVisible(false)}
          />
          
          {/* Menu Options */}
          <View style={{ 
            position: 'absolute',
            bottom: size + 10, // Position menu above the button
            right: 0,
            zIndex: 999,
            backgroundColor: '#1e1e1e',
            borderRadius: 12,
            paddingVertical: 8,
            minWidth: 180,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
              onPress={() => handleOption('new note')}
            >
              <Text style={{ color: 'white', fontSize: 24, marginRight: 12 }}>📝</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>New Note</Text>
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: '#333', marginHorizontal: 16 }} />
            
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
              onPress={() => handleOption('new folder')}
            >
              <Text style={{ color: 'white', fontSize: 24, marginRight: 12 }}>📁</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>New Folder</Text>
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: '#333', marginHorizontal: 16 }} />
            
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
              onPress={() => handleOption('import pdf')}
            >
              <Text style={{ color: 'white', fontSize: 24, marginRight: 12 }}>📕</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>Import PDF</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}