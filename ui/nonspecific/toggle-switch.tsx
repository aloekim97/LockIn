import { useColorScheme, View, Text, Switch, StyleSheet } from 'react-native';

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: (value: boolean) => void;
}

export default function ToggleSwitch({
  label,
  isOn,
  onToggle,
}: ToggleSwitchProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.switchContainer}>
      <Text
        style={[
          styles.label,
          {
            color: isDark ? '#FFFFFF' : '#000000',
            marginBottom: 0,
          },
        ]}
      >
        {label}
      </Text>
      <Switch
        value={isOn}
        onValueChange={onToggle}
        trackColor={{
          false: '#767577',
          true: isDark ? '#0A84FF' : '#4A6FA5',
        }}
        thumbColor={isOn ? '#FFFFFF' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
