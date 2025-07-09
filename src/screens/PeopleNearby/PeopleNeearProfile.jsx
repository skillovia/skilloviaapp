import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../Hooks/Api'; 
import { Color } from '../../Utils/Theme';

const { width } = Dimensions.get('window');

const ExploreSection = ({ navigation }) => {
  const [nearbyPeople, setNearbyPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('london');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [userPosition, setUserPosition] = useState(null);
  const [userId, setUserId] = useState(null);

  // UK Cities - Official List
  const states = [
    { value: 'aberdeen', label: 'Aberdeen' },
    { value: 'leeds', label: 'Leeds' },
    { value: 'england', label: 'England' },
    { value: 'armagh', label: 'Armagh' },
    { value: 'bangor', label: 'Bangor' },
    { value: 'bath', label: 'Bath' },
    { value: 'belfast', label: 'Belfast' },
    { value: 'birmingham', label: 'Birmingham' },
    { value: 'bradford', label: 'Bradford' },
    { value: 'brighton-and-hove', label: 'Brighton & Hove' },
    { value: 'bristol', label: 'Bristol' },
    { value: 'cambridge', label: 'Cambridge' },
    { value: 'canterbury', label: 'Canterbury' },
    { value: 'cardiff', label: 'Cardiff' },
    { value: 'carlisle', label: 'Carlisle' },
    { value: 'chelmsford', label: 'Chelmsford' },
    { value: 'chester', label: 'Chester' },
    { value: 'chichester', label: 'Chichester' },
    { value: 'coventry', label: 'Coventry' },
    { value: 'derby', label: 'Derby' },
    { value: 'derry', label: 'Derry' },
    { value: 'dundee', label: 'Dundee' },
    { value: 'durham', label: 'Durham' },
    { value: 'edinburgh', label: 'Edinburgh' },
    { value: 'ely', label: 'Ely' },
    { value: 'exeter', label: 'Exeter' },
    { value: 'glasgow', label: 'Glasgow' },
    { value: 'gloucester', label: 'Gloucester' },
    { value: 'hereford', label: 'Hereford' },
    { value: 'kingston-upon-hull', label: 'Kingston upon Hull' },
    { value: 'inverness', label: 'Inverness' },
    { value: 'lancaster', label: 'Lancaster' },
    { value: 'leicester', label: 'Leicester' },
    { value: 'lichfield', label: 'Lichfield' },
    { value: 'lincoln', label: 'Lincoln' },
    { value: 'liverpool', label: 'Liverpool' },
    { value: 'london', label: 'London' },
    { value: 'winchester', label: 'Winchester' },
    { value: 'worcester', label: 'Worcester' },
    { value: 'york', label: 'York' },
  ];

  const distances = [
    { value: 'all', label: 'All Distances' },
    { value: '8000', label: '0 - 5 miles' }, // 8 km
    { value: '16000', label: '6 - 10 miles' }, // 16 km
    { value: '32000', label: '11 - 20 miles' }, // 32 km
    { value: '64000', label: '20+ miles' }, // 64 km
  ];

  // Initialize user data from token
  const initializeUser = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Access token not found');

      const decodedToken = jwtDecode(accessToken);
      const user_id = decodedToken?.id;
      if (!user_id) throw new Error('User ID not found');

      setUserId(user_id);

      if (decodedToken?.lat && decodedToken?.lon) {
        const lat = parseFloat(decodedToken.lat);
        const lon = parseFloat(decodedToken.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          setUserPosition({
            latitude: lat,
            longitude: lon,
          });
        }
      }
    } catch (err) {
      console.error('Token decode error:', err.message);
    }
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Access token not found');

      const decodedToken = jwtDecode(accessToken);
      const user_id = decodedToken?.id;
      if (!user_id) throw new Error('User ID not found');

      const response = await apiClient.get(`/users/profile/${user_id}`);

      if (response.data.status === 'success') {
        setProfileData(response.data.data);
        
        // Attempt geolocation
        getCurrentLocation(response.data.data);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setProfileLoading(true);
        setError('');
        await initializeUser();
        await fetchProfile();
      };
      
      loadData();
    }, [])
  );

  const getCurrentLocation = (profileData) => {
    Geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log('✅ Geolocation successful:', position.coords);
      },
      (error) => {
        console.warn('⚠️ Geolocation failed:', error.message);
        fallbackToProfileLocation(profileData);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 10000,
      }
    );
  };

  const fallbackToProfileLocation = (profile) => {
    let lat = null;
    let lon = null;

    if (profile?.lat && profile?.lon) {
      lat = parseFloat(profile.lat);
      lon = parseFloat(profile.lon);
    } else if (
      profile?.location?.coordinates &&
      Array.isArray(profile.location.coordinates) &&
      profile.location.coordinates.length === 2
    ) {
      const [rawLon, rawLat] = profile.location.coordinates;

      lat =
        typeof rawLat === 'object'
          ? parseFloat(rawLat['$numberDouble'] || rawLat['$numberInt'])
          : parseFloat(rawLat);
      lon =
        typeof rawLon === 'object'
          ? parseFloat(rawLon['$numberDouble'] || rawLon['$numberInt'])
          : parseFloat(rawLon);
    }

    if (lat !== 0 && lon !== 0 && !isNaN(lat) && !isNaN(lon)) {
      setUserPosition({
        latitude: lat,
        longitude: lon,
      });
      console.log('📦 Fallback to profile coordinates:', { lat, lon });
    } else {
      console.warn('⚠️ No valid fallback coordinates available in profile.');
    }
  };

  // Fetch nearby people
  useEffect(() => {
    const fetchPeople = async () => {
      if (!userPosition) {
        console.log('⏳ Waiting for user position...');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        let url;

        if (distanceFilter === 'all') {
          url = `/users/people/within/${stateFilter}`;
          console.log('🌍 Fetching with city-only filter:', url);
        } else {
          if (!userPosition) {
            console.warn('⚠️ User position is not yet available.');
            return;
          }

          url = `/users/people/nearby/${userPosition.latitude}/${userPosition.longitude}/${distanceFilter}?state=${stateFilter}`;
          console.log('📡 Fetching nearby people:', url);
        }

        const response = await apiClient.get(url);

        if (response.data.status === 'success') {
          setNearbyPeople(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch people');
        }
      } catch (err) {
        setError('Unable to load people. Please try again later.');
        setNearbyPeople([]);
        console.error('Fetch people error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeople();
  }, [stateFilter, distanceFilter, userPosition]);

  const navigateToProfile = (personId) => {
    navigation.navigate('UserProfile', { userId: personId });
    console.log('Navigating to profile:', personId);
  };

  const renderPersonCard = (person) => (
    <TouchableOpacity
      key={person._id}
      style={styles.personCard}
      onPress={() => navigateToProfile(person._id)}
    >
      <Image
        source={{
          uri: person.photourl ||
            'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg',
        }}
        style={styles.personImage}
      />
      <Text style={styles.personName} numberOfLines={1}>
        {person.firstname} {person.lastname}
      </Text>
      {person.distance !== undefined && (
        <Text style={styles.distanceText}>
          {person.distance === 0
            ? 'Less than 1 km'
            : `${person.distance.toFixed(1)} km away`}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (profileLoading || !userPosition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {profileLoading
            ? 'Loading your profile...'
            : 'Loading your location data...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>People nearby</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>City</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={stateFilter}
                style={styles.picker}
                onValueChange={(value) => {
                  setStateFilter(value);
                  setDistanceFilter('all');
                }}
              >
                {states.map((state) => (
                  <Picker.Item
                    key={state.value}
                    label={state.label}
                    value={state.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Distance</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={distanceFilter}
                style={styles.picker}
                onValueChange={setDistanceFilter}
              >
                {distances.map((distance) => (
                  <Picker.Item
                    key={distance.value}
                    label={distance.label}
                    value={distance.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && nearbyPeople.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No people found</Text>
            <Text style={styles.emptySubtitle}>
              {distanceFilter === 'all'
                ? `No people found in ${
                    states.find((s) => s.value === stateFilter)?.label
                  }.`
                : `No people found within ${
                    distances.find((d) => d.value === distanceFilter)?.label
                  }.`}
            </Text>
            <Text style={styles.emptyHint}>Try selecting different filters.</Text>
          </View>
        )}

        {/* People List */}
        {!isLoading && !error && nearbyPeople.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleScrollContainer}
          >
            {nearbyPeople.map(renderPersonCard)}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold', 
    color: Color.secondary,
  },
  filtersContainer: {
    backgroundColor: Color.inputbg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.gray,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#666',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: Color.background,
    fontFamily: 'AlbertSans-Medium', 
    flex: 1,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  peopleScrollContainer: {
    // paddingHorizontal: 8,
  },
  personCard: {
    alignItems: 'center',
    // marginHorizontal: 8,
    width: 100,
  },
  personImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium', 
  },
});

export default ExploreSection;