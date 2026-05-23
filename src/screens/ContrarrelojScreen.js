import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomNumpad from '../components/CustomNumpad';
import VintageDisplay from '../components/VintageDisplay';
import { calcularPuntaje, generarOperacion } from '../utils/MathEngine';
import { desbloquearNivel, guardarPartida } from '../utils/StorageManager';
import { playSound } from '../utils/SoundManager';

export default function ContrarrelojScreen({ route, navigation }) {
  const { nombreJugador, modo, dificultad, iteraciones: tiempoTotalAsignado, tiempoPorOperacion } = route.params;

  const [rondaActual, setRondaActual] = useState(1);
  const [puntaje, setPuntaje] = useState(0);
  const [operacionActual, setOperacionActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  
  // ESTADOS DE LOS DOS RELOJES
  const [tiempoRestanteGlobal, setTiempoRestanteGlobal] = useState(tiempoTotalAsignado);
  const [tiempoRestanteOp, setTiempoRestanteOp] = useState(10);
  const [isDanger, setIsDanger] = useState(false);
  
  const globalTimerRef = useRef(null);
  const opTimerRef = useRef(null);
  const tiempoInicioOpRef = useRef(0);
  const tiempoTotalAcumuladoRef = useRef(0);
  const aciertosRef = useRef(0);
  
  // CANDADO MAESTRO: Evita que los dos relojes se disparen al mismo tiempo
  const isGameOverRef = useRef(false);

  const tiempoMaximoPregunta = tiempoPorOperacion * 1000;

  const cargarNuevaOperacion = () => {
    const nuevaOp = generarOperacion(dificultad);
    setOperacionActual(nuevaOp);
    setRespuestaUsuario('');
    setTiempoRestanteOp(tiempoMaximoPregunta / 1000);
    setIsDanger(false);
    tiempoInicioOpRef.current = Date.now();
  };

  useEffect(() => {
    cargarNuevaOperacion();
    return () => {
        clearTimeout(globalTimerRef.current);
        clearTimeout(opTimerRef.current);
    };
  }, []);

  // MOTOR 1: EL RELOJ DE LA PARTIDA (El gigante)
  useEffect(() => {
    if (!operacionActual || isGameOverRef.current) return;

    if (tiempoRestanteGlobal > 0) {
      globalTimerRef.current = setTimeout(() => {
        setTiempoRestanteGlobal(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(globalTimerRef.current);
    } else if (tiempoRestanteGlobal === 0) {
      isGameOverRef.current = true;
      terminarPartida('TIEMPO_AGOTADO', puntaje);
    }
  }, [tiempoRestanteGlobal, operacionActual]);

  // MOTOR 2: EL RELOJ DE LA OPERACIÓN (El que hace parpadear la pantalla en rojo)
  useEffect(() => {
    if (!operacionActual || isGameOverRef.current) return;

    if (tiempoRestanteOp > 0) {
      if (tiempoRestanteOp <= 3) setIsDanger(true);

      opTimerRef.current = setTimeout(() => {
        setTiempoRestanteOp(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(opTimerRef.current);
    } else if (tiempoRestanteOp === 0) {
      isGameOverRef.current = true;
      procesarRespuesta(true); // Forzamos el timeout por operación
    }
  }, [tiempoRestanteOp, operacionActual]);

  const handleNumberPress = (num) => {
    if (respuestaUsuario.length < 5) setRespuestaUsuario(respuestaUsuario + num);
  };
  
  const handleDelete = () => {
    setRespuestaUsuario(respuestaUsuario.slice(0, -1));
  };

  const procesarRespuesta = (fueTimeout = false) => {
    if (isGameOverRef.current && !fueTimeout) return;

    clearTimeout(opTimerRef.current); // Frenamos el reloj de la operación local
    
    const tiempoTardado = fueTimeout ? tiempoMaximoPregunta : (Date.now() - tiempoInicioOpRef.current);
    const numUsuario = parseInt(respuestaUsuario);
    const esCorrecta = !fueTimeout && numUsuario === operacionActual.resultadoCorrecto;
    
    if (esCorrecta) {
      playSound('acierto');
      tiempoTotalAcumuladoRef.current += tiempoTardado;
      aciertosRef.current += 1;
      
      const puntosObtenidos = calcularPuntaje(true, tiempoTardado, tiempoMaximoPregunta);
      // El prevState asegura que si sumamos puntos muy rápido, React no se pierda sumando
      setPuntaje(prev => prev + puntosObtenidos); 
      
      setRondaActual(prev => prev + 1);
      cargarNuevaOperacion(); 
    } else {
      playSound('error');
      // MUERTE SÚBITA: Contestó mal o se le acabó el tiempo de la operación
      isGameOverRef.current = true;
      clearTimeout(globalTimerRef.current);
      tiempoTotalAcumuladoRef.current += tiempoTardado;
      
      const penalidad = calcularPuntaje(false, tiempoTardado, tiempoMaximoPregunta);
      const scoreFinal = puntaje + penalidad;
      
      terminarPartida('FALLO', scoreFinal);
    }
  };

  const terminarPartida = async (motivo, scoreFinal) => {
    clearTimeout(globalTimerRef.current);
    clearTimeout(opTimerRef.current);
    
    const totalAciertos = aciertosRef.current;
    const promedio = totalAciertos > 0 
      ? (tiempoTotalAcumuladoRef.current / totalAciertos / 1000).toFixed(2) 
      : "0.00";
      
    let nivelDesbloqueado = false;

    // SISTEMA DE PROGRESIÓN POR UMBRAL DE PUNTOS
    // Se premia jugar rápido y no equivocarse
    if (dificultad === 'FACIL' && scoreFinal >= 500) {
        await desbloquearNivel(modo, 'MEDIO');
        nivelDesbloqueado = true;
    } else if (dificultad === 'MEDIO' && scoreFinal >= 1000) {
        await desbloquearNivel(modo, 'DIFICIL');
        nivelDesbloqueado = true;
    }

    const rondasJugadas = totalAciertos + (motivo === 'FALLO' ? 1 : 0);

    await guardarPartida({
      nombre: nombreJugador,
      modo, 
      dificultad,
      puntaje: scoreFinal,
      precision: Math.round((totalAciertos / rondasJugadas) * 100) || 0,
      tiempoPromedio: parseFloat(promedio)
    });

    navigation.replace('RoundResult', {
      nombreJugador,
      modo, 
      dificultad,
      iteraciones: rondasJugadas, 
      tiempoTotalOriginal: tiempoTotalAsignado,
      puntajeFinal: scoreFinal,
      aciertosFinales: totalAciertos,
      tiempoPromedio: promedio,
      nivelDesbloqueado,
      tiempoPorOperacion: tiempoPorOperacion
    });
  };

  if (!operacionActual) return null;

  //calculamos el porcentaje de la barra de tiempo (de 100% a 0%)
  const progresoPorcentaje = Math.max(0, (tiempoRestanteGlobal / tiempoTotalAsignado) * 100);

  return (
    <View style={styles.container}>
      {/* BARRA DE PROGRESO GLOBAL */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progresoPorcentaje}%` }]} />
      </View>

      <View style={styles.hud}>
        <View style={styles.statsContainer}>
          <Text style={styles.hudText}>OPERACIONES: {rondaActual}</Text>
          <Text style={styles.hudText}>PUNTOS: {puntaje}</Text>
        </View>
        {/* El reloj gigante ahora muestra el tiempo GLOBAL de la partida */}
        <Text style={[styles.timerText, isDanger && styles.dangerText]}>
          {tiempoRestanteOp}s
        </Text>
      </View>

      {/* La pantalla se va a poner roja según el tiempo de la OPERACIÓN, no de la partida */}
      <VintageDisplay 
        operation={operacionActual.operacionTexto} 
        result={respuestaUsuario}
        isDanger={isDanger} 
      />

      <CustomNumpad 
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
        onEnter={() => procesarRespuesta(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 20,
    justifyContent: 'center',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
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
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#0a0d0a',
    borderWidth: 1,
    borderColor: '#4d4f4d',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#97ad7c',
  },
});