import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeComponent from './src/component/HomeComponent';
import WeatherComponent from './src/component/WeatherComponent';
import BleComponent from './src/component/BleComponent';
import WifiComponent from './src/component/WifiComponent';
import BarcodeComponent from './src/component/BarcodeComponent';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeComponent} />
        <Stack.Screen name="Weather" component={WeatherComponent} />
        <Stack.Screen name="BLE Scanner" component={BleComponent} />
        <Stack.Screen name="Wifi Scanner" component={WifiComponent} />
        <Stack.Screen name="Barcode Scanner" component={BarcodeComponent} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};
// <Stack.Screen name="Barcode Scanner" component={BarcodeComponent} />
export default App;
