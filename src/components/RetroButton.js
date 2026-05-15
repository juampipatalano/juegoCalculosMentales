import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function RetroButton({ title, onPress, style, textStyle, isAction = false }) {
  return (
    <TouchableOpacity 
      // Si isAction es true, le suma los estilos especiales
      style={[styles.button, isAction && styles.actionButton, style]} 
      onPress={onPress}
      activeOpacity={0.7} // Efecto visual al presionar
    >
      <Text style={[styles.text, isAction && styles.actionText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b3d3b', // Gris oscuro plástico
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    // Este borde inferior grueso genera el efecto 3D de tecla física
    borderBottomWidth: 4, 
    borderBottomColor: '#1a1a1a', 
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    elevation: 3, // Sombreado en Android
  },
  actionButton: {
    backgroundColor: '#97ad7c', // Verde retro para botones especiales
    borderBottomColor: '#5c6b4a',
  },
  text: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace', // Lo cambiaremos a tu fuente Digital-7 después
  },
  actionText: {
    color: '#1a1d1a', // Letra oscura para que resalte en el fondo verde
  }
});