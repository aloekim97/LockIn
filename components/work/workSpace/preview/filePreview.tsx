// components/FilePreview.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../globalcss';
import { readFile } from '../../../../utils/fileSystem';

interface FilePreviewProps {
  filePath: string;
  fileName: string;
  onEdit: () => void;
}

export default function FilePreview({
  filePath,
  fileName,
  onEdit,
}: FilePreviewProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const errorColor = '#ef4444';

  useEffect(() => {
    loadFile();
  }, [filePath]);

  const loadFile = async () => {
    try {
      setLoading(true);
      setError('');
      const fileContent = await readFile(filePath);
      setContent(fileContent);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Failed to load file');
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewContent = () => {
    // Show first 500 characters as preview
    if (content.length > 500) {
      return content.substring(0, 500) + '...';
    }
    return content;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.textSecondary + '30' },
        ]}
      >
        <Text
          style={[styles.fileName, { color: theme.text }]}
          numberOfLines={1}
        >
          {fileName}
        </Text>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.editButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle" size={48} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error}
            </Text>
          </View>
        ) : content ? (
          <Text style={[styles.contentText, { color: theme.text }]}>
            {getPreviewContent()}
          </Text>
        ) : (
          <View style={styles.centered}>
            <Text style={{ color: theme.textSecondary }}>File is empty</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Stats */}
      <View
        style={[styles.footer, { borderTopColor: theme.textSecondary + '30' }]}
      >
        <Text style={[styles.stats, { color: theme.textSecondary }]}>
          {content.length} characters • {filePath}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  stats: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
