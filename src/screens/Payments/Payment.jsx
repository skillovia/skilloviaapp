import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PaymentSettings = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Settings</Text>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Billing')}
      >
        <Text style={styles.text}>Billing</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text style={styles.text}>Get Paid</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  item: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  text: { fontSize: 16 },
});

export default PaymentSettings;
