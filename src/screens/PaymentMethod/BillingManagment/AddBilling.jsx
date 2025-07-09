import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import apiClient from '../../../Hooks/Api'; 
import { Color } from '../../../Utils/Theme';


const AddBillingScreen = () => {
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState({
    card_number: '',
    expiry_date: '',
    cvv: '',
    address: '',
    city: '',
    postal_code: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Card number validation (16 digits)
    if (!formData.card_number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.card_number = 'Enter a valid 16-digit card number';
    }

    // Expiry date validation (MM/YY format)
    if (!formData.expiry_date.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiry_date = 'Enter a valid date (MM/YY)';
    }

    // CVV validation (3 or 4 digits)
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Enter a valid CVV';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  const handleChange = (name, value) => {
    if (name === 'card_number') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCardNumber(value)
      }));
    } else if (name === 'expiry_date') {
      // Format MM/YY
      const formatted = value
        .replace(/[^\d]/g, '')
        .substring(0, 4)
        .replace(/^([2-9])/, '0$1')
        .replace(/^(1[3-9])/, '12')
        .replace(/^([0-9]{2})/, '$1/');
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else if (name === 'cvv') {
      const formatted = value.replace(/[^\d]/g, '').substring(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/settings/payment/billingmethod', {
        card_number: formData.card_number.replace(/\s/g, ''),
        expiry_date: formData.expiry_date,
        cvv: formData.cvv,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code
      });

      // Reset form after successful submission
      setFormData({
        card_number: '',
        expiry_date: '',
        cvv: '',
        address: '',
        city: '',
        postal_code: ''
      });

      Alert.alert('Success', 'Billing method added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add billing method');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-back" size={24} color="#374151" />
              <Text style={styles.backButtonText}>Bills</Text>
            </TouchableOpacity>

            {/* Card Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card number</Text>
              <View style={styles.inputWrapper}>
                <Icon name="credit-card" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon, errors.card_number && styles.inputError]}
                  value={formData.card_number}
                  onChangeText={(value) => handleChange('card_number', value)}
                  placeholder="Enter card no."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              {errors.card_number && <Text style={styles.errorText}>{errors.card_number}</Text>}
            </View>

            {/* Expiry and CVV Row */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Expires on</Text>
                <TextInput
                  style={[styles.input, errors.expiry_date && styles.inputError]}
                  value={formData.expiry_date}
                  onChangeText={(value) => handleChange('expiry_date', value)}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={5}
                />
                {errors.expiry_date && <Text style={styles.errorText}>{errors.expiry_date}</Text>}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Security code</Text>
                <TextInput
                  style={[styles.input, errors.cvv && styles.inputError]}
                  value={formData.cvv}
                  onChangeText={(value) => handleChange('cvv', value)}
                  placeholder="•••"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter address"
                placeholderTextColor="#9CA3AF"
                multiline
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* City Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <View style={[styles.pickerContainer, errors.city && styles.inputError]}>
                <Picker
                  selectedValue={formData.city}
                  onValueChange={(value) => handleChange('city', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select city" value="" />
                  <Picker.Item label="Lagos" value="lagos" />
                  <Picker.Item label="Abuja" value="abuja" />
                  <Picker.Item label="Port Harcourt" value="port-harcourt" />
                </Picker>
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            {/* Postal Code Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Postal code (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.postal_code}
                onChangeText={(value) => handleChange('postal_code', value)}
                placeholder="Enter postal code"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save</Text>
              )}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#374151',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'AlbertSans-Medium',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: Color.inputbg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: Color.inputbg,
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: Color.secondary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
});

export default AddBillingScreen;