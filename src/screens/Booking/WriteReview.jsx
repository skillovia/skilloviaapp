import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';


const Review = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { 
    skillId, 
    bookingUserId, 
    bookingId, 
    title, 
    booked_user_id 
  } = route.params || {};
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  console.log('[LOG] Component loaded with data:', { 
    skillId, 
    bookingId, 
    title, 
    booked_user_id 
  });

  const handleRatingChange = (selectedRating) => {
    console.log('[LOG] Rating selected:', selectedRating);
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const reviewData = {
      skillId: skillId,
      revieweeId: booked_user_id,
      rating: rating,
      comment: comment,
    };

    console.log('[LOG] Review data being submitted:', reviewData);

    try {
      const response = await apiClient.post('/reviews', reviewData);

      console.log('[LOG] Response status:', response.status);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to submit review');
      }

      console.log('[LOG] Review submitted successfully:', response.data);

      // Show success message
      const message = 'Review submitted successfully';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Success', message);
      }

      // Navigate back to bookings page
      navigation.navigate('home', { screen: 'Booking' });
      
    } catch (err) {
      console.error('[ERROR] Exception during submission:', err.message);
      setError(err.message || 'Failed to submit review');
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
      console.log('[LOG] Submission attempt finished.');
    }
  };

  if (!skillId || !bookingUserId) {
    console.error('[ERROR] Missing required parameters:', { 
      skillId, 
      bookingUserId, 
      booked_user_id 
    });
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write a Review</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing required information to submit a review. Please go back and try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write a Review</Text>
        </View>

        {/* Review Form */}
        <View style={styles.formContainer}>
          <Text style={styles.serviceTitle}>
            Review for: {title || 'Service'}
          </Text>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionLabel}>Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingChange(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={star <= rating ? 'star' : 'star-border'}
                    size={32}
                    color={star <= rating ? '#FFD700' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionLabel}>Your comments</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={(text) => {
                console.log('[LOG] Comment changed:', text);
                setComment(text);
              }}
              placeholder="Share your experience with this service..."
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmitReview}
            disabled={isSubmitting || rating === 0}
            style={[
              styles.submitButton,
              (isSubmitting || rating === 0) && styles.disabledButton
            ]}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background || '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  formContainer: {
    backgroundColor: Color.inputbg,
    borderRadius: 12,
    padding: 20,
 
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-SemiBold',
    color: '#000',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#000',
    minHeight: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  errorMessageContainer: {
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'AlbertSans-Regular',
  },
  submitButton: {
    backgroundColor: Color.secondary || '#4CAF50',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
    marginLeft: 8,
  },
});

export default Review;