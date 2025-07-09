
const handleSaveChanges = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    setSaving(true);

    const updateData = {
      firstname: profileData.firstName.trim(),      // Fixed: API expects firstname
      lastname: profileData.lastName.trim(),        // Fixed: API expects lastname
      email: profileData.email.trim(),
      website: profileData.website.trim(),
      locationName: profileData.city.trim(),        // Fixed: API expects locationName
      street: profileData.streetAddress.trim(),     // Fixed: API expects street
      zip_code: profileData.zipCode.trim(),         // Fixed: API expects zip_code
      gender: profileData.gender,
    };

    // Add password only if provided
    if (passwordData.password) {
      updateData.password = passwordData.password;
    }

    console.log('Sending update data:', updateData); // Debug log

    // Handle image upload if a new image is selected
    if (selectedImage) {
      const formData = new FormData();

      // Add all the text fields to FormData
      Object.keys(updateData).forEach(key => {
        formData.append(key, updateData[key]);
      });

      // Add the image file
      formData.append('photo', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'profile.jpg',
      });

      // Make request with FormData
      const response = await apiClient.put(`/users/update/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Update response:', response.data); // Debug log

      if (response.data.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } else {
      // Make request without image
      const response = await apiClient.put(`/users/update/${userId}`, updateData);

      console.log('Update response:', response.data); // Debug log

      if (response.data.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    }

  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error response:', error.response?.data); // Debug log
    Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
  } finally {
    setSaving(false);
  }
};



const fetchUserProfile = async () => {
  try {
    setLoading(true);

    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      Alert.alert('Error', 'No access token found. Please log in again.');
      navigation.navigate('login');
      return;
    }

    // Decode the token to get user ID
    const decodedToken = jwtDecode(accessToken);
    const userIdFromToken = decodedToken.id || decodedToken.user_id || decodedToken.sub;

    if (!userIdFromToken) {
      Alert.alert('Error', 'User ID not found in token. Please log in again.');
      navigation.navigate('login');
      return;
    }

    setUserId(userIdFromToken);

    // Fetch user profile data
    const response = await apiClient.get(`/users/profile/${userIdFromToken}`);
    
    if (response.data.status === 'success') {
      const userData = response.data.data;
      setProfileData({
        firstName: userData.firstname || '', // Fixed: backend uses lowercase
        lastName: userData.lastname || '',   // Fixed: backend uses lowercase
        email: userData.email || '',
        website: userData.website || '',
        city: userData.locationName || '',   // Fixed: backend uses locationName
        streetAddress: userData.street || '', // Fixed: backend uses street
        zipCode: userData.zip_code || '',    // Fixed: backend uses zip_code
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
*/