import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface DropDownOption<T> {
  label: string;
  value: T;
  color?: string;
}

interface DropDownProps<T> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: DropDownOption<T>[];
  showColorDot?: boolean;
}

export default function DropDown<T extends string>({
  label,
  value,
  onValueChange,
  options,
  showColorDot = false,
}: DropDownProps<T>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDropDown, setShowDropDown] = useState(false);

  // Find the current selected option
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || value;
  const displayColor = selectedOption?.color;

  return (
    <View>
      <Text style={[styles.label, { color: isDark ? '#AAAAAA' : '#666666' }]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
            borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
        onPress={() => setShowDropDown(!showDropDown)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showColorDot && displayColor && (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: displayColor,
                marginRight: 8,
              }}
            />
          )}
          <Text
            style={{
              color: isDark ? '#FFFFFF' : '#000000',
              fontSize: 16,
            }}
          >
            {displayLabel}
          </Text>
        </View>
        <ChevronDown size={20} color={isDark ? '#8E8E93' : '#999'} />
      </TouchableOpacity>

      {showDropDown && (
        <View
          style={[
            styles.dropdownPicker,
            { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.dropdownOption,
                {
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#3C3C3E' : '#E0E0E0',
                },
              ]}
              onPress={() => {
                onValueChange(option.value);
                setShowDropDown(false);
              }}
            >
              {showColorDot && option.color && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: option.color,
                    marginRight: 8,
                  }}
                />
              )}
              <Text
                style={[
                  styles.dropdownText,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdownPicker: {
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
});
