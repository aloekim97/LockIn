import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  theme: {
    primary: string;
    textSecondary: string;
  };
}

export default function Breadcrumb({
  currentPath,
  onNavigate,
  theme,
}: BreadcrumbProps) {
  const parts = currentPath ? currentPath.split('/') : [];

  return (
    <View style={styles.breadcrumb}>
      <TouchableOpacity onPress={() => onNavigate('')}>
        <Text style={[styles.breadcrumbText, { color: theme.primary }]}>
          Home
        </Text>
      </TouchableOpacity>

      {parts.map((part, index) => (
        <View key={index} style={styles.breadcrumbItem}>
          <Text
            style={[styles.breadcrumbSeparator, { color: theme.textSecondary }]}
          >
            {' / '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newPath = parts.slice(0, index + 1).join('/');
              onNavigate(newPath);
            }}
          >
            <Text style={[styles.breadcrumbText, { color: theme.primary }]}>
              {part}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    fontSize: 13,
  },
});
