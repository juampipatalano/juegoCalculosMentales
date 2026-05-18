import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RetroButton from '../components/RetroButton';

export default function RoundResultScreen({ route, navigation }) {
  // Recibimos todo el desglose de la partida que terminó
  const { 
    nombreJugador, 
    modo, 
    dificultad, 
    iteraciones, 
    puntajeFinal, 
    aciertosFinales, 
    tiempoPromedio,
    nivelDesbloqueado 
  } = route.params;

  // Calculamos el porcentaje de precisión para el reporte
  const precision = Math.round((aciertosFinales / iteraciones) * 100);

  // Función para reiniciar instantáneamente usando la misma configuración
  const volverAJugar = () => {
    let screenName = 'ClassicMode';
    // Dejamos preparados los otros modos para cuando los armemos
    if (modo === 'TF') screenName = 'TrueFalse';
    if (modo === 'CHOICE') screenName = 'MultipleChoice';
    if (modo === 'RELOJ') screenName = 'TimeAttack';

    // replace() borra la pantalla de resultados y vuelve a montar el juego limpio
    navigation.replace(screenName, { nombreJugador, modo, dificultad, iteraciones });
  };

  return (
    <View style={styles.container}>
      <View style={styles.ticketContainer}>
        {/* Encabezado estilo ticket/reporte físico */}
        <Text style={styles.ticketHeader}>--- REPORTE DE RONDA ---</Text>
        <Text style={styles.ticketText}>JUGADOR: {nombreJugador.toUpperCase()}</Text>
        <Text style={styles.ticketText}>MODO: {modo}</Text>
        <Text style={styles.ticketText}>DIFICULTAD: {dificultad}</Text>
        <Text style={styles.divider}>------------------------</Text>

        {/* Bloque central de estadísticas (Pantalla LCD secundaria) */}
        <View style={styles.lcdSummary}>
          <Text style={styles.lcdTitle}>PUNTAJE FINAL</Text>
          <Text style={styles.lcdValue}>{puntajeFinal} PTS</Text>
        </View>

        {/* Desglose de métricas */}
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>ACIERTOS:</Text>
          <Text style={styles.statValue}>{aciertosFinales} / {iteraciones}</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>PRECISIÓN:</Text>
          <Text style={styles.statValue}>{precision}%</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>TIEMPO PROMEDIO:</Text>
          <Text style={styles.statValue}>{tiempoPromedio}s</Text>
        </View>

        <Text style={styles.divider}>------------------------</Text>

        {/* Alerta de progreso / Desbloqueo */}
        {nivelDesbloqueado ? (
          <View style={styles.unlockBadge}>
            <Text style={styles.unlockText}> ¡NUEVO NIVEL DESBLOQUEADO!</Text>
          </View>
        ) : (
          <Text style={styles.lockNotice}>
            {aciertosFinales === iteraciones 
              ? "¡Máximo nivel alcanzado!" 
              : "Completá el 100% de aciertos para desbloquear el siguiente nivel."}
          </Text>
        )}
      </View>

      {/* Botones de acción inferiores */}
      <View style={styles.buttonContainer}>
        <RetroButton 
          title="VOLVER A JUGAR" 
          onPress={volverAJugar}
          isAction={true} 
          style={styles.btnSpacing}
        />
        <RetroButton 
          title="CAMBIAR DE NIVEL" 
          onPress={() => navigation.navigate('Config', { nombreJugador, modo })}
          isAction={true} // Botón verde principal
        />
        <RetroButton 
          title="MENÚ PRINCIPAL" 
          onPress={() => navigation.navigate('Home')}
          style={styles.menuBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 20,
    justifyContent: 'space-between',
  },
  ticketContainer: {
    backgroundColor: '#0a0d0a', // Visor oscuro de fondo
    borderWidth: 3,
    borderColor: '#4d4f4d',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
  },
  ticketHeader: {
    color: '#97ad7c',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  ticketText: {
    color: '#a3a3a3',
    fontSize: 16,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  divider: {
    color: '#4d4f4d',
    textAlign: 'center',
    marginVertical: 10,
  },
  lcdSummary: {
    backgroundColor: '#97ad7c', // Verde LCD vintage
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#5c6b4a',
  },
  lcdTitle: {
    color: '#1b2114',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: 0.8,
  },
  lcdValue: {
    color: '#1b2114',
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  statLabel: {
    color: '#a3a3a3',
    fontSize: 15,
    fontFamily: 'monospace',
  },
  statValue: {
    color: '#97ad7c',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  unlockBadge: {
    backgroundColor: '#1b2114',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#97ad7c',
    alignItems: 'center',
    marginTop: 10,
  },
  unlockText: {
    color: '#97ad7c',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  lockNotice: {
    color: '#5c5c5c',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  menuBtn: {
    backgroundColor: '#2a2d2a',
    marginTop: 10,
  }
});