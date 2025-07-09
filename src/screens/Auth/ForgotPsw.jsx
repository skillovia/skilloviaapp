import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../Hooks/Api'; 
import { Color } from '../../Utils/Theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    // Reset states
    setSuccess(false);

    // Validate email
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot/password', {
        email: email.trim()
      });

      // Check if the response matches expected format
      if (response.data && response.data.status === 'success') {
        setSuccess(true);
        Alert.alert(
          'Success',
          response.data.message || 'Password reset instructions have been sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('login') 
            }
          ]
        );
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        disabled={loading}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Let's recover your password!</Text>
      <Text style={styles.subtitle}>
        We'll send you a link to your email to reset your password.
      </Text>

      {/* Success Message */}
      {success && (
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={24} color="#32CD32" />
          <Text style={styles.successText}>
            Password reset instructions have been sent to your email.
          </Text>
          <Text style={styles.successSubtext}>
            Check your inbox for further instructions.
          </Text>
        </View>
      )}

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, loading && styles.inputDisabled]}
        placeholder="john@example.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      {/* Verify Button */}
      <TouchableOpacity 
        style={[styles.verifyButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login Link */}
      <TouchableOpacity 
        style={styles.backToLoginContainer}
        onPress={() => navigation.navigate('login')} // Adjust route name as needed
        disabled={loading}
      >
        <Icon name="arrow-back" size={16} color="#666" />
        <Text style={styles.backToLoginText}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    marginBottom: 30,
  },
  successContainer: {
    backgroundColor: '#F0FFF0',
    borderWidth: 1,
    borderColor: '#32CD32',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#228B22',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  successSubtext: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#228B22',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginBottom: 30,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  verifyButton: {
    backgroundColor:Color.secondary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#90EE90',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#fff',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  backToLoginText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    marginLeft: 5,
  },
});

export default ForgotPasswordScreen;