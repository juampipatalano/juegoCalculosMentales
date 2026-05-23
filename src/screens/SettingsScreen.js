import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VintageFrame from '../components/VintageFrame';
import RetroButton from '../components/RetroButton';
import { reiniciarJuego } from '../utils/StorageManager';
import { toggleSound } from '../utils/SoundManager';

export default function SettingsScreen({ navigation }) {
  const [soundOn, setSoundOn] = useState(true);

  // Al entrar, chequeamos si el sonido está prendido o apagado
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('@sound_enabled');
        setSoundOn(stored !== 'false'); // Si es 'false' se apaga, sino queda activo
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  const handleToggleSound = async () => {
    const newState = await toggleSound();
    setSoundOn(newState);
  };

  const handleReiniciar = () => {
    Alert.alert(
      "PELIGRO CRÍTICO",
      "¿Estás seguro de que querés borrar todo el progreso? Esto es irreversible y se perderán tus récords.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, borrar memoria", 
          onPress: async () => {
            await reiniciarJuego();
            await AsyncStorage.removeItem('@nombre_jugador');
            Alert.alert("Éxito", "Memoria borrada. ¡El sistema está limpio!");
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AJUSTES DEL SISTEMA</Text>

      {/* BLOQUE DE AUDIO */}
      <VintageFrame style={styles.frame}>
        <Text style={styles.sectionTitle}>CONFIGURACIÓN DE AUDIO</Text>
        <RetroButton 
          title={soundOn ? "SONIDO: ACTIVADO" : "SONIDO: SILENCIADO"} 
          onPress={handleToggleSound}
          style={styles.soundBtn}
          isAction={soundOn} // Se pone verde si está activo, gris si está silenciado
        />
      </VintageFrame>

      {/* BLOQUE DE MEMORIA (Peligro) */}
      <VintageFrame style={styles.frame}>
        <Text style={styles.sectionTitle}>MEMORIA DEL JUEGO</Text>
        <Text style={styles.warningText}>
          Advertencia: Ejecutar esta acción resetea los datos locales, eliminando historial, nombres y rankings.
        </Text>
        <RetroButton 
          title="REINICIAR DATOS" 
          onPress={handleReiniciar} 
          style={styles.resetBtn} 
          textStyle={styles.resetText}
        />
      </VintageFrame>

      {/* Rellenamos el espacio para que el botón de volver quede abajo */}
      <View style={{ flex: 1 }} />

      <RetroButton 
        title="VOLVER AL MENÚ" 
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 20,
  },
  headerTitle: {
    fontSize: 26,
    color: '#97ad7c',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  frame: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#97ad7c',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#4d4f4d',
    paddingBottom: 5,
    marginBottom: 15,
  },
  soundBtn: {
    height: 60,
  },
  warningText: {
    color: '#a3a3a3',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  resetBtn: {
    backgroundColor: '#3b1a1a', 
    borderBottomColor: '#1a0a0a',
    height: 60,
  },
  resetText: {
    color: '#ff4d4d', 
    fontSize: 16,
  }
});