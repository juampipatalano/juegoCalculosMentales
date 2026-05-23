import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import VintageFrame from '../components/VintageFrame';
import RetroButton from '../components/RetroButton';
import { obtenerHistorial } from '../utils/StorageManager';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 70; // Ajuste dinámico para el ancho de pantalla
const CHART_HEIGHT = 160;

export default function StatsScreen({ navigation }) {
  const [historial, setHistorial] = useState([]);
  const [statsGlobales, setStatsGlobales] = useState({
    totalPartidas: 0,
    puntajeTotal: 0,
    precisionPromedio: 0,
    precisionClasico: 0,
    precisionVF: 0,
    precisionChoice: 0,
    mejorPuntaje: 0,
    mejorPuntajeModo: 'N/A'
  });

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    const datos = await obtenerHistorial();
    setHistorial(datos);

    if (datos.length > 0) {
      const puntajeTotal = datos.reduce((sum, p) => sum + p.puntaje, 0);
      const precisionTotal = datos.reduce((sum, p) => sum + p.precision, 0);
      
      // 1. Buscamos el mejor puntaje de la historia
      const partidaRecord = datos.reduce((max, p) => p.puntaje > max.puntaje ? p : max, datos[0]);

      // Separamos por modos para las barras
      const clasico = datos.filter(d => d.modo === 'CLASICO');
      const vf = datos.filter(d => d.modo === 'TF');
      const choice = datos.filter(d => d.modo === 'CHOICE');

      const calcPrec = (arr) => arr.length > 0 ? Math.round(arr.reduce((s, p) => s + p.precision, 0) / arr.length) : 0;

      setStatsGlobales({
        totalPartidas: datos.length,
        puntajeTotal: puntajeTotal,
        precisionPromedio: Math.round(precisionTotal / datos.length),
        precisionClasico: calcPrec(clasico),
        precisionVF: calcPrec(vf),
        precisionChoice: calcPrec(choice),
        mejorPuntaje: partidaRecord.puntaje,
        mejorPuntajeModo: partidaRecord.modo === 'TF' ? 'V/F' : partidaRecord.modo
      });
    } else {
      setStatsGlobales({ 
        totalPartidas: 0, puntajeTotal: 0, precisionPromedio: 0, 
        precisionClasico: 0, precisionVF: 0, precisionChoice: 0,
        mejorPuntaje: 0, mejorPuntajeModo: 'N/A' 
      });
    }
  };

  // 2. FUNCIÓN PARA GENERAR EL GRÁFICO DE LÍNEAS (Últimas 10 partidas)
  const renderGraficoVelocidad = () => {
    // Tomamos las últimas 10 partidas en orden cronológico (las más viejas primero para el eje X)
    const partidasCronologicas = [...historial].sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0));
    const ultimas10 = partidasCronologicas.slice(-10);
    
    if (ultimas10.length < 2) {
      return <Text style={styles.noData}>Se necesitan al menos 2 partidas para graficar la velocidad.</Text>;
    }

    const tiempos = ultimas10.map(p => p.tiempoPromedio);
    const maxTiempo = Math.max(...tiempos, 5); // Asegura un tope mínimo de visualización
    const minTiempo = Math.min(...tiempos, 0);

    // Mapeo matemático de puntos al plano SVG
    const puntos = ultimas10.map((p, index) => {
      const x = (index / (ultimas10.length - 1)) * (CHART_WIDTH - 40) + 25;
      // Invertimos el eje Y porque en SVG el 0 está arriba de todo
      const y = CHART_HEIGHT - 25 - ((p.tiempoPromedio - minTiempo) / (maxTiempo - minTiempo || 1)) * (CHART_HEIGHT - 50);
      return { x, y, valor: p.tiempoPromedio };
    });

    // Construimos el string del Path ("M x y L x y...")
    let pathD = `M ${puntos[0].x} ${puntos[0].y}`;
    for (let i = 1; i < puntos.length; i++) {
      pathD += ` L ${puntos[i].x} ${puntos[i].y}`;
    }

    return (
      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Línea base horizontal de referencia */}
          <Line x1="20" y1={CHART_HEIGHT - 20} x2={CHART_WIDTH - 10} y2={CHART_HEIGHT - 20} stroke="#2a2d2a" strokeWidth="1" />
          
          {/* El gráfico de líneas principal */}
          <Path d={pathD} fill="none" stroke="#97ad7c" strokeWidth="3" />

          {/* Dibujamos los picos y valles (Círculos y etiquetas de tiempo) */}
          {puntos.map((p, i) => (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y} r="4" fill="#ff4d4d" />
              <SvgText
                x={p.x}
                y={p.y - 8}
                fill="#97ad7c"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {p.valor}s
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
        <View style={styles.chartFooterLabels}>
          <Text style={styles.chartFooterText}>Anteriores</Text>
          <Text style={styles.chartFooterText}>Reciente</Text>
        </View>
      </View>
    );
  };

  const BarraEstadistica = ({ label, porcentaje }) => (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${porcentaje}%` }]} />
      </View>
      <Text style={styles.barValue}>{porcentaje}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>ANALÍTICAS GENERALES</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* BLOQUE DE RÉCORDS E HITOS */}
        <VintageFrame style={styles.summaryFrame}>
          <Text style={styles.sectionTitle}>RÉCORDS DEL SISTEMA</Text>
          <View style={styles.statsRow}>
            <Text style={styles.recordLabel}>🏆 MEJOR PUNTAJE:</Text>
            <Text style={styles.recordValue}>{statsGlobales.mejorPuntaje} PTS</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>MODO DEL RÉCORD:</Text>
            <Text style={styles.statValue}>{statsGlobales.mejorPuntajeModo}</Text>
          </View>
        </VintageFrame>

        {/* RESUMEN GLOBAL */}
        <VintageFrame style={styles.summaryFrame}>
          <Text style={styles.sectionTitle}>RESUMEN GLOBAL</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>PARTIDAS JUGADAS:</Text>
            <Text style={styles.statValue}>{statsGlobales.totalPartidas}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>PUNTAJE ACUMULADO:</Text>
            <Text style={styles.statValue}>{statsGlobales.puntajeTotal} PTS</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>PRECISIÓN MEDIA:</Text>
            <Text style={styles.statValue}>{statsGlobales.precisionPromedio}%</Text>
          </View>
        </VintageFrame>

        {/* GRÁFICO DE LÍNEAS DE VELOCIDAD */}
        <VintageFrame style={styles.summaryFrame}>
          <Text style={styles.sectionTitle}>HISTORIAL DE VELOCIDAD</Text>
          <Text style={styles.chartSubtitle}>Tiempo de respuesta (últimas 10 rondas)</Text>
          {renderGraficoVelocidad()}
        </VintageFrame>

        {/* PRECISIÓN POR MODO */}
        <VintageFrame style={styles.summaryFrame}>
          <Text style={styles.sectionTitle}>PRECISIÓN POR MODO</Text>
          <BarraEstadistica label="CLÁSICO" porcentaje={statsGlobales.precisionClasico} />
          <BarraEstadistica label="V/F" porcentaje={statsGlobales.precisionVF} />
          <BarraEstadistica label="CHOICE" porcentaje={statsGlobales.precisionChoice} />
        </VintageFrame>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 15,
  },
  headerTitle: {
    fontSize: 26,
    color: '#97ad7c',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryFrame: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#97ad7c',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#4d4f4d',
    paddingBottom: 5,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  statLabel: {
    color: '#a3a3a3',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  statValue: {
    color: '#97ad7c',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  recordLabel: {
    color: '#ff4d4d',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  recordValue: {
    color: '#ff4d4d',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  barLabel: {
    color: '#a3a3a3',
    fontFamily: 'monospace',
    width: 70,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#0a0d0a',
    borderWidth: 1,
    borderColor: '#4d4f4d',
    marginHorizontal: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#97ad7c',
  },
  barValue: {
    color: '#97ad7c',
    fontFamily: 'monospace',
    width: 35,
    textAlign: 'right',
    fontSize: 12,
  },
  chartSubtitle: {
    color: '#5c6b4a',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 5,
  },
  chartFooterLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  chartFooterText: {
    color: '#4d4f4d',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  noData: {
    color: '#4d4f4d',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 15,
  },
  actionButtons: {
    marginTop: 10,
    marginBottom: 20,
  },
  btnSpacing: {
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: '#2b1414', 
    borderBottomColor: '#120505',
    height: 45,
  },
  resetText: {
    color: '#ff4d4d', 
    fontSize: 13,
  }
});