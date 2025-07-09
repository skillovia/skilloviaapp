import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const LogoutScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
 
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('refreshToken');
      
      // Optional: Clear all AsyncStorage data
      await AsyncStorage.clear();    
      
      console.log('All tokens cleared successfully');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1750820480/logout_nkq5xe.png' }}
            style={styles.logoutIcon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Ready to Leave?</Text>
        <Text style={styles.message}>
          Are you sure you want to logout? You'll need to sign in again to access your account.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Stay Logged In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Yes, Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F6E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.inputbg,
    borderBottomWidth: 1,
    borderBottomColor: Color.gray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'AlbertSans-Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Color.secondary,
    padding: 20,
    borderRadius: 80,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 60,
    height: 60,
    tintColor: Color.secondary,
  },
  title: {
    fontSize: 24,
    color: Color.secondary,
    marginBottom: 16,
    fontFamily: 'AlbertSans-Bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
    fontFamily: 'AlbertSans-Regular',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#1A4D00',
  },
  logoutButton: {
    backgroundColor: Color.secondary,
  },
  cancelButtonText: {
    color: '#1A4D00',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'AlbertSans-Medium',
  },
});

export default LogoutScreen;