import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Image, StatusBar, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect } from '@react-navigation/native';

import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';
import { useNavigation } from '@react-navigation/native';

const Search = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.id || decodedToken.user_id || decodedToken.sub;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/users/profile/${userId}`);
      if (response.data.status === 'success') {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect instead of useEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const renderLocationDisplay = () => {
    if (!profileData) {
      return <Text style={styles.locationText}>Click to add location</Text>; 
    }
    
    const { locationName, street, zip_code } = profileData;
    
    // If no location data at all
    if (!locationName && !street && !zip_code) {
      return <Text style={styles.locationText}>Click to add location</Text>;
    }

    return (
      <View style={styles.locationDetailsWrapper}>
        {locationName && (
          <Text style={styles.locationNameText}>{locationName}</Text>
        )}
        {street && (
          <Text style={styles.locationSubText}>{street}</Text>
        )}
        {zip_code && (
          <Text style={styles.locationSubText}>{zip_code}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent={false} barStyle="dark-content" />
      <View style={styles.container}>
        {/* Location */}
        <TouchableOpacity onPress={() => navigation.navigate('editprofile')} style={styles.headerRow}>
          <View style={styles.locationWrapper}>
            <Icon name="location-outline" size={25} color="#6B7" />
            {loading ? (
              <ActivityIndicator size="small" color="#6B7280" style={{ marginHorizontal: 5 }} />
            ) : (
              renderLocationDisplay()
            )}
         
          </View>

          {/* Notification and Profile Icons */}
          <View style={styles.iconWrapper}>
            <TouchableOpacity onPress={() => navigation.navigate('notify')} style={[styles.iconBadgeWrapper, { backgroundColor: '#FFEE87' }]}>
              <Icon name="notifications-outline" size={20} />
              <View style={styles.badge} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Chats')} style={[styles.iconBadgeWrapper, { backgroundColor: '#8FF15F' }]}>
              <FontAwesome5 name="facebook-messenger" size={20} color="#141301" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("search-sc", { profileData })}>
          <View style={styles.searchWrapper}>
            <Icon name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people, skills and communities"
              placeholderTextColor="#6B7280"
              editable={false}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 30
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start to align with top of text
    flex: 1,
  },
  locationDetailsWrapper: {
    marginHorizontal: 5,
    maxWidth: 150,
  },
  locationText: {
    fontSize: 14,
    color: Color.secondary,
    fontFamily: 'AlbertSans-Medium',
    marginHorizontal: 5,
    maxWidth: 150, 
  },
  locationNameText: {
    fontSize: 14,
    color: Color.secondary,
    fontFamily: 'AlbertSans-Bold', // Made primary location bold
    lineHeight: 18,
  },
  locationSubText: {
    fontSize: 12,
    color: '#6B7280', // Slightly lighter color for sub-text
    fontFamily: 'AlbertSans-Medium',
    lineHeight: 16,
  },
  iconWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBadgeWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'AlbertSans-Medium',
  },
});

export default Search;