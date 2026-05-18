import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ConfigScreen from '../screens/ConfigScreen'; 
import StatsScreen from '../screens/StatsScreen';   
import ClassicModeScreen from '../screens/ClassicModeScreen';
import TrueFalseScreen from '../screens/TrueFalseScreen';
import MultipleChoiceScreen from '../screens/MultipleChoiceScreen';
import ContrarrelojScreen from '../screens/ContrarrelojScreen';
import RoundResultScreen from '../screens/RoundResultScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
            headerStyle: { backgroundColor: '#1a1d1a' }, 
            headerTintColor: '#97ad7c', 
            headerTitleStyle: { fontWeight: 'bold', fontFamily: 'monospace' },
        }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      {/* Agregás las rutas acá abajo */}
      <Stack.Screen name="Config" component={ConfigScreen} options={{ title: 'CONFIGURAR PARTIDA' }}/>
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'ESTADÍSTICAS' }}/>
      <Stack.Screen name="ClassicMode" component={ClassicModeScreen} options={{ title: 'MODO CLÁSICO' }}/>
      <Stack.Screen name="TrueFalse" component={TrueFalseScreen} options={{ title: 'VERDADERO/FALSO' }}/>
      <Stack.Screen name="MultipleChoice" component={MultipleChoiceScreen} options={{ title: 'MULTIPLE CHOICE' }}/>
      <Stack.Screen name="Contrarreloj" component={ContrarrelojScreen} options={{ title: 'CONTRARRELOJ' }}/>
      <Stack.Screen name="RoundResult" component={RoundResultScreen} options={{ title: 'RESUMEN DE RONDA', headerShown: false }}/>
    </Stack.Navigator>
  );
}