import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface BoxHeaderProps {
  title: string;
  add: (value: string) => void;
  options: string[];
}

export default function BoxHeaderAdd({ title, add, options }: BoxHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [open, setOpen] = useState(false);
  
  const handleAddIcon = () => {
    setOpen(!open);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#2C3E50' }]}>
          {title}
        </Text>
        <View>
          <TouchableOpacity onPress={handleAddIcon}>
            <Plus size={24} color={isDark ? '#FFFFFF' : '#2C3E50'} />
          </TouchableOpacity>
          
          {open && (
            <View style={[styles.dropdown, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5' }]}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => {
                    add(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: isDark ? '#FFFFFF' : '#2C3E50' }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  },
  dropdown: {
    position: 'absolute',
    top: 32,
    right: 0,
    marginTop: 8,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 150,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 16,
  },
});