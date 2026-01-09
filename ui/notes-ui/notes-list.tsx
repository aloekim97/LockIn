import { View, Text } from 'react-native';
import AddButton from './add-button';

export default function NotesList() {
  return (
    <View
      style={{
        borderColor: 'white',
        borderWidth: 1,
        width: '100%',
        height: '100%',
        borderRadius: 16,
      }}
    >
      <View
        style={{
          borderBottomColor: 'white',
          borderBottomWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Notes
        </Text>
        <AddButton />
      </View>
    </View>
  );
}
