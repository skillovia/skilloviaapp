import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../../Hooks/Api'; 
import { Color } from '../../../Utils/Theme';

// Back Button Component
const BackButton = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Icon name="arrow-back" size={24} color="#333" />
      <Text style={styles.backButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const AddWithdrawal = () => {
  const navigation = useNavigation();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    // Validation
    if (!bankName.trim()) {
      setError('Bank name is required');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account number is required');
      return;
    }
    if (!accountName.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post('/settings/payment/withdrawalmethod', {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
      });

      // Success
      Alert.alert(
        'Success',
        'Withdrawal method added successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setBankName('');
              setAccountNumber('');
              setAccountName('');
              // Navigate back or to withdrawal management
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error occurred:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while saving';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <BackButton 
            label="Withdraw" 
            onPress={() => navigation.goBack()} 
          />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank name</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Enter bank name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account number</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter account number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account name</Text>
              <TextInput
                style={styles.input}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Account name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
    fontFamily: 'AlbertSans-Medium',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'AlbertSans-Medium',

  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: Color.inputbg,
    color: '#333',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Color.secondary,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'flex-start',
    minWidth: '50%',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    textTransform: 'uppercase',
  },
});

export default AddWithdrawal;