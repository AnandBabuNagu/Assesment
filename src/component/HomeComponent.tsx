import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeComponent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assesments</Text>
      <View style={{ width: 200, marginVertical: 10 }}>
        <Button title="Weather" onPress={() => navigation.navigate('Weather')} />
      </View>
      <View style={{ width: 200, marginVertical: 10 }}>
        <Button title="BLE Scanner" onPress={() => navigation.navigate('BLE Scanner')} />
      </View>
       <View style={{ width: 200, marginVertical: 10 }}>
        <Button title="Wifi Scanner" onPress={() => navigation.navigate('Wifi Scanner')} />
       </View>

       <View style={{ width: 200, marginVertical: 10 }}>
        <Button title="Barcode Scanner" onPress={() => navigation.navigate('Barcode Scanner')} />
       </View>
       
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginVertical:10,gap: 10 },
  title: { fontSize: 20, marginBottom: 20 },
  separator: {
    width: 100, // Adjust the width for desired spacing
  }
  
});

export default HomeComponent;