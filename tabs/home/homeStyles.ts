import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    gap: 32,
  },
  status: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    padding: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});