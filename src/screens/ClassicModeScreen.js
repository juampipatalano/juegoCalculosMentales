import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomNumpad from '../components/CustomNumpad';
import VintageDisplay from '../components/VintageDisplay';
import { calcularPuntaje, generarOperacion } from '../utils/MathEngine';
import { desbloquearNivel, guardarPartida } from '../utils/StorageManager';

export default function ClassicModeScreen({ route, navigation }) {
  const { nombreJugador, modo, dificultad, iteraciones } = route.params;

  const [rondaActual, setRondaActual] = useState(1);
  const [puntaje, setPuntaje] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [operacionActual, setOperacionActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [isDanger, setIsDanger] = useState(false);
  
  const timerRef = useRef(null);
  const tiempoInicioRef = useRef(0);
  const tiempoTotalAcumuladoRef = useRef(0);

  const tiempoMaximo = dificultad === 'FACIL' ? 10000 : dificultad === 'MEDIO' ? 7000 : 5000;

  // 1. CARGA DE DATOS (Solo actualiza el estado, ya no crea relojes)
  const cargarNuevaOperacion = () => {
    const nuevaOp = generarOperacion(dificultad);
    setOperacionActual(nuevaOp);
    setRespuestaUsuario('');
    setIsDanger(false);
    setTiempoRestante(tiempoMaximo / 1000);
    tiempoInicioRef.current = Date.now();
  };

  // Se ejecuta una sola vez al entrar
  useEffect(() => {
    cargarNuevaOperacion();
  }, []);

  // 2. EL NUEVO MOTOR DEL RELOJ (Infalible)
  // Este useEffect "vigila" el tiempo restante. Reemplaza al problemático setInterval.
  useEffect(() => {
    // Si no hay operación, no hacemos nada
    if (!operacionActual) return;

    // Si todavía hay tiempo, programamos que baje 1 segundo
    if (tiempoRestante > 0) {
      if (tiempoRestante <= 3) setIsDanger(true);

      timerRef.current = setTimeout(() => {
        setTiempoRestante(prev => prev - 1);
      }, 1000);

      // Limpieza vital: si el componente se actualiza antes del segundo, cancela este timeout
      return () => clearTimeout(timerRef.current);
    } 
    // Si el tiempo llega a cero, forzamos el timeout de forma segura
    else if (tiempoRestante === 0) {
      procesarRespuesta(true);
    }
  }, [tiempoRestante, operacionActual]);

  const handleNumberPress = (num) => {
    if (respuestaUsuario.length < 5) setRespuestaUsuario(respuestaUsuario + num);
  };
  
  const handleDelete = () => {
    setRespuestaUsuario(respuestaUsuario.slice(0, -1));
  };

  // 3. PROCESAMIENTO
  const procesarRespuesta = (fueTimeout = false) => {
    // Frenamos cualquier timeout pendiente al instante
    clearTimeout(timerRef.current);
    
    // Si fue timeout, asignamos el tiempo máximo (para el castigo de puntos)
    const tiempoTardado = fueTimeout ? tiempoMaximo : (Date.now() - tiempoInicioRef.current);
    tiempoTotalAcumuladoRef.current += tiempoTardado; 
    
    const numUsuario = parseInt(respuestaUsuario);
    // Si fue timeout, automáticamente es incorrecta
    const esCorrecta = !fueTimeout && numUsuario === operacionActual.resultadoCorrecto;

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
        await desbloquearNivel(modo, 'MEDIO'); // AGREGAMOS "modo" ACÁ
        nivelDesbloqueado = true;
      } else if (dificultad === 'MEDIO') {
        await desbloquearNivel(modo, 'DIFICIL'); // AGREGAMOS "modo" ACÁ
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
      <View style={styles.hud}>
        <View style={styles.statsContainer}>
          <Text style={styles.hudText}>OP: {rondaActual}/{iteraciones}</Text>
          <Text style={styles.hudText}>PTS: {puntaje}</Text>
        </View>
        <Text style={[styles.timerText, isDanger && styles.dangerText]}>
          {tiempoRestante}
        </Text>
      </View>

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
  }
});