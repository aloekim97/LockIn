import { Dimensions, View } from 'react-native';

export default function RightBox({ children }: { children?: React.ReactNode }) {
  const { width } = Dimensions.get('window');
  return (
    <View
      style={{
        borderColor: 'white',
        borderWidth: 1,
        padding: 10,
        width: width * 0.6,
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}
