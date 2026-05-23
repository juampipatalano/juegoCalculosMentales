import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const toggleSound = async () => {
  try {
    const stored = await AsyncStorage.getItem('@sound_enabled');
    const currentState = stored !== 'false'; // Es true por defecto si no existe
    const newState = !currentState;
    
    await AsyncStorage.setItem('@sound_enabled', newState.toString());
    return newState;
  } catch (e) {
    console.error('Error al cambiar configuración de sonido', e);
    return true;
  }
};

export const playSound = async (type) => {
  try {
    // LEEMOS DIRECTO DEL DISCO: Si está en 'false', abortamos al instante sin sonar nada
    const stored = await AsyncStorage.getItem('@sound_enabled');
    if (stored === 'false') return;
    
    let soundAsset;

    // Mapeamos el tipo de sonido con el archivo correspondiente
    switch (type) {
      case 'click':
        soundAsset = require('../assets/sounds/click.m4a'); // Cambiá a .wav si usás ese formato
        break;
      case 'acierto':
        soundAsset = require('../assets/sounds/acierto.mp3');
        break;
      case 'error':
        soundAsset = require('../assets/sounds/error.mp3');
        break;
      case 'alerta':
        soundAsset = require('../assets/sounds/alerta.wav');
        break;
      default:
        return;
    }

    // Cargamos y reproducimos el sonido
    const { sound } = await Audio.Sound.createAsync(soundAsset);
    await sound.playAsync();

    // Limpiamos la memoria una vez que termina de sonar
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Error reproduciendo sonido:', error);
  }
};