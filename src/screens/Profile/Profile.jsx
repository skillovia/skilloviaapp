import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';
import EditBio from './EditBio'; 
import WalletPockets from './CashToken';

const Profile = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Auto-refresh profile when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'No access token found. Please log in again.');
        navigation.navigate('login');
        return;
      }

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.id || decodedToken.user_id || decodedToken.sub;

      if (!userId) {
        Alert.alert('Error', 'User ID not found in token. Please log in again.');
        navigation.navigate('login');
        return;
      }

      const response = await apiClient.get(`/users/profile/${userId}`);
      if (response.data.status === 'success') {
        setProfileData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update from EditBio component
  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(prevData => ({
      ...prevData,
      ...updatedProfile
    }));
  };

  // Navigation handlers
  const handleEditProfile = () => {
    navigation.navigate('editprofile', { profileData });
  };

  const handleAddSkill = () => {
    navigation.navigate('addskill');
  };

  const handleFundAccount = () => {
    navigation.navigate('FundAccount');
  };

  const handleFollowersPress = () => {
    navigation.navigate('FlowersList');
  };

  const handleFollowingPress = () => {
    navigation.navigate('FlowersList', { 
      userId: profileData._id,
      type: 'following',
      title: 'Following'
    });
  };

  const handleSkillPress = (skill) => {
    if (!skill || !skill.skill_id) { 
      Alert.alert('Error', 'Invalid skill data');
      return;
    }
    navigation.navigate('skilldetails', { 
      skillId: skill.skill_id,
      skill: skill 
    });
  };

  const getExperienceLevel = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'expert':
        return 'Expert';
      default:
        return level;
    }
  };

  const getStarRating = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'beginner':
        return 2;
      case 'intermediate':
        return 3;
      case 'expert':
        return 5;
      default:
        return 3;
    }
  };

  // Profile completion logic
  const getProfileCompletionSteps = () => {
    if (!profileData) return [];
    const skills = profileData.skills || [];
    const steps = [
      {
        name: "Profile image",
        completed: !!(profileData && profileData.photourl),
        action: handleEditProfile,
      },
      {
        name: "Add at least one skill",
        completed: skills.length > 0,
        action: handleAddSkill,
      },
      {
        name: "Set location",
        completed: !!(profileData && profileData.locationName),
        action: handleEditProfile,
      },
      {
        name: "Complete KYC",
        completed: !!(profileData && profileData.kyc_status === "approved"),
        action: () => navigation.navigate('id'),
      },
      {
        name: "Link Stripe",
        completed: !!(profileData && profileData.linked_account),
        action: () => navigation.navigate('stripe-setup'),
      },
      {
        name: "Fill out bio",
        completed: !!(profileData && profileData.bio),
        action: () => {}, // No action needed since EditBio is inline
      },
    ];
    return steps;
  };

  const renderProfileCompletion = () => {
    const steps = getProfileCompletionSteps();
    const completedSteps = steps.filter((s) => s.completed).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionTitle}>
            Profile completion: {completedSteps}/{steps.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
        >
          {steps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepItem,
                step.completed ? styles.stepCompleted : styles.stepIncomplete
              ]}
              onPress={step.action}
            >
              <View style={styles.stepContent}>
                {step.completed ? (
                  <Icon name="checkmark-circle" size={20} color="#fff" />
                ) : (
                  <Icon name="close-circle" size={20} color="#666" />
                )}
                <Text style={[
                  styles.stepText,
                  step.completed ? styles.stepTextCompleted : styles.stepTextIncomplete
                ]}>
                  {step.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent={false} barStyle="dark-content" />
        <View style={styles.fixedHeader}>
          <Text style={styles.headerText}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('settings')}>
            <FontAwesome name="gear" size={20} color="#1A4D00" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent={false} barStyle="dark-content" />
        <View style={styles.fixedHeader}>
          <Text style={styles.headerText}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('settings')}>
            <FontAwesome name="gear" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent={false} barStyle="dark-content" />
        <View style={styles.fixedHeader}>
          <Text style={styles.headerText}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('settings')}>
            <FontAwesome name="gear" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No profile data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={false} barStyle="dark-content" />
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('settings')}>
          <FontAwesome name="gear" size={20} color="#1A4D00" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {renderProfileCompletion()}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Image
              source={{ 
                uri: profileData.photourl || 'https://i.pinimg.com/736x/72/32/98/72329823360e56269897813a3dbd99b6.jpg' 
              }}
              style={styles.profileImage}
              defaultSource={{ uri: 'https://i.pinimg.com/736x/72/32/98/72329823360e56269897813a3dbd99b6.jpg' }}
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {`${profileData.firstname} ${profileData.lastname}`.trim()}
            </Text>
            <Text style={styles.username}>
              {profileData.email || 'user'}
            </Text>
            <Text style={styles.username}>
              {profileData.phone || 'user'}
            </Text>
            <View style={styles.followInfo}>
              <TouchableOpacity style={styles.followItem} onPress={handleFollowingPress}>
                <Text style={styles.followCount}>
                  {profileData.total_following || 0}
                </Text>
                <Text style={styles.followLabel}>following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.followItem} onPress={handleFollowersPress}>
                <Text style={styles.followCount}>
                  {profileData.total_followers || 0}
                </Text>
                <Text style={styles.followLabel}>followers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity onPress={handleFundAccount} style={styles.fundButton}>
            <Icon name="add-circle-outline" size={16} color={Color.secondary} />
            <Text style={styles.fundButtonText}>Fund Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillButton}>
            <Icon name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.addSkillButtonText}>Add Skill</Text>
          </TouchableOpacity>
        </View>

        <WalletPockets />
      
        {/* Inline EditBio Component */}
        <EditBio
          initialBio={profileData.bio}
          location={{ locationName: profileData.locationName }}
          street={profileData.street}
          zip_code={profileData.zip_code}
          lon={profileData.lon}
          lat={profileData.lat}
          onProfileUpdate={handleProfileUpdate}
        />

        <View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
            <View style={styles.skillsHeader}>
              <Text style={styles.skillsTitle}>Skills</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('myskill')} style={styles.skillsHeader}>
              <Text style={styles.skillsTitl}>View All</Text>
            </TouchableOpacity>
          </View>

          {profileData.skills && profileData.skills.length > 0 ? (
            profileData.skills.map((skill, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.skillCard}
                onPress={() => handleSkillPress(skill)}
                activeOpacity={0.7}
              >
                <Text style={styles.skillName}>{skill.skill_type}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
                <Text style={styles.experienceLevel}>
                  Experience level: {getExperienceLevel(skill.experience_level)}
                </Text>
                <Text style={styles.hourlyRate}>
                  Hourly rate: £{skill.hourly_rate}/hour
                </Text>
                <View style={styles.rating}>
                  {[...Array(5)].map((_, starIndex) => (
                    <Icon
                      key={starIndex}
                      name="star"
                      size={16}
                      color={starIndex < getStarRating(skill.experience_level) ? "#FFD700" : "#DDD"}
                      style={styles.starIcon}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noSkillsContainer}>
              <Text style={styles.noSkillsText}>No skills added yet</Text>
              <TouchableOpacity onPress={handleAddSkill} style={styles.addFirstSkillButton}>
                <Icon name="add-circle" size={20} color={Color.primary} />
                <Text style={styles.addFirstSkillButtonText}>Add your first skill</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Color.background,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Color.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Color.secondary,
    fontFamily: 'AlbertSans-Bold',
    fontSize: 16,
  },
  // Profile Completion Styles
  completionContainer: {
    backgroundColor: Color.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    borderWidth: 0.5,
    borderColor: Color.secondary,
  },
  completionHeader: {
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Color.secondary,
    borderRadius: 4,
  },
  stepsScrollView: {
    marginTop: 8,
  },
  stepItem: {
    marginRight: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 120,
  },
  stepCompleted: {
    backgroundColor: Color.secondary,
  },
  stepIncomplete: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    marginLeft: 4,
    textAlign: 'center',
  },
  stepTextCompleted: {
    color: '#fff',
  },
  stepTextIncomplete: {
    color: '#666',
  },
  profileSection: {
    flexDirection: 'row',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    marginTop: 10,
  },
  username: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'AlbertSans-Regular',
    marginBottom: 5,
  },
  followInfo: {
    flexDirection: 'row',
    marginTop: 10,
  },
  followItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 5,
  },
  followCount: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
  },
  followLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  fundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.background,
    borderWidth: 2,
    borderColor: Color.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fundButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 20
  },
  addSkillButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: "#fff",
  },
  pocketsContainer: {
    marginTop: 0,
  },
  pocketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pocket: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.primary,
    marginRight: 10,
    borderRadius: 10,
    padding: 20,
    minWidth: 280,
  },
  pocket1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.card,
    marginRight: 10,
    borderRadius: 10,
    padding: 20,
    minWidth: 280,
  },
  pocketInfo: {
    flex: 1,
    marginLeft: 1,
  },
  ft: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  pocketTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  cash: {
    fontSize: 20,
    fontFamily: 'AlbertSans-ExtraBold',
    color: '#000',
    marginVertical: 10,
  },
  bioSection: {
    marginTop: 20,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
  },
  editBioButton: {
    padding: 4,
  },
  bioText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
    flex: 1,
  },
  skillsSection: {
    marginTop: 20,
    paddingBottom: 20,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillsTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
  },
  skillsTitl: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
  skillCard: {
    backgroundColor: Color.gray,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  skillName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 5,
  },
  skillDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
    marginBottom: 5,
  },
  experienceLevel: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
    fontFamily: 'AlbertSans-Regular',
  },
  hourlyRate: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'AlbertSans-Medium',
    marginBottom: 5,
  },
  rating: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 2,
  },
  noSkillsContainer: {
    backgroundColor: Color.gray,
    padding: 20,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  noSkillsText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    marginBottom: 10,
  },
  addFirstSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFirstSkillButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
  },
});

export default Profile;