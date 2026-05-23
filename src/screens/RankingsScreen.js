import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VintageFrame from '../components/VintageFrame';
import { obtenerHistorial } from '../utils/StorageManager';

export default function RankingsScreen() {
  const [historial, setHistorial] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const cargarDatos = async () => {
        const datos = await obtenerHistorial();
        setHistorial(datos);
      };
      cargarDatos();
    }, [])
  );

  const obtenerTop5 = (modo, dificultad) => {
    return historial
      .filter(p => p.modo === modo && p.dificultad === dificultad)
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 5);
  };

  const renderRankingTabla = (modo, tituloModo) => {
    const dificultades = ['FACIL', 'MEDIO', 'DIFICIL'];

    return (
      <VintageFrame key={modo} style={styles.rankingFrame}>
        <Text style={styles.modeTitle}>{tituloModo}</Text>
        
        {dificultades.map(dif => {
          const top5 = obtenerTop5(modo, dif);
          return (
            <View key={dif} style={styles.difficultySection}>
              <Text style={styles.difficultyTitle}>--- {dif} ---</Text>
              
              {top5.length === 0 ? (
                <Text style={styles.noData}>Sin registros</Text>
              ) : (
                top5.map((partida, index) => (
                  <View key={index} style={styles.rankingRow}>
                    {/* Corrección aquí: sin espacios sueltos literales */}
                    <Text style={styles.rankNum}>{`#${index + 1}`}</Text>
                    <Text style={styles.rankName} numberOfLines={1}>
                      {partida.nombre || 'ANÓNIMO'}
                    </Text>
                    <Text style={styles.rankScore}>{`${partida.puntaje} PTS`}</Text>
                    <Text style={styles.rankDetail}>{`${partida.precision}% AC`}</Text>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </VintageFrame>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>TOP 5 RANKINGS</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderRankingTabla('CLASICO', 'MODO CLÁSICO')}
        {renderRankingTabla('TF', 'VERDADERO / FALSO')}
        {renderRankingTabla('CHOICE', 'MÚLTIPLE CHOICE')}
        {renderRankingTabla('RELOJ', 'CONTRA RELOJ')}
        
        {/* Corrección aquí: removido el comentario/espacio plano */}
        <View style={styles.screenSpacer} />
      </ScrollView>
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
    fontSize: 28,
    color: '#97ad7c',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  rankingFrame: {
    marginBottom: 20,
  },
  modeTitle: {
    color: '#97ad7c',
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4d4f4d',
    paddingBottom: 5,
    marginBottom: 10,
  },
  difficultySection: {
    marginBottom: 15,
  },
  difficultyTitle: {
    color: '#a3a3a3',
    fontFamily: 'monospace',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0a0d0a',
    padding: 8,
    marginVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2d2a',
    alignItems: 'center',
  },
  rankName: {
    color: '#a3a3a3',
    fontFamily: 'monospace',
    flex: 1.2, // Le damos espacio flexible para que empuje los números a la derecha
    marginHorizontal: 5,
  },
  rankNum: {
    color: '#ff4d4d',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: 35,
  },
  rankScore: {
    color: '#97ad7c',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rankDetail: {
    color: '#5c6b4a',
    fontFamily: 'monospace',
    width: 60,
    textAlign: 'right',
  },
  noData: {
    color: '#4d4f4d',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 5,
  },
  screenSpacer: {
    height: 40,
  }
});