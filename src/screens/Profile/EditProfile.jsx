import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { launchImageLibrary } from 'react-native-image-picker';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';

const GOOGLE_PLACES_API_KEY = 'AIzaSyChFAjrSODzkkKl_TaCCslNXdHwIWR-_uw';

const EditProfile = ({ navigation }) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    website: '',
    city: '',
    streetAddress: '',
    zipCode: '',
    gender: '',
    bio: '',
    photourl: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'No access token found. Please log in again.');
        navigation.navigate('login');
        return;
      }
      const decodedToken = jwtDecode(accessToken);
      const userIdFromToken = decodedToken.id || decodedToken.user_id || decodedToken.sub;
      if (!userIdFromToken) {
        Alert.alert('Error', 'User ID not found in token. Please log in again.');
        navigation.navigate('login');
        return;
      }
      setUserId(userIdFromToken);
      const response = await apiClient.get(`/users/profile/${userIdFromToken}`);
      if (response.data.status === 'success') {
        const userData = response.data.data;
        setProfileData({
          firstName: userData.firstname || '',
          lastName: userData.lastname || '',
          email: userData.email || '',
          website: userData.website || '',
          city: userData.locationName || '',
          streetAddress: userData.street || '',
          zipCode: userData.zip_code || '',
          gender: userData.gender || '',
          bio: userData.bio || '',
          photourl: userData.photourl || '',
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const validateForm = () => {
    if (!profileData.firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return false;
    }
    if (!profileData.lastName.trim()) {
      Alert.alert('Validation Error', 'Last name is required');
      return false;
    }
    if (!profileData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (passwordData.password && passwordData.password !== passwordData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }
    if (passwordData.password && passwordData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      // 1. Update text fields
      const updateData = {
        firstname: profileData.firstName.trim(),
        lastname: profileData.lastName.trim(),
        email: profileData.email.trim(),
        website: profileData.website.trim(),
        locationName: profileData.city.trim(),
        street: profileData.streetAddress.trim(),
        zip_code: profileData.zipCode.trim(),
        gender: profileData.gender,
      };
      if (passwordData.password) {
        updateData.password = passwordData.password;
      }
      await apiClient.put(`/users/update/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 2. Upload photo if changed
      if (selectedImage) {
        const formData = new FormData();
        formData.append('photo', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName || 'profile.jpg',
        });
        await apiClient.put('/users/profile/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor={Color.background} barStyle="dark-content" translucent={false} />
        <ActivityIndicator size="large" color={Color.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Color.background} barStyle="dark-content" translucent={false} />
      {/* Header with flex row and Save Button */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit profile</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButtonSmall, saving && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Color.secondary} />
          ) : (
            <Text style={styles.saveButtonTextSmall}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={selectImage} style={styles.imageWrapper}>
            <Image
              source={{
                uri: selectedImage?.uri || profileData.photourl ||
                  'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732326507/9d48ce83863147361d369d469dcf3993_yaemuc.jpg'
              }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>
        {/* Personal Details Section */}
        <Text style={styles.sectionTitle}>Personal details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First name *</Text>
          <TextInput
            style={styles.input}
            value={profileData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="Enter first name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last name *</Text>
          <TextInput
            style={styles.input}
            value={profileData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            placeholder="Enter last name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={profileData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            placeholder="Enter email address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={profileData.gender}
            onChangeText={(text) => handleInputChange('gender', text)}
            placeholder="Enter gender"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website link</Text>
          <TextInput
            style={styles.input}
            value={profileData.website}
            onChangeText={(text) => handleInputChange('website', text)}
            placeholder="https://www.example.com"
            autoCapitalize="none"
          />
        </View>
        {/* Location Details Section */}
        <Text style={styles.sectionTitle}>Location details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter city"
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
              let city = data.structured_formatting.main_text || data.description;
              setProfileData(prev => ({
                ...prev,
                city: city
              }));
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              types: '(cities)',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
              listView: { backgroundColor: '#fff' },
            }}
            enablePoweredByContainer={false}
            debounce={300}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street address</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter street address"
            minLength={3}
            fetchDetails={true}
            onPress={(data, details = null) => {
              setProfileData(prev => ({
                ...prev,
                streetAddress: data.description
              }));
              if (details && details.address_components) {
                const zipObj = details.address_components.find(comp =>
                  comp.types.includes('postal_code')
                );
                if (zipObj) {
                  setProfileData(prev => ({
                    ...prev,
                    zipCode: zipObj.long_name
                  }));
                }
              }
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              types: 'address',
            }}
            styles={{
              textInput: styles.input,
              container: { flex: 0 },
              listView: { backgroundColor: '#fff' },
            }}
            enablePoweredByContainer={false}
            debounce={300}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ZIP/Postal Code</Text>
          <TextInput
            style={styles.input}
            value={profileData.zipCode}
            onChangeText={(text) => handleInputChange('zipCode', text)}
            placeholder="Enter ZIP/Postal code"
          />
        </View>
        {/* Password Section */}
        <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={passwordData.password}
            onChangeText={(text) => handlePasswordChange('password', text)}
            secureTextEntry={true}
            placeholder="Enter new password (min 6 characters)"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={passwordData.confirmPassword}
            onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
            secureTextEntry={true}
            placeholder="Confirm new password"
            autoCapitalize="none"
          />
        </View>
        {/* Bottom Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Color.secondary} />
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
  },
  // FLEX HEADER ROW: Header and Save Button aligned horizontally
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    justifyContent: 'space-between',
    backgroundColor: Color.background,
    zIndex: 10, // so it's above autocomplete dropdowns
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Color.primary,
    borderRadius: 12,
    padding: 4,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Color.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: Color.primary,
    padding: 16,
    borderRadius: 30,
    marginVertical: 24,
  },
  saveButtonSmall: {
    backgroundColor: Color.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 24,
    marginLeft: 12,
    alignSelf: 'center',
    minWidth: 77,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Color.secondary,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  saveButtonTextSmall: {
    color: Color.secondary,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'AlbertSans-Bold',
  },
});

export default EditProfile;