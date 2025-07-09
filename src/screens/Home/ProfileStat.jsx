import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const ProfileStat = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCards, setVisibleCards] = useState({
    emailVerification: true,
    completeProfile: true,
  });

  // Profile completion steps
  const steps = [
    {
      name: 'Profile image',
      completed: !!(profileData && profileData.photourl),
      screen: 'ProfileSettings',
    },
    {
      name: 'Add at least one skill',
      completed: skills.length > 0,
      screen: 'AddSkill',
    },
    {
      name: 'Set location',
      completed: !!(profileData && profileData.locationName),
      screen: 'ProfileSettings',
    },
    {
      name: 'Complete KYC',
      completed: !!(profileData && profileData.kyc_status === 'approved'),
      screen: 'KYCScreen',
    },
    {
      name: 'Link Stripe',
      completed: !!(profileData && profileData.linked_account),
      screen: 'StripeAccount',
    },
    {
      name: 'Fill out bio',
      completed: !!(profileData && profileData.bio),
      screen: 'ProfileSettings',
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const completionPercentage = (completedSteps / steps.length) * 100;

  // Fetch Profile Data function
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('❌ Access token not found in AsyncStorage');
      }

      const decodedToken = jwtDecode(accessToken);
      console.log('🔑 Decoded Token:', decodedToken);

      const user_id = decodedToken?.id;
      if (!user_id) {
        throw new Error('❌ User ID not found in token');
      }

      setEmail(decodedToken?.email || 'your email');

      // Fetch profile data using apiClient
      const profileResponse = await apiClient.get(`/users/profile/${user_id}`);
      setProfileData(profileResponse.data.data);

      // Fetch skills data using apiClient
      try {
        const skillsResponse = await apiClient.get('/skills/user/all');
        setSkills(skillsResponse.data.data || []);
      } catch (skillsError) {
        console.log('Skills fetch error:', skillsError.message);
        // Continue even if skills fetch fails
        setSkills([]);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error.message);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [])
  );

  // Initial data fetch on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const closeCard = cardName => {
    setVisibleCards(prev => ({
      ...prev,
      [cardName]: false,
    }));
  };

  const navigateToProfile = () => {
    // Navigate to the User Profile tab in your tab navigator
    navigation.navigate('User Profile');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Complete Profile Card */}
        {visibleCards.completeProfile && (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => closeCard('completeProfile')}
              style={styles.closeButton}
              activeOpacity={0.7}>
              <Icon name="x" size={20} color="#374151" />
            </TouchableOpacity>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Complete your profile</Text>
              <Text style={styles.cardDescription}>
                Add your skills and interests, set your availability time and
                find clients.
              </Text>
              
              {loading ? (
                <View style={styles.cardLoadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Loading profile data...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.completionText}>
                    Profile completion: {completedSteps}/{steps.length}
                  </Text>

                  {/* Main CTA */}
                  <TouchableOpacity
                    onPress={navigateToProfile}
                    style={styles.ctaButton}
                    activeOpacity={0.8}>
                    <View style={styles.ctaContent}>
                      <View style={styles.progressSection}>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${completionPercentage}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.percentageText}>
                          {Math.round(completionPercentage)}% Complete
                        </Text>
                      </View>
                      <View style={styles.ctaTextContainer}>
                        <Text style={styles.ctaText}>View Profile</Text>
                        <Icon name="arrow-right" size={16} color="#065F46" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F9FAFB',
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    // paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: Color.secondary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    zIndex: 10,
  },
  cardContent: {
    paddingRight: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Medium', 
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular', 
  },
  completionText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#fff',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 16,
    width: 300,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    flex: 1,
    marginRight: 16,
  },
  progressBarContainer: {
    width: 150,
    height: 12,
    backgroundColor: '#BBF7D0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#065F46',
  },
  ctaTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#065F46',
    marginRight: 4,
    fontFamily: 'AlbertSans-Medium', 
  },
  cardLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
    fontFamily: 'AlbertSans-Regular',
  },
});

export default ProfileStat;