import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function VintageDisplay({ operation, result, isDanger }) {
  // Creamos un valor animado (arranca en 0)
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDanger) {
      // Si estamos en peligro, iniciamos un bucle infinito
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1, // Va hacia el rojo
            duration: 300, // Muy rápido (300ms)
            useNativeDriver: false, // Para colores debe ser false
          }),
          Animated.timing(colorAnim, {
            toValue: 0, // Vuelve al verde
            duration: 300,
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      // Si se acaba el peligro (pasa de nivel), detenemos la animación
      colorAnim.stopAnimation();
      colorAnim.setValue(0);
    }
  }, [isDanger]);

  // Interpolamos el valor de 0 a 1 para que devuelva los colores hexadecimales
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#97ad7c', '#ff4d4d'] // De verde LCD a rojo alarma
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.operationText}>{operation}</Text>
      
      {/* Si el usuario todavía no escribió nada, mostramos un guión bajo parpadeante */}
      <Text style={styles.resultText}>
        {result !== '' ? result : '_'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Alinea el texto a la derecha como en las calculadoras
    // Bordes invertidos para hacer el efecto de que la pantalla está "hundida" en el plástico
    borderWidth: 4,
    borderColor: '#4d4f4d',
    borderTopColor: '#1a1a1a',
    borderLeftColor: '#1a1a1a',
    marginBottom: 20,
  },
  operationText: {
    fontSize: 24,
    color: '#1b2114',
    fontFamily: 'monospace',
    opacity: 0.7, // Un poco transparente para simular cristal líquido secundario
  },
  resultText: {
    fontSize: 48,
    color: '#1b2114',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  }
});