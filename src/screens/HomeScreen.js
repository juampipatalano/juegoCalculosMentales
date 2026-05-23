import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import RetroButton from '../components/RetroButton';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen({ navigation, route }) {
  //Guardamos el nombre del jugador en el estado de React
  const [nombre, setNombre] = useState('');


  // Recupera el nombre guardado cada vez que el usuario vuelve al Menú Principal
  useEffect(() => {
    if (route.params?.nombreRegreso) {
      setNombre(route.params.nombreRegreso);
    }
  }, [route.params?.nombreRegreso]);
    

  //Función para validar y navegar a la siguiente pantalla
  const irAConfiguracion = async (modoElegido) => {
    if (nombre.trim() === '') {
      Alert.alert('Falta un dato', 'Por favor, ingresá tu nombre de jugador.');
      return;
    }
    
    // Forzamos el uppercase directo en la variable que viaja y se guarda
    const nombreLimpio = nombre.trim().toUpperCase(); 
    
    try {
      await AsyncStorage.setItem('@nombre_jugador', nombreLimpio);
    } catch (e) {
      console.error(e);
    }
    navigation.navigate('Config', { 
      nombreJugador: nombreLimpio, 
      modo: modoElegido 
    });
  };


  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
            autoCapitalize="characters"
            autoCorrect={false}

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
          <RetroButton 
            title="VER RANKINGS" 
            onPress={() => navigation.navigate('Rankings')} 
            style={styles.secondaryBtn} 
            textStyle={styles.secondaryText}
          />
          <RetroButton 
            title="AJUSTES" 
            onPress={() => navigation.navigate('Settings')} 
            style={styles.secondaryBtn} 
            textStyle={styles.secondaryText}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  },
  secondaryBtn: {
    backgroundColor: '#2a2d2a',
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    marginBottom: 10,
    height: 60, // Un poco más pequeños que los principales
  },
  secondaryText: {
    fontSize: 16,
    color: '#a3a3a3',
  },
  resetBtn: {
    backgroundColor: '#3b1a1a', 
    borderBottomColor: '#1a0a0a',
    borderBottomWidth: 2,
    height: 50,
  },
  resetText: {
    fontSize: 14,
    color: '#ff4d4d', 
  }
});