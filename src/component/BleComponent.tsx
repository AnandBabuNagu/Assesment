import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BleManager, Device, Service, State } from "react-native-ble-plx";

const manager = new BleManager();

const BleComponent = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
 
  useEffect(() => {
    const requestAndSetup = async () => {
      await requestPermissions();
      checkBluetoothState();
    };

    requestAndSetup();

    const subscription = manager.onStateChange((state) => {
      setIsBluetoothOn(state === State.PoweredOn);
    }, true);

    return () => {
      manager.destroy();
      subscription.remove(); 
    };
  }, []);
  /**
   * Request Bluetooth and location  permission for Android 
   */
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    } else if (Platform.OS === "ios") {
      await manager.state();
    }
  };
  
  /**
   * Check mobile Bluetooth Status
   */
  const checkBluetoothState = async () => {
    const state = await manager.state();
    setIsBluetoothOn(state === State.PoweredOn);
  };
  
  /**
   * Scan Near by Peripherals
   * @returns 
   */
  const scanDevices = () => {
    if (!isBluetoothOn) {
      Alert.alert("Bluetooth is Off", "Please turn on Bluetooth to scan devices.");
      return;
    }

    setDevices([]);
    setIsModalVisible(true);
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        return;
      }

      setDevices((prevDevices) => {
        if (!prevDevices.some((d) => device !== null && d.id === device.id)) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };
  
  /**
   * Connect to selected peripheral
   * @param device 
   */
  const connectToDevice = async (device: Device) => {
    setIsConnecting(true);

    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      setIsModalVisible(false);
      console.log("Connected to", connected.id);
      fetchDeviceServices(connected);
    } catch (error) {
      console.warn("Connection failed", error);
    } finally {
      setIsConnecting(false);
    }
  };
  

  /**
   * List all Services in the device after connected
   * @param device 
   */
  const fetchDeviceServices = async (device: Device) => {
    try {
      const discoveredServices = await device.services();
      setServices(discoveredServices);
    } catch (error) {
      console.warn("Error fetching services", error);
    }
  };
  
  /**
   * Disconnect the Peripheral
   */
  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setServices([]);
      console.log("Disconnected");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Scanner & Connector</Text>

      {/* Bluetooth State Check */}
      <Text style={[styles.bluetoothStatus, { color: isBluetoothOn ? "green" : "red" }]}>
        Bluetooth is {isBluetoothOn ? "On" : "Off"}
      </Text>

      {connectedDevice ? (
        <>
          <Text style={styles.connectedText}>
            Connected to: {connectedDevice.name || connectedDevice.id}
          </Text>
          <Button title="Disconnect" onPress={disconnectDevice} />

          <FlatList
            data={services}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <View style={styles.serviceItem}>
                <Text>{item.uuid}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <>
          <Button title="Scan Devices" onPress={scanDevices} />
        </>
      )}

      {/* BLE Devices Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Scanning BLE Devices.Please Wait...</Text>

          {isScanning ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
          ) : (
            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(item)}
                >
                  <Text>{item.name || "Unnamed"} ({item.id})</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {isConnecting && (
            <ActivityIndicator size="large" color="#ff9900" style={styles.spinner} />
          )}

          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  bluetoothStatus: { fontSize: 16, marginBottom: 10 },
  connectedText: { fontSize: 16, color: "green", marginVertical: 10 },
  deviceItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  serviceItem: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  spinner: { marginVertical: 20 },
});

export default BleComponent;
