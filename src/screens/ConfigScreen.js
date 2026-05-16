import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import RetroButton from '../components/RetroButton';
import { obtenerNivelesDesbloqueados } from '../utils/StorageManager';

export default function ConfigScreen({ route, navigation }) {
  // Rescatamos los datos que nos mandó el HomeScreen
  const { nombreJugador, modo } = route.params;

  const [dificultad, setDificultad] = useState('FACIL');
  const [iteraciones, setIteraciones] = useState('10');
  const [niveles, setNiveles] = useState({ FACIL: true, MEDIO: false, DIFICIL: false });

  // Hook para cargar el progreso del jugador apenas entra a la pantalla
  useEffect(() => {
    const cargarNiveles = async () => {
      const nivelesGuardados = await obtenerNivelesDesbloqueados();
      setNiveles(nivelesGuardados);
    };
    cargarNiveles();
  }, []);

  const iniciarJuego = () => {
    const cantIteraciones = parseInt(iteraciones);
    if (isNaN(cantIteraciones) || cantIteraciones < 1) {
      Alert.alert('Dato Inválido', 'Ingresá un número válido.');
      return;
    }

    // Armamos el paquete de datos final para mandarle a la pantalla del juego
    const datosPartida = {
      nombreJugador,
      modo,
      dificultad,
      iteraciones: cantIteraciones
    };

    // Derivamos a la pantalla correcta según el modo que eligió en el inicio
    switch (modo) {
      case 'CLASICO':
        navigation.navigate('ClassicMode', datosPartida);
        break;
      case 'VERDADERO/FALSO':
        navigation.navigate('TrueFalse', datosPartida);
        break;
      case 'MULTIPLE CHOICE':
        navigation.navigate('MultipleChoice', datosPartida);
        break;
      case 'RELOJ':
        navigation.navigate('TimeAttack', datosPartida);
        break;
    }
  };

  // Función auxiliar para dibujar los botones de dificultad (bloqueados o no)
  const renderBtnDificultad = (nivel, label) => {
    const desbloqueado = niveles[nivel];
    const seleccionado = dificultad === nivel;

    return (
      <RetroButton
        title={desbloqueado ? label : `🔒 ${label}`}
        onPress={() => desbloqueado ? setDificultad(nivel) : Alert.alert('Bloqueado', 'Superá el nivel anterior para desbloquear este.')}
        style={[
          styles.diffBtn,
          seleccionado && styles.diffBtnSelected,
          !desbloqueado && styles.diffBtnLocked
        ]}
        textStyle={!desbloqueado ? styles.diffTextLocked : null}
      />
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerInfo}>
          <Text style={styles.infoText}>JUGADOR: {nombreJugador}</Text>
          <Text style={styles.infoText}>MODO: {modo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>NIVEL DE DIFICULTAD:</Text>
          {renderBtnDificultad('FACIL', 'FÁCIL')}
          {renderBtnDificultad('MEDIO', 'MEDIO')}
          {renderBtnDificultad('DIFICIL', 'DIFÍCIL')}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {modo === 'RELOJ' ? 'TIEMPO TOTAL (SEGUNDOS):' : 'CANTIDAD DE OPERACIONES:'}
          </Text>
          <TextInput
            style={styles.input}
            value={iteraciones}
            onChangeText={setIteraciones}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <RetroButton
          title="¡INICIAR PARTIDA!"
          onPress={iniciarJuego}
          isAction={true}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d1a',
    padding: 20,
    justifyContent: 'space-between',
  },
  headerInfo: {
    backgroundColor: '#0a0d0a',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4d4f4d',
  },
  infoText: {
    color: '#97ad7c',
    fontSize: 18,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#97ad7c',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0a0d0a',
    color: '#97ad7c',
    fontSize: 32,
    fontFamily: 'monospace',
    padding: 15,
    borderWidth: 2,
    borderColor: '#4d4f4d',
    borderRadius: 8,
    textAlign: 'center',
  },
  diffBtn: {
    marginVertical: 5,
  },
  diffBtnSelected: {
    borderColor: '#97ad7c',
    borderWidth: 2,
  },
  diffBtnLocked: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#0a0a0a',
  },
  diffTextLocked: {
    color: '#4a4a4a',
  }
});