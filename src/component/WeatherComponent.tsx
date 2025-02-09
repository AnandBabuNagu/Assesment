import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Snackbar from 'react-native-snackbar';

const WeatherComponent = () => {
  const [zip, setZip] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const apiKey = '63b303ad3d1f177c8eb7f5f061fb98c2';

  
  /**
   * Load search history from AsyncStorage
   */
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
        showSnackbar("Failed to load search history!");
      //console.error('Failed to load search history:', error);
    }
  };

  
  /**
   * Save search history to AsyncStorage
   * @param newHistory 
   */
  const saveSearchHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
    showSnackbar("Failed to save search history!");
     // console.error('Failed to save search history:', error);
    }
  };

  
  /**
   * Fetch weather and forecast data
   * @param zipCode 
   */
  const fetchWeatherData = async (zipCode:any) => {
    try {
      // Fetch current weather data
      const currentWeatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${apiKey}&units=metric`);
      setWeather(currentWeatherResponse.data);

      // Fetch 5-day forecast data
      const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},us&appid=${apiKey}&units=metric`);
      const forecastData = forecastResponse.data.list.filter((item, index) => index % 8 === 0); // Filter to show 3-5 day forecast
      setForecast(forecastData);

      // Update search history
      const newHistory = [
        { zip: zipCode, temperature: currentWeatherResponse.data.main.temp },
        ...searchHistory.filter((item) => item.zip !== zipCode),
      ].slice(0, 5); // Keep the last 5 searches
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
    } catch (error) {
      //console.error('Error fetching weather data:', error);
      showSnackbar("Unable to Fetch Weather Report for this location!");
    }
  };

  
  /**
   * Handle search action
   */
  const handleSearch = () => {
    if (zip) {
      fetchWeatherData(zip);
      setZip('');
    }
  };

  
  /**
   * Load search history on component mount
   */
  useEffect(() => {
    loadSearchHistory();
  }, []);


    const showSnackbar = (message : string) => {
      Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red', 
        action: {
          text: 'UNDO',
          textColor: 'yellow',
          
          onPress: () => {
            console.log('Snackbar action pressed!');
          },
        },
      });
    };


  return (
    <View style={styles.container}>
      <Text>Enter ZIP Code:</Text>
      <TextInput
        style={styles.input}
        placeholder="ZIP Code"
        keyboardType="numeric"
        value={zip}
        onChangeText={setZip}
      />
      <Button title="Get Weather" onPress={handleSearch} />

      {weather && (
        <View style={styles.weatherContainer}>
          <Text>Current Weather in {weather.name}:</Text>
          <Text>Temperature: {weather.main.temp}°C</Text>
          <Text>Condition: {weather.weather[0].description}</Text>
        </View>
      )}

      {forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text>5-Day Forecast:</Text>
          <FlatList
            data={forecast}
            keyExtractor={(item) => item.dt_txt}
            renderItem={({ item }) => (
              <View style={styles.forecastItem}>
                <Text>{item.dt_txt}</Text>
                <Text>{item.main.temp}°C</Text>
                <Text>{item.weather[0].description}</Text>
              </View>
            )}
          />
        </View>
      )}

      {searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text>Recent Searches:</Text>
          <FlatList
            data={searchHistory}
            keyExtractor={(item) => item.zip}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text>ZIP: {item.zip}</Text>
                <Text>Temp: {item.temperature}°C</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderBottomWidth: 1, marginVertical: 10, padding: 5 },
  weatherContainer: { marginTop: 20 },
  forecastContainer: { marginTop: 20 },
  forecastItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  historyContainer: { marginTop: 20 },
  historyItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default WeatherComponent;
