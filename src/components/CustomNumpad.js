import React from 'react';
import { View, StyleSheet } from 'react-native';
import RetroButton from './RetroButton';

export default function CustomNumpad({ onNumberPress, onDelete, onEnter }) {
  const rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['DEL', '0', '↵'] // Reemplazamos la palabra por el símbolo
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isEnter = key === '↵';
            const isDel = key === 'DEL';
            
            return (
              <RetroButton
                key={key}
                title={key}
                isAction={isEnter} // Esto activa el verde retro original
                onPress={() => {
                  if (isDel) onDelete();
                  else if (isEnter) onEnter();
                  else onNumberPress(key);
                }}
                // Al DEL le ponemos un fondo oscuro manualmente para no pisar el verde del Enter
                style={[styles.key, isDel && styles.delKey]}
                // Hacemos la flecha gigante para que se vea bien
                textStyle={[isDel && styles.delText, isEnter && styles.enterText]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#0a0d0a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4d4f4d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  key: {
    flex: 1,
    height: 70,
    marginHorizontal: 5,
  },
  delKey: {
    backgroundColor: '#ff4d4d', 
    borderBottomColor: '#cc0000',
  },
  delText: {
    color: '#ffffff',
  },
  enterText: {
    fontSize: 38, // Flecha bien grande
  }
});