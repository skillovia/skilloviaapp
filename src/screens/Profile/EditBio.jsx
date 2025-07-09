import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const EditBio = ({
  initialBio,
  location = {},
  street,
  zip_code,
  lon,
  lat,
  onProfileUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bioText, setBioText] = useState(initialBio || '');

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        bio: bioText,
        locationName: location?.locationName || '',
        street: street || '',
        zip_code: zip_code || '',
        lon: lon || null,
        lat: lat || null,
      };

      const response = await apiClient.put('/users/profile/update/bio', payload);

      if (response.data) {
        // Update AsyncStorage with new profile data
        const currentProfile = await AsyncStorage.getItem('userProfile');
        const parsedProfile = currentProfile ? JSON.parse(currentProfile) : {};
        const updatedProfile = {
          ...parsedProfile,
          bio: bioText,
        };
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // Notify parent component
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }

        setIsEditing(false);
        Alert.alert('Success', 'Bio updated successfully');
      }
    } catch (error) {
      console.error('Bio update failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update bio');
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to update bio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setBioText(initialBio || '');
  };

  const handleEditPress = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // If canceling edit, reset bio text
      setBioText(initialBio || '');
      setError(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Edit Bio </Text>
        <TouchableOpacity
          onPress={handleEditPress}
          style={styles.editButton}
          disabled={isLoading}
        >
          <Icon 
            name={isEditing ? "x" : "edit-3"} 
            size={20} 
            color={isEditing ? "#EF4444" : Color.secondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Bio Section */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textArea}
            value={bioText}
            onChangeText={setBioText}
            placeholder="Write your bio..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
          
          {/* Edit Actions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isLoading}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isLoading}
              style={[styles.actionButton, styles.saveButton]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.displayContainer}>
          <Text style={styles.bioText}>
            {bioText || 'No bio available'}
          </Text>
        </View>
      )}

      {/* Location Section */}
      {(location?.locationName || street || zip_code) && (
        <View style={styles.locationContainer}>
          <View style={styles.locationHeader}>
            <Icon name="map-pin" size={16} color={Color.secondary} />
            <Text style={styles.locationTitle}>Location</Text>
          </View>
          
          <View style={styles.locationDetails}>
            {location?.locationName && (
              <View style={styles.locationItem}>
                <Icon name="home" size={14} color={Color.secondary} />
                <Text style={styles.locationText}>{location.locationName}</Text>
              </View>
            )}
            
            {street && (
              <View style={styles.locationItem}>
                <Icon name="navigation" size={14} color={Color.secondary} />
                <Text style={styles.locationText}>{street}</Text>
              </View>
            )}
         
            {zip_code && (
              <View style={styles.locationItem}>
                <Icon name="hash" size={14} color={Color.secondary} />
                <Text style={styles.locationText}>{zip_code}</Text>
              </View>
            )}
          </View>
          
          {lon && lat && (
            <Text style={styles.coordinatesText}>
              Coordinates: {lon.toFixed(6)}, {lat.toFixed(6)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
  },
  editButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
  },
  editContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    backgroundColor: Color.inputbg,
    color: '#374151',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  saveButton: {
    backgroundColor: Color.secondary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  displayContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
    lineHeight: 20,
  },
  locationContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginLeft: 6,
  },
  locationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.inputbg,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
    marginLeft: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'AlbertSans-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EditBio;