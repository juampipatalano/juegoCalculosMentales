import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RetroButton from '../components/RetroButton';
import VintageDisplay from '../components/VintageDisplay';
import VintageFrame from '../components/VintageFrame'; // IMPORTAMOS EL FRAME
import { calcularPuntaje, generarOperacion } from '../utils/MathEngine';
import { desbloquearNivel, guardarPartida } from '../utils/StorageManager';

export default function TrueFalseScreen({ route, navigation }) {
  const { nombreJugador, modo, dificultad, iteraciones } = route.params;

  const [rondaActual, setRondaActual] = useState(1);
  const [puntaje, setPuntaje] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  
  const [operacionActual, setOperacionActual] = useState(null);
  
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [isDanger, setIsDanger] = useState(false);
  
  const timerRef = useRef(null);
  const tiempoInicioRef = useRef(0);
  const tiempoTotalAcumuladoRef = useRef(0);

  const tiempoMaximo = dificultad === 'FACIL' ? 10000 : dificultad === 'MEDIO' ? 7000 : 5000;

  const cargarNuevaOperacion = () => {
    const nuevaOp = generarOperacion(dificultad);
    setOperacionActual(nuevaOp);
    
    setIsDanger(false);
    setTiempoRestante(tiempoMaximo / 1000);
    tiempoInicioRef.current = Date.now();
  };

  useEffect(() => {
    cargarNuevaOperacion();
  }, []);

  // MOTOR DEL RELOJ
  useEffect(() => {
    if (!operacionActual) return;

    if (tiempoRestante > 0) {
      if (tiempoRestante <= 3) setIsDanger(true);

      timerRef.current = setTimeout(() => {
        setTiempoRestante(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timerRef.current);
    } else if (tiempoRestante === 0) {
      procesarRespuesta(null, true); 
    }
  }, [tiempoRestante, operacionActual]);

  const procesarRespuesta = (respuestaUsuario, fueTimeout = false) => {
    clearTimeout(timerRef.current);
    
    const tiempoTardado = fueTimeout ? tiempoMaximo : (Date.now() - tiempoInicioRef.current);
    tiempoTotalAcumuladoRef.current += tiempoTardado; 
    
    const esCorrecta = !fueTimeout && (respuestaUsuario === operacionActual.tfEsCorrecto);

    const nuevosAciertos = aciertos + (esCorrecta ? 1 : 0);
    if (esCorrecta) setAciertos(nuevosAciertos);

    const puntosObtenidos = calcularPuntaje(esCorrecta, tiempoTardado, tiempoMaximo);
    const nuevoPuntaje = puntaje + puntosObtenidos;
    setPuntaje(nuevoPuntaje);

    if (rondaActual >= iteraciones) {
      terminarPartida(nuevoPuntaje, nuevosAciertos);
    } else {
      setRondaActual(rondaActual + 1);
      cargarNuevaOperacion();
    }
  };

  const terminarPartida = async (puntajeFinal, aciertosFinales) => {
    const promedio = (tiempoTotalAcumuladoRef.current / iteraciones / 1000).toFixed(2);
    let nivelDesbloqueado = false;

    if (aciertosFinales === iteraciones) {
      if (dificultad === 'FACIL') {
        await desbloquearNivel(modo, 'MEDIO');
        nivelDesbloqueado = true;
      } else if (dificultad === 'MEDIO') {
        await desbloquearNivel(modo, 'DIFICIL');
        nivelDesbloqueado = true;
      }
    }

    await guardarPartida({
      modo, 
      dificultad,
      puntaje: puntajeFinal,
      precision: Math.round((aciertosFinales / iteraciones) * 100),
      tiempoPromedio: parseFloat(promedio)
    });

    navigation.replace('RoundResult', {
      nombreJugador,
      modo, 
      dificultad,
      iteraciones,
      puntajeFinal,
      aciertosFinales,
      tiempoPromedio: promedio,
      nivelDesbloqueado
    });
  };

  if (!operacionActual) return null;

  return (
    <View style={styles.container}>
      {/* CABECERA (Fuera del frame plástico, como stats flotantes) */}
      <View style={styles.hud}>
        <View style={styles.statsContainer}>
          <Text style={styles.hudText}>OP: {rondaActual}/{iteraciones}</Text>
          <Text style={styles.hudText}>PTS: {puntaje}</Text>
        </View>
        <Text style={[styles.timerText, isDanger && styles.dangerText]}>
          {tiempoRestante}
        </Text>
      </View>

      {/* CUERPO DE LA CALCULADORA */}
      <VintageFrame>
        <VintageDisplay 
          operation={operacionActual.operacionTexto} 
          result={`= ${operacionActual.tfPropuesto}`}
          isDanger={isDanger} 
        />

        <View style={styles.controlsContainer}>
          <RetroButton 
            title="VERDADERO" 
            onPress={() => procesarRespuesta(true, false)}
            isAction={true} 
            style={styles.controlBtn}
            textStyle={styles.controlText} // NUEVO: Achicamos la letra acá
          />
          <RetroButton 
            title="FALSO" 
            onPress={() => procesarRespuesta(false, false)}
            style={[styles.controlBtn, styles.falseBtn]}
            textStyle={styles.controlText} // NUEVO: Achicamos la letra acá
          />
        </View>
      </VintageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hud: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  statsContainer: {
    justifyContent: 'center',
  },
  hudText: {
    color: '#97ad7c',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  timerText: {
    color: '#97ad7c',
    fontSize: 54, 
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#ff4d4d',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  controlBtn: {
    flex: 1,
    height: 120, 
    marginHorizontal: 5,
  },
  falseBtn: {
    backgroundColor: '#ff4d4d', 
    borderBottomColor: '#cc0000',
  },
  // NUEVO ESTILO: Baja el tamaño de 22 (defecto) a 20 para que entre
  controlText: {
    fontSize: 20, 
  }
});