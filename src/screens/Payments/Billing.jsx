import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const Billing = ({ navigation }) => {
  const billingMethods = [
    { id: '1', cardNumber: '**** **** **** 4002', expiry: '20/2024' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing</Text>
      {billingMethods.length ? (
        <FlatList
          data={billingMethods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.cardNumber}</Text>
              <Text style={styles.cardText}>Expiry: {item.expiry}</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>No active billing method</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddBillingMethod')}
      >
        <Text style={styles.buttonText}>Add a New Billing Method</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  cardText: { fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});

export default Billing;
