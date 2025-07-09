import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const OtpScreen = ({ route, navigation }) => {
  const { email } = route.params; 
  const [otp, setOtp] = useState(['', '', '', '']); 
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [timerActive, setTimerActive] = useState(true); // Start timer active
  const inputRefs = useRef([]);

  // Start timer when component mounts
  useEffect(() => {
    setTimerActive(true);
  }, []);

  // Handle OTP input change and focus on next input
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key press for better UX
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // OTP verification
  const handleOtpVerification = async () => {
    const otpCode = otp.join('');
    console.log('Entered OTP:', otpCode);
    console.log('Email:', email);

    if (!otpCode || otpCode.length < 4) {
      Alert.alert('Error', 'Please enter the full OTP');
      console.log('Error: Incomplete OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/verify/email', {
        email: email,
        code: otpCode,
      });
      
      console.log('API Response:', response);

      if (response.data.status === 'success') {
        console.log('OTP verification successful');
        Alert.alert('Success', 'OTP verified successfully');

navigation.navigate('personal', { email: email });
      } else {
        console.log('OTP verification failed:', response.data.message);
        Alert.alert('Error', response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP functionality and countdown timer
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/resend/code', {
        email: email,
      });
      
      if (response.data.status === 'success') {
        Alert.alert('Success', 'OTP has been resent to your email');
        setCountdown(30);
        setTimerActive(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timerActive && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
  }, [countdown, timerActive]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f6fceb"
        translucent={false}
      />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Input OTP verification</Text>
          <Text style={styles.subtitle}>A code was sent to {email}</Text>

          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="numeric"
                value={value}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleOtpVerification}
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {timerActive ? (
            <Text style={styles.resendText}>
              Resend OTP in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('login')}>
              Log in
            </Text>
          </Text>

          <Text style={styles.termsText}>
            By continuing to use Skillovia, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
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
    backgroundColor: '#f6fceb', // Matching the app's theme from previous screens
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
  },
  content: {
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'AlbertSans-Medium',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#CCC',
    textAlign: 'center',
    fontSize: 24,
    borderRadius: 10,
    // backgroundColor: '#fff',
  },
  verifyButton: {
    backgroundColor: Color.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  verifyButtonText: {
    color: Color.secondary,
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'AlbertSans-Medium',
    textAlign: 'center',
  },
  resendButton: {
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    color: Color.secondary,
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  loginText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'AlbertSans-Medium',
    textAlign: 'center',
  },
  link: {
    color: Color.secondary,
    fontFamily: 'AlbertSans-Bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'AlbertSans-Medium',
    textAlign: 'center',
  },
});

export default OtpScreen;