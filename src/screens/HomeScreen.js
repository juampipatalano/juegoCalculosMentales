import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import RetroButton from '../components/RetroButton';

export default function HomeScreen({ navigation }) {
  //Guardamos el nombre del jugador en el estado de React
  const [nombre, setNombre] = useState('');

  //Función para validar y navegar a la siguiente pantalla
  const irAConfiguracion = (modoElegido) => {
    if (nombre.trim() === '') {
      Alert.alert('Falta un dato', 'Por favor, ingresá tu nombre de jugador.');
      return;
    }
    //Viajamos a la pantalla Config y le pasamos los datos necesarios para configurar la partida
    navigation.navigate('Config', { 
      nombreJugador: nombre, 
      modo: modoElegido 
    });
  };

  return (
    <View style={styles.container}>
      {/* Título estilo Arcade/Calculadora */}
      <View style={styles.header}>
        <Text style={styles.title}>CALCU MATH</Text>
        <Text style={styles.subtitle}>JUEGO DE CÁLCULOS MENTALES</Text>
      </View>

      {/* Input retro para el nombre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>JUGADOR:</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="INGRESA TU NOMBRE"
          placeholderTextColor="#5c6b4a" // Verde más oscuro
          maxLength={15}
        />
      </View>

      {/* Botones de los 4 modos */}
      <View style={styles.buttonGrid}>
        <RetroButton 
          title="MODO CLÁSICO" 
          onPress={() => irAConfiguracion('CLASICO')} 
        />
        <RetroButton 
          title="VERDADERO / FALSO" 
          onPress={() => irAConfiguracion('TF')} 
        />
        <RetroButton 
          title="MÚLTIPLE CHOICE" 
          onPress={() => irAConfiguracion('CHOICE')} 
        />
        <RetroButton 
          title="CONTRA RELOJ" 
          onPress={() => irAConfiguracion('RELOJ')} 
          isAction={true} // Lo hacemos verde para que resalte
        />
      </View>

      {/* Botón de estadísticas abajo de todo */}
      <View style={styles.footer}>
        <RetroButton 
          title="VER ESTADÍSTICAS" 
          onPress={() => navigation.navigate('Stats')} 
          style={styles.statsBtn} 
          textStyle={styles.statsText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a', // Fondo oscuro vintage
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    color: '#97ad7c', // Verde LCD
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#5c6b4a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a3a3a3',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#97ad7c',
    fontSize: 18,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#0a0d0a', // Fondo casi negro para el visor
    color: '#97ad7c',
    fontSize: 24,
    fontFamily: 'monospace',
    padding: 15,
    borderWidth: 2,
    borderColor: '#4d4f4d',
    borderRadius: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttonGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginBottom: 20,
  },
  statsBtn: {
    backgroundColor: '#2a2d2a', // Un poco más claro que el fondo
    borderBottomWidth: 2,
  },
  statsText: {
    fontSize: 18,
    color: '#a3a3a3',
  }
});