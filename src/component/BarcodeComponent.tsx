import React, { useState } from "react";
import { View, Text, Button, FlatList, Alert } from "react-native";
import { Camera } from "react-native-camera-kit";

const BarcodeComponent = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState([]);

  const onReadCode = (event:any) => {
    const scannedCode = event.nativeEvent.codeStringValue;
    console.log("Scanned Code:", scannedCode); 

    if (scannedCode) {
      Alert.alert("QR Code Found", scannedCode);
      
      setScannedBarcodes((prev) => {
        const updatedList = [scannedCode, ...prev].slice(0, 5);
        console.log("Updated Barcodes List:", updatedList); 
        return updatedList;
      });

      setIsScannerActive(false); // Stop scanning after success
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isScannerActive ? (
        <Camera
          style={{ flex: 1, width: "100%" }}
          scanBarcode={true}
          onReadCode={onReadCode}
          showFrame={true}
          laserColor="red"
          frameColor="white"
        />
      ) : (
        <View style={{ alignItems: "center" }}>
          <Button title="Start Scanning" onPress={() => setIsScannerActive(true)} />
          
          <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
            Last 5 Scanned Barcodes:
          </Text>

          <FlatList
            data={scannedBarcodes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={{ fontSize: 16, marginVertical: 5 }}>
                {item ? item : "No data"}
              </Text>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default BarcodeComponent;
