import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';


const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsOldPasswordVisible(false);
    setIsNewPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
  };

  const validateInputs = () => {
    if (!oldPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your old password');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return false;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Validation Error', 'New password must be different from old password');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await apiClient.put('/users/change/password', {
        password: oldPassword,
        newPassword: newPassword,
      });
  
      // Use the response data
      console.log('Password change response:', response.data);
      
      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        const successMessage = response.data?.message || 'Password updated successfully!';
        
        // Show success alert
        Alert.alert(
          'Success',
          successMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                navigation.goBack();
              },
            },
          ],
          { cancelable: false } // Prevent dismissing by tapping outside
        );
      } else {
        // Handle unexpected success status codes
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error response data:', data); // Use the error response data
        
        if (status === 400) {
          errorMessage = data?.message || 'Invalid password provided';
        } else if (status === 401) {
          errorMessage = data?.message || 'Current password is incorrect';
        } else if (status === 403) {
          errorMessage = data?.message || 'You are not authorized to perform this action';
        } else if (status === 422) {
          // Handle validation errors from server
          errorMessage = data?.message || 'Password validation failed';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else {
          errorMessage = data?.message || `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error - no response received
        console.log('Network error:', error.request);
        errorMessage = 'Network error. Please check your internet connection';
      } else {
        // Something else happened
        console.log('Unexpected error:', error.message);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
  
      // Show error alert
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6EC" />

      {/* Header */}
      <View style={[styles.header, { marginTop: getStatusBarHeight() }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={[styles.backButton, loading && styles.disabled]}
        >
          <Icon name="arrow-left" size={24} color={loading ? "#999" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change password</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Input Form */}
      <View style={styles.form}>
        {/* Old Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Old Password</Text>
          <View style={[styles.inputWrapper, loading && styles.inputDisabled]}>
            <TextInput
              style={styles.input}
              placeholder="Enter old password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isOldPasswordVisible}
              value={oldPassword}
              onChangeText={setOldPassword}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
              disabled={loading}
            >
              <Icon
                name={isOldPasswordVisible ? 'eye' : 'eye-off'}
                size={20}
                color={loading ? "#999" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={[styles.inputWrapper, loading && styles.inputDisabled]}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isNewPasswordVisible}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
              disabled={loading}
            >
              <Icon
                name={isNewPasswordVisible ? 'eye' : 'eye-off'}
                size={20}
                color={loading ? "#999" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={[styles.inputWrapper, loading && styles.inputDisabled]}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              disabled={loading}
            >
              <Icon
                name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                size={20}
                color={loading ? "#999" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Color.secondary} />
              <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                Updating...
              </Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginLeft: 9,
  },
  form: {
    flex: 1,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Color.gray,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'AlbertSans-Light',
    color: '#333',
    paddingVertical: 12,
  },
  saveButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F4F6EC',
  },
  saveButton: {
    backgroundColor: Color.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});


export default ChangePasswordScreen;