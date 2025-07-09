import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const PersonalDetailsScreen = ({ route, navigation }) => {
  const { email } = route.params; 
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: email,
    gender: '',
    password: '',
    phone: '',
    referred_by: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleChange = (field, value) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
      setPasswordMatch(formData.password === value);
    } else if (field === 'password') {
      setFormData(prevData => ({
        ...prevData,
        [field]: value,
      }));
      setPasswordMatch(value === confirmPassword);
    } else {
      setFormData(prevData => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Validate required fields
    if (!formData.firstname || !formData.lastname || !formData.phone || 
        !formData.gender || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        phone: formData.phone,
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        gender: formData.gender,
        password: formData.password,
        referred_by: formData.referred_by,
      });

      console.log('Registration Response:', response);

      if (response.data) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('welcome') 
          }
        ]);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
        hidden={false}
      />
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Personal details</Text>
          <Text style={styles.subtitle}>Input your personal details</Text>

          <View style={styles.form}>
            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
              />
            </View>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={formData.firstname}
                onChangeText={(text) => handleChange('firstname', text)}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={formData.lastname}
                onChangeText={(text) => handleChange('lastname', text)}
              />
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                placeholder="Enter email"
                value={formData.email}
                editable={false}
                keyboardType="email-address"
              />
            </View>

            {/* Gender Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['male', 'female', 'other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      formData.gender === gender && styles.genderOptionSelected
                    ]}
                    onPress={() => handleChange('gender', gender)}
                  >
                    <Text style={[
                      styles.genderText,
                      formData.gender === gender && styles.genderTextSelected
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Referred By (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Referred By (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Referral code or name"
                value={formData.referred_by}
                onChangeText={(text) => handleChange('referred_by', text)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  secureTextEntry={!isPasswordVisible}
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Icon
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    confirmPassword.length > 0 && (passwordMatch ? styles.matchInput : styles.noMatchInput)
                  ]}
                  placeholder="Confirm your password"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <Icon
                    name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <Text style={[
                  styles.passwordMatchText,
                  passwordMatch ? styles.matchText : styles.noMatchText
                ]}>
                  {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                (loading || !passwordMatch) && styles.submitButtonDisabled
              ]}
              disabled={loading || !passwordMatch}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.link} onPress={() => navigation.navigate('login')}>
                Log in
              </Text>
            </Text>

            {/* Terms and Privacy */}
            <Text style={styles.termsText}>
              By continuing to use Skillovia, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    fontFamily: 'AlbertSans-Medium',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    backgroundColor: Color.inputbg,
  },
  readOnlyInput: {
    backgroundColor: Color.inputbg,
    color: '#666',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderOptionSelected: {
    backgroundColor: Color.secondary,
    borderColor: Color.primary,
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
  },
  genderTextSelected: {
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    backgroundColor: Color.inputbg,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  matchInput: {
    borderColor: '#4CAF50',
  },
  noMatchInput: {
    borderColor: '#f44336',
  },
  passwordMatchText: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'AlbertSans-Regular',
  },
  matchText: {
    color: '#4CAF50',
  },
  noMatchText: {
    color: '#f44336',
  },
  submitButton: {
    backgroundColor: Color.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: Color.secondary,
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
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
    lineHeight: 18,
  },
});

export default PersonalDetailsScreen;