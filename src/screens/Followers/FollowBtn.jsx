import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const FollowButton = ({ 
  userId, 
  style = {}, 
  textStyle = {},
  onFollowSuccess = null,
  showAlert = false 
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
    }
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(`following_${userId}`);
      if (stored !== null) {
        setIsFollowing(stored === 'true');
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (isLoading || !userId) return;
    
    setIsLoading(true);
    
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'Please login to follow users');
        return;
      }

      const url = `/follows/${isFollowing ? 'unfollow' : 'follow'}/${userId}`;
      const method = isFollowing ? 'delete' : 'post';
      
      const response = await apiClient[method](url);
      
      if (response.data.status === "success") {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);
        await AsyncStorage.setItem(`following_${userId}`, newFollowingState.toString());
        
        // Call success callback if provided
        if (onFollowSuccess) {
          onFollowSuccess(newFollowingState);
        }
        
        // Show success alert if enabled
        if (showAlert) {
          Alert.alert(
            'Success', 
            `${newFollowingState ? 'Following' : 'Unfollowed'} user successfully`
          );
        }
      } else {
        throw new Error(response.data.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', error.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no userId provided
  if (!userId) {
    console.warn('FollowButton: No userId provided');
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.followButton,
        isFollowing && styles.followingButton,
        isLoading && styles.disabledButton,
        style
      ]}
      onPress={handleFollowToggle}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={isFollowing ? "#FFFFFF" : "#92400E"} 
        />
      ) : (
        <Text style={[
          styles.followButtonText,
          isFollowing && styles.followingButtonText,
          textStyle
        ]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  followButton: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 36,
  },
  followingButton: {
    backgroundColor: Color.inputbg,
    borderColor: Color.secondary,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  followButtonText: {
    fontSize: 14,
    color: '#fff',

    fontFamily: 'AlbertSans-Medium', 
  },
  followingButtonText: {
    color: Color.secondary,
  },
});

export default FollowButton;