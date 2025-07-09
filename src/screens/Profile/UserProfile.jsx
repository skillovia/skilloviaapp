import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import FollowButton from '../Followers/FollowBtn';
import { Color } from '../../Utils/Theme';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const UserProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [expandedSkills, setExpandedSkills] = useState({});

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'User ID is required');
      navigation.goBack();
      return;
    }

    fetchUserProfile();
    fetchUserReviews();
  }, [userId]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get(`/users/basic/profile/${userId}`);
      
      if (response.data && response.data.data) {
        setProfile(response.data.data);
      } else {
        throw new Error('Invalid profile data received');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load profile');
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    setReviewsError('');

    try {
      const response = await apiClient.get(`/reviews/user/${userId}`);
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setReviews(response.data.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setReviewsError(err.message || 'Failed to load reviews');
 
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleChatClick = () => {
    if (profile) {
      navigation.navigate('message', {
        userId: userId,
        name: [profile.firstname, profile.lastname]
          .filter(Boolean) 
          .join(' ') || 'Unknown User', 
        avatar: profile.photourl || null, 
      });
    }
  };

  const handleBookService = (skill) => {
    navigation.navigate('bookservice', {
      user: {
        id: userId,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        bio: profile.bio,
        photourl: profile.photourl,
      },
      skill: {
        ...skill,
        thumbnail01: skill.thumbnail01,
        thumbnail02: skill.thumbnail02,
        thumbnail03: skill.thumbnail03,
        thumbnail04: skill.thumbnail04,
      },
    });
  };

  const toggleReviews = (skillId) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  const handleFollowSuccess = (isNowFollowing) => {
   
    console.log(`User is now ${isNowFollowing ? 'following' : 'not following'} this profile`);
 
  };

  // Function to render star rating
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={16}
          color={i < rating ? '#FCD34D' : '#E5E7EB'}
          style={i < rating ? styles.filledStar : styles.emptyStar}
        />
      ));
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter reviews by skill ID
  const getReviewsBySkill = (skillId) => {
    return reviews.filter((review) => review.skill_id === skillId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7280" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No profile data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    firstname,
    lastname,
    email,
    total_followers,
    total_following,
    bio,
    skills,
    photourl,
  } = profile;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#374151" />
        <Text style={styles.headerTitle}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChatClick} style={styles.chatButton}>
       <FontAwesome5Icon name="facebook-messenger" size={20} color="#1A4D00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: photourl ||
                  'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {firstname} {lastname}
              </Text>
              <Text style={styles.profileEmail}>@{email}</Text>
              <View style={styles.followStats}>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>{total_followers || 0}</Text> Following
                </Text>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>{total_following || 0}</Text> Followers
                </Text>
              </View>
            </View>
            
            {/* Use the FollowButton component */}
            <FollowButton
              userId={userId}
              onFollowSuccess={handleFollowSuccess}
              showAlert={false}
            />
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{bio || 'No bio available.'}</Text>
        </View>

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsList}>
              {skills.map((skill) => {
                const skillReviews = getReviewsBySkill(skill.id || skill.skill_id);
                const isExpanded = expandedSkills[skill.id || skill.skill_id];
                const displayedReviews = isExpanded
                  ? skillReviews
                  : skillReviews.slice(0, 1);

                return (
                  <View key={skill.id || skill.skill_id} style={styles.skillCard}>
                    <View style={styles.skillHeader}>
                      <View style={styles.skillInfo}>
                        <Text style={styles.skillTitle}>{skill.skill_type}</Text>
                        <Text style={styles.skillDescription}>
                          Description: {skill.description}
                        </Text>
                        <Text style={styles.skillExperience}>
                          Experience level: {skill.experience_level || 'Unknown'}
                        </Text>
                        <Text style={styles.skillRate}>
                          Hourly rate: £{skill.hourly_rate} - {skill.spark_token} Spark Token
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => handleBookService(skill)}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Reviews Section within each skill */}
                    <View style={styles.reviewsSection}>
                      <Text style={styles.reviewsTitle}>Reviews</Text>

                      {reviewsLoading ? (
                        <View style={styles.reviewsLoading}>
                          <ActivityIndicator size="small" color="#6B7280" />
                        </View>
                      ) : skillReviews.length === 0 ? (
                        <Text style={styles.noReviewsText}>
                          No reviews yet for this skill.
                        </Text>
                      ) : (
                        <>
                          <View style={styles.reviewsList}>
                            {displayedReviews.map((review) => (
                              <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                  <View style={styles.reviewRating}>
                                    {renderStars(review.rating)}
                                    <Text style={styles.reviewRatingText}>
                                      ({review.rating}/5)
                                    </Text>
                                  </View>
                                  <Text style={styles.reviewDate}>
                                    {formatDate(review.created_at)}
                                  </Text>
                                </View>
                                <Text style={styles.reviewComment}>
                                  {review.comment}
                                </Text>
                              </View>
                            ))}
                          </View>

                          {skillReviews.length > 1 && (
                            <TouchableOpacity
                              onPress={() => toggleReviews(skill.id || skill.skill_id)}
                              style={styles.toggleReviewsButton}
                            >
                              <Icon
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color="#6B7280"
                              />
                              <Text style={styles.toggleReviewsText}>
                                {isExpanded
                                  ? 'Show less'
                                  : `View ${skillReviews.length - 1} more ${
                                      skillReviews.length - 1 === 1 ? 'review' : 'reviews'
                                    }`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 26,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6FCEB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
  },
  chatButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    paddingVertical: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'AlbertSans-Medium',
  },
  followStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Medium',
  },
  statNumber: {
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  skillsList: {
    gap: 16,
  },
  skillCard: {
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: Color.gray,
    borderRadius: 12,
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  skillInfo: {
    flex: 1,
    marginRight: 16,
  },
  skillTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'AlbertSans-Regular',
  },
  skillExperience: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'AlbertSans-Regular',
  },
  skillRate: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#111827',
  },
  bookButton: {
    borderWidth: 1,
    borderColor: Color.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 14,
    color: Color.secondary,
    fontFamily: 'AlbertSans-Bold',
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: '#6B7280',
    paddingTop: 12,
  },
  reviewsTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#111827',
    marginBottom: 8,
  },
  reviewsLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    fontFamily: 'AlbertSans-Regular',
  },
  toggleReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  toggleReviewsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  filledStar: {
    // Additional styling for filled stars if needed
  },
  emptyStar: {
    // Additional styling for empty stars if needed
  },
});

export default UserProfile;