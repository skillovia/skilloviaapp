import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const HourlyRate = ({ navigation }) => {
  const [hourlyRate, setHourlyRate] = useState('5.00');
  const sparkTokens = (parseFloat(hourlyRate) / 2).toFixed(1);

  const handleRateChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    
    // Limit to two decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setHourlyRate(cleanedText);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a skill</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Set your hourly/token rate.</Text>
        
        <View style={styles.rateContainer}>
          <Text style={styles.label}>Hourly rate</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={handleRateChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Text style={styles.perHour}>/hr</Text>
          </View>
          <Text style={styles.tokenRate}>{sparkTokens} Spark tokens</Text>
        </View>
      </View>

      {/* Done Button */}
      <TouchableOpacity
        style={[styles.doneButton, !hourlyRate && styles.disabledButton]}
        onPress={() => hourlyRate && navigation.navigate('myskill', { hourlyRate: parseFloat(hourlyRate) })}
        disabled={!hourlyRate}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginBottom: 24,
  },
  rateContainer: {
  
    
  },
  label: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor:Color.gray,
    borderRadius: 8,
    padding: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#333333',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#333333',
    padding: 10,
  },
  perHour: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  tokenRate: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
  },
  doneButton: {
    backgroundColor: '#32CD32',
    padding: 16,
    borderRadius: 30,
    margin: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});

export default HourlyRate;




