import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos las "llaves" con las que vamos a guardar los datos
const KEYS = {
  HISTORIAL: '@historial_partidas',
  NIVELES: '@niveles_desbloqueados',
};

/**
 * Guarda los resultados de una ronda terminada en el historial.
 * @param {object} partida - Ej: { modo: 'Clasico', dificultad: 'FACIL', puntaje: 450, precision: 80 }
 */
export const guardarPartida = async (partida) => {
  try {
    // 1. Traemos el historial anterior
    const historialString = await AsyncStorage.getItem(KEYS.HISTORIAL);
    const historial = historialString ? JSON.parse(historialString) : [];

    // 2. Le agregamos la fecha actual a la partida y la metemos al principio de la lista
    const nuevaPartida = { ...partida, fecha: new Date().toISOString() };
    historial.unshift(nuevaPartida);

    // 3. Guardamos la lista actualizada (convertida a String)
    await AsyncStorage.setItem(KEYS.HISTORIAL, JSON.stringify(historial));
  } catch (error) {
    console.error('Error guardando la partida:', error);
  }
};



/**
 * Obtiene todo el historial de partidas jugadas.
 * @returns {Array} Lista de partidas
 */
export const obtenerHistorial = async () => {
  try {
    const historialString = await AsyncStorage.getItem(KEYS.HISTORIAL);
    return historialString ? JSON.parse(historialString) : [];
  } catch (error) {
    console.error('Error obteniendo el historial:', error);
    return [];
  }
};



/**
 * Desbloquea un nuevo nivel de dificultad.
 * @param {string} nivel - 'MEDIO' o 'DIFICIL'
 */
export const desbloquearNivel = async (nivel) => {
  try {
    const nivelesString = await AsyncStorage.getItem(KEYS.NIVELES);
    const niveles = nivelesString ? JSON.parse(nivelesString) : { FACIL: true, MEDIO: false, DIFICIL: false };

    niveles[nivel] = true;

    await AsyncStorage.setItem(KEYS.NIVELES, JSON.stringify(niveles));
  } catch (error) {
    console.error('Error desbloqueando el nivel:', error);
  }
};



/**
 * Consulta qué niveles están desbloqueados.
 * @returns {object} Ej: { FACIL: true, MEDIO: true, DIFICIL: false }
 */
export const obtenerNivelesDesbloqueados = async () => {
  try {
    const nivelesString = await AsyncStorage.getItem(KEYS.NIVELES);
    // Fácil siempre viene desbloqueado por defecto
    return nivelesString ? JSON.parse(nivelesString) : { FACIL: true, MEDIO: false, DIFICIL: false };
  } catch (error) {
    console.error('Error obteniendo niveles:', error);
    return { FACIL: true, MEDIO: false, DIFICIL: false };
  }
};



/**
 * Borra absolutamente todos los datos de la app (Posibilidad de reiniciar el juego).
 */
export const reiniciarJuego = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error reiniciando el juego:', error);
  }
};