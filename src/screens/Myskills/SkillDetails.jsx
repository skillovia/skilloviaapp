import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SkillDetailsScreen = ({ navigation, route }) => {
  const [skillData, setSkillData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { skillId } = route.params || {};

  // Fetch all skills and filter by ID
  const fetchSkillDetails = async () => {
    try {
      // Check if we have access token
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('Login Error: No access token found for skill details');
        Alert.alert('Authentication Error', 'Please login again');
        navigation.navigate('Login');
        return;
      }

      console.log('Fetching all skills to find skill with ID:', skillId);
      console.log('Access Token for skill details:', accessToken);

      // Make API call to get all user skills
      const response = await apiClient.get(`/skills/user/all`);
      
      console.log('Skills API Response Status:', response.status);
      console.log('Skills API Response Data:', response.data);

      if (response.data.status === 'success') {
        const allSkills = response.data.data;
        console.log('All skills fetched:', allSkills.length);
        
        // Find the specific skill by comparing IDs
        const foundSkill = allSkills.find(skill => {
          console.log('Comparing skill ID:', skill._id, 'with target ID:', skillId);
          return skill._id === skillId;
        });

        if (foundSkill) {
          setSkillData(foundSkill);
          console.log('Login Success: Skill found and set:', foundSkill._id);
        } else {
          console.error('Login Error: Skill not found in user skills list');
          Alert.alert('Error', 'Skill not found');
          navigation.goBack();
        }
      } else {
        console.error('Login Error: Failed to fetch skills -', response.data.message || 'Unknown error');
        Alert.alert('Error', 'Failed to fetch skills');
      }
    } catch (error) {
      console.error('Login Error: Exception occurred while fetching skills:', error);
      
      if (error.response) {
        console.error('Login Error: Server Error Status:', error.response.status);
        console.error('Login Error: Server Error Data:', error.response.data);
        
        if (error.response.status === 401) {
          console.error('Login Error: Unauthorized - Token may be expired');
          Alert.alert('Session Expired', 'Please login again');
          await AsyncStorage.removeItem('accessToken');
          navigation.navigate('Login');
        } else {
          Alert.alert('Error', `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('Login Error: Network Error - No response received:', error.request);
        Alert.alert('Network Error', 'Please check your internet connection');
      } else {
        console.error('Login Error: Unexpected error:', error.message);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for the skill
  const fetchReviews = async () => {
    if (!skillId) return;
    
    setReviewsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found for reviews');
        return;
      }

      console.log('Fetching reviews for skill ID:', skillId);
      
      const response = await apiClient.get(`/reviews/skill/${skillId}/user`);
      
      console.log('Reviews API Response Status:', response.status);
      console.log('Reviews API Response Data:', response.data);

      if (response.data.status === 'success') {
        setReviews(response.data.data);
        console.log('Reviews fetched successfully:', response.data.data.length, 'reviews');
      } else {
        console.log('No reviews found or failed to fetch reviews');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      if (error.response) {
        console.error('Reviews API Error Status:', error.response.status);
        console.error('Reviews API Error Data:', error.response.data);
        
        // Don't show error for 404 or empty reviews, just log it
        if (error.response.status !== 404) {
          console.warn('Failed to load reviews:', error.response.data?.message || 'Unknown error');
        }
      } else {
        console.warn('Network error while fetching reviews:', error.message);
      }
      
      // Set empty array on error to show "No reviews" message
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Show delete modal
  const showDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  // Hide delete modal
  const hideDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Delete skill function
  const deleteSkill = async () => {
    setDeleting(true);
    try {
      console.log('Deleting skill with ID:', skillId);
      const response = await apiClient.delete(`/skills/${skillId}`);
      
      if (response.data.status === 'success') {
        console.log('Login Success: Skill deleted successfully');
        setShowDeleteModal(false);
        Alert.alert('Success', 'Skill deleted successfully');
        navigation.goBack();
      } else {
        console.error('Login Error: Failed to delete skill');
        Alert.alert('Error', 'Failed to delete skill');
      }
    } catch (error) {
      console.error('Login Error: Exception occurred while deleting skill:', error);
      Alert.alert('Error', 'Failed to delete skill');
    } finally {
      setDeleting(false);
    }
  };

  // Edit skill function
  const editSkill = () => {
    console.log('Navigating to edit skill for ID:', skillId);
    navigation.navigate('EditSkill', { skillId, skillData });
  };

  const getStarRating = (level) => {
    const ratings = {
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5
    };
    return ratings[level?.toLowerCase()] || 3;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={20}
          color="#FFC107"
        />
      );
    }
    return stars;
  };

  // Render individual review
  const renderReview = (review) => (
    <View key={review._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerEmail}>
            {review.reviewerId?.email || 'Anonymous'}
          </Text>
          <View style={styles.reviewRating}>
            {renderStars(review.rating)}
            <Text style={styles.ratingText}>{review.rating}/5</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );

  // Render reviews section
  const renderReviewsSection = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Reviews ({reviews.length})</Text>
        {reviews.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {reviewsLoading ? (
        <View style={styles.reviewsLoading}>
          <ActivityIndicator size="small" color={Color.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.noReviews}>
          <Icon name="rate-review" size={48} color="#CCCCCC" />
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.slice(0, 3).map(renderReview)} {/* Show only first 3 reviews */}
          {reviews.length > 3 && (
            <TouchableOpacity style={styles.showMoreReviews}>
              <Text style={styles.showMoreText}>
                Show {reviews.length - 3} more reviews
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  // Delete Modal Component
  const DeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteModal}
      onRequestClose={hideDeleteModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Icon name="warning" size={32} color="#FF5252" />
            <Text style={styles.modalTitle}>Delete Skill</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this skill? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={hideDeleteModal}
              disabled={deleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={deleteSkill}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Initial load
  useEffect(() => {
    if (skillId) {
      console.log('SkillDetailsScreen mounted with skillId:', skillId);
      fetchSkillDetails();
      fetchReviews(); // Fetch reviews when component mounts
    } else {
      console.error('Login Error: No skill ID provided');
      Alert.alert('Error', 'No skill ID provided');
      navigation.goBack();
    }
  }, [skillId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Skill Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.loadingText}>Loading skill details...</Text>
        </View>
      </View>
    );
  }

  if (!skillData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Skill Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#CCCCCC" />
          <Text style={styles.errorTitle}>Skill Not Found</Text>
          <Text style={styles.errorDescription}>
            The skill you're looking for could not be found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Skill Details</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {[skillData.thumbnail01, skillData.thumbnail02, skillData.thumbnail03, skillData.thumbnail04]
            .filter(Boolean)
            .map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={[styles.skillImage, { width: 280, marginRight: 12 , borderWidth: 2, borderColor: Color.secondary}]}
                resizeMode="cover"
              />
            ))
          }
        </ScrollView>

        {/* Title and Edit/Delete */}
        <View style={styles.row}>
          <Text style={styles.title}>
            {skillData.skillCategoryId?.name || 'Skill'}
          </Text>
          <View style={styles.icons}>
            <TouchableOpacity style={styles.editIcon} onPress={editSkill}>
              <Icon name="edit" size={24} color={Color.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteIcon} onPress={showDeleteConfirmation}>
              <Icon name="delete" size={24} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Approval Status Badge */}
        {skillData.approval_status && (
          <View style={[
            styles.statusBadge,
            skillData.approval_status === 'published' ? styles.publishedBadge : 
            skillData.approval_status === 'pending' ? styles.pendingBadge : 
            styles.rejectedBadge
          ]}>
            <Text style={styles.statusText}>
              {skillData.approval_status?.charAt(0).toUpperCase() + skillData.approval_status?.slice(1)}
            </Text>
          </View>
        )}

        {/* Experience Level */}
        <Text style={styles.experience}>
          Experience level: {skillData.experience_level?.charAt(0).toUpperCase() + skillData.experience_level?.slice(1)}
        </Text>

        {/* Rating */}
        <View style={styles.rating}>
          {renderStars(getStarRating(skillData.experience_level))}
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {skillData.description || 'No description available.'}
        </Text>

        {/* Hourly Rate and Tokens */}
        <View style={styles.details}>
          <Text style={styles.detailItem}>
            Hourly rate: <Text style={styles.bold}>£{skillData.hourly_rate || '0'}</Text>
          </Text>
          <Text style={styles.detailItem}>
            {skillData.spark_token || '0'} spark tokens
          </Text>
        </View>

        {/* Additional Skills Info */}
        {skillData.location && (
          <View style={styles.additionalInfo}>
            <Icon name="location-on" size={16} color="#777" />
            <Text style={styles.additionalInfoText}>{skillData.location}</Text>
          </View>
        )}

        {skillData.availability && (
          <View style={styles.additionalInfo}>
            <Icon name="schedule" size={16} color="#777" />
            <Text style={styles.additionalInfoText}>Available: {skillData.availability}</Text>
          </View>
        )}

        {/* Creation Date */}
        <View style={styles.additionalInfo}>
          <Icon name="date-range" size={16} color="#777" />
          <Text style={styles.additionalInfoText}>
            Created: {new Date(skillData.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Reviews Section */}
        {renderReviewsSection()}
      </ScrollView>

      {/* Delete Modal */}
      <DeleteModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    // marginTop: 40,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  skillImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginLeft: 16,
  },
  deleteIcon: {
    marginLeft: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  publishedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  rejectedBadge: {
    backgroundColor: '#FF5252',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
  experience: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#777',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
  },
  bold: {
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalInfoText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#777',
    marginLeft: 8,
  },
  // Reviews Section Styles
  reviewsSection: {
    marginTop: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: Color.primary,
  },
  reviewsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerEmail: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Regular',
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
    lineHeight: 20,
  },
  showMoreReviews: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: Color.primary,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#777',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#777777',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#777777',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#555',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
});

export default SkillDetailsScreen;