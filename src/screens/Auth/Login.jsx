import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        // Save the access token to AsyncStorage
        const accessToken = response.data.data.accessToken;
        
        // Log the token to see its format
        console.log('Access Token:', accessToken);
        console.log('Token type:', typeof accessToken);
        console.log('Token length:', accessToken?.length);
        
        // Check if token exists and is a string
        if (!accessToken) {
          Alert.alert('Error', 'No access token received from server');
          return;
        }

        if (typeof accessToken !== 'string') {
          Alert.alert('Error', 'Access token is not a string');
          return;
        }

        // Save token to AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);

        // Try to decode the JWT
        try {
          // Check if token has the basic JWT structure (three parts separated by dots)
          const tokenParts = accessToken.split('.');
          console.log('Token parts count:', tokenParts.length);
          
          if (tokenParts.length !== 3) {
            console.log('Invalid JWT format - should have 3 parts separated by dots');
            Alert.alert('Warning', 'Access token is not in valid JWT format');
            // Still navigate to home since login was successful
            navigation.navigate('home');
            return;
          }

          const decodedToken = jwtDecode(accessToken);
          console.log('Decoded Token:', JSON.stringify(decodedToken, null, 2));
          
          await AsyncStorage.setItem('decodedToken', JSON.stringify(decodedToken));
          
          // Check token expiration
          if (decodedToken.exp) {
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
              Alert.alert('Warning', 'Token has expired');
            } else {
              console.log('Token expires at:', new Date(decodedToken.exp * 1000));
            }
          }

        } catch (decodeError) {
          console.error('JWT Decode Error:', decodeError);
          console.error('Error details:', decodeError.message);
          Alert.alert('Warning', `Could not decode access token: ${decodeError.message}`);
          // Don't return here - still navigate since login was successful
        }

        // Navigate to home screen regardless of decode success
        navigation.navigate('home');
        
      } else {
        Alert.alert('Login Failed', response.data.message || 'Please check your credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Something went wrong. Please try again';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Color.background}
      />
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Welcome back!</Text>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('forgotpsw')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        {/* Sign-Up Link */}
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.signupText} onPress={() => navigation.navigate('signup')}>
            Sign up
          </Text>
        </Text>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          By continuing to use Skillovia, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.background,
  },
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginBottom: 30,
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
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    height: 50,
    marginBottom: 20,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: Color.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    textAlign: 'center',
  },
  linkText: {
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
});

export default LoginScreen;