import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateAccountScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Check for tokens in route params (similar to URL params in web)
  useEffect(() => {
    const checkForTokens = async () => {
      try {
        const accessToken = route.params?.accessToken;
        const refreshToken = route.params?.refreshToken;

        console.log("🔑 Access Token:", accessToken);
        console.log("🔄 Refresh Token:", refreshToken);

        if (accessToken && refreshToken) {
          console.log("✅ Tokens found! Saving to AsyncStorage...");

          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', refreshToken);
          console.log("📝 Tokens successfully saved to AsyncStorage!");

          // Navigate to home or explore screen after saving tokens
          setTimeout(() => {
            navigation.replace('home');
          }, 500);
        } else {
          console.log("❌ No tokens found in params.");
        }
      } catch (error) {
        console.error("❌ Error saving tokens:", error);
      }
    };

    checkForTokens();
  }, [route.params, navigation]);

  const handleVerify = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
  
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const response = await apiClient.post('/auth/resend/code', {
        email: email, // Changed from 'phone' to 'email' to match web version
      });
  
      if (response.data.status === 'success') {
        setSuccess(response.data.message || 'Verification code sent successfully!');
        
        // Add a short delay before navigation to show the success message
        setTimeout(() => {
          navigation.navigate('otp', { email });
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message || 'Invalid request. Please check your email.');
      } else {
        setError('Something went wrong. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
   
    Alert.alert('Google Sign In', 'Redirecting to Google OAuth...');

  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f6fceb" 
        translucent={false}
      />
      <ScrollView style={styles.container}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>We need your email</Text>

        <Text style={styles.label}>Input your email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => setEmail(text)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your email"
            placeholderTextColor="#999"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
         
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing to use Skillovia, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6fceb',
  },
  container: {
    flex: 1,
    backgroundColor: '#f6fceb', 
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 20,
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
    backgroundColor: '#f0f6e6', // Matching web version input background
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginBottom: 10,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: Color.primary,
    borderRadius: 25, // More rounded like web version
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D3D3D3',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#777',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    paddingVertical: 10,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#2196F3', 
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  link: {
    color: Color.secondary,
  },
});

export default CreateAccountScreen;