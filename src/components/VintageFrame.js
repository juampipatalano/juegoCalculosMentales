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
    backgroundColor: '#3b3d3b', // Gris plástico de la carcasa
    borderWidth: 4,
    borderColor: '#4d4f4d',
    borderBottomColor: '#1a1a1a', // Borde inferior más oscuro para efecto 3D
    borderRadius: 15,
    padding: 15,
    elevation: 5, // Sombra en Android
    width: '100%',
    marginVertical: 10,
  },
});