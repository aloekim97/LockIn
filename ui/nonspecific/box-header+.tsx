// components/BoxHeaderAdd.tsx
import { Plus } from 'lucide-react-native';
import { useState, useRef } from 'react';
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import DropdownModal from '../../modals/dropdownModal';

interface BoxHeaderProps {
  title: string;
  add: (value: string) => void;
  options: string[];
}

export default function BoxHeaderAdd({ title, add, options }: BoxHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  
  const buttonRef = useRef<View>(null);

  const handleAddPress = () => {
    buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setButtonPosition({ x: pageX, y: pageY, width, height });
      setIsOpen(true);
    });
  };

  const handleSelectOption = (option: string) => {
    add(option);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#2C3E50' }]}>
          {title}
        </Text>
        
        <View ref={buttonRef} collapsable={false}>
          <TouchableOpacity 
            onPress={handleAddPress}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Plus size={24} color={isDark ? '#FFFFFF' : '#2C3E50'} />
          </TouchableOpacity>
        </View>

        <DropdownModal
          visible={isOpen}
          onClose={handleCloseModal}
          options={options}
          onSelect={handleSelectOption}
          anchorPosition={buttonPosition}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
});