import React, { useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert, ActivityIndicator, StyleSheet,Platform  } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { PermissionsAndroid } from 'react-native';

const WifiComponent = () => {
  const [wifiList, setWifiList] = useState([]);
  const [password, setPassword] = useState('');
  const [selectedSSID, setSelectedSSID] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedSSID, setConnectedSSID] = useState(null);
  const [connectedIP, setConnectedIP] = useState(null);

  // Function to request location permission
 // Function to request location permission (Android only)
 const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to get Wi-Fi SSID.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true; 
};

  // Function to scan available Wi-Fi networks
  const scanWifiNetworks = async () => {
    const permissionGranted = await requestLocationPermission();
    if (!permissionGranted) {
      Alert.alert('Permission Denied', 'Location permission is required to scan Wi-Fi networks.');
      return;
    }

    try {
      const networks = await WifiManager.loadWifiList();
      const strWifiList = JSON.stringify(networks);
      setWifiList(JSON.parse(strWifiList));
    } catch (error) {
      console.error('Error scanning Wi-Fi:', error);
      Alert.alert('Error', 'Failed to scan Wi-Fi networks.');
    }
  };

  // Function to fetch connected Wi-Fi details
  const fetchConnectedWifiDetails = async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      const ip = await WifiManager.getIP();
      setConnectedSSID(ssid);
      setConnectedIP(ip);
    } catch (error) {
      console.error('Error fetching Wi-Fi details:', error);
    }
  };

  // Function to connect to Wi-Fi
  const connectToWifi = async () => {
    if (!selectedSSID) {
      Alert.alert('Select a Network', 'Please select a Wi-Fi network to connect.');
      return;
    }

    if (!password) {
      Alert.alert('Enter Password', 'Please enter the Wi-Fi password.');
      return;
    }

    setIsConnecting(true);

    try {
      await WifiManager.connectToProtectedSSID(selectedSSID, password, false, true);
      Alert.alert('Connected', `Connected to ${selectedSSID} successfully!`);
      fetchConnectedWifiDetails(); // Fetch Wi-Fi details after connection
    } catch (error) {
      console.error('Connection Error:', error);
      Alert.alert('Connection Failed', 'Unable to connect. Please check your password and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Scan for Wi-Fi Networks" onPress={scanWifiNetworks} />

      {wifiList.length > 0 && (
        <FlatList
          data={wifiList}
          keyExtractor={(item) => item.BSSID}
          renderItem={({ item }) => (
            <View style={styles.wifiItem}>
              <Text style={styles.ssidText}>{item.SSID}</Text>
              <Button title="Select" onPress={() => setSelectedSSID(item.SSID)} />
            </View>
          )}
        />
      )}

      {selectedSSID ? (
        <View style={styles.inputContainer}>
          <Text>Selected Network: {selectedSSID}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Wi-Fi Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {isConnecting ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Button title="Connect" onPress={connectToWifi} />
          )}
        </View>
      ) : null}

      {connectedSSID && (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedText}>✅ Connected to: {connectedSSID}</Text>
          <Text style={styles.connectedText}>📶 IP Address: {connectedIP}</Text>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  wifiItem: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ssidText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  connectedContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default WifiComponent;
