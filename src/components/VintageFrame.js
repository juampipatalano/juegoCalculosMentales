import { StyleSheet, View } from 'react-native';

export default function VintageFrame({ children, style }) {
  return (
    <View style={[styles.frame, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#0a0d0a', // Gris plástico de la carcasa
    borderWidth: 4,
    borderColor: '#4d4f4d',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginVertical: 10,
  },
});