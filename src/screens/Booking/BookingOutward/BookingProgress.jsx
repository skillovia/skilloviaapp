import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import BookCard from '../BookingCard'; 
import apiClient from '../../../Hooks/Api';
import { Color } from '../../../Utils/Theme';


const OutwardProgress = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; // Get id from route params instead of useParams
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const bookingResponse = await apiClient.get('/bookings/get/user/outward');

        if (!bookingResponse.data) {
          throw new Error('Failed to fetch booking details');
        }

        const bookingData = bookingResponse.data;
        const booking = bookingData.data.find(
          (booking) => booking.id === id // compare with string id directly
        );
        
        if (!booking) {
          throw new Error('Booking not found');
        }

        setBookingDetails(booking);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleBookingAction = async (action) => {
    setIsProcessing(true);

    try {
      const response = await apiClient.put(`/bookings/${action}/${id}`);

      if (!response.data) {
        throw new Error(`Failed to ${action} booking`);
      }

      // Update local booking status
      setBookingDetails((prev) => ({
        ...prev,
        status:
          action === 'accept'
            ? 'accepted'
            : action === 'in-progress'
            ? 'in_progress'
            : 'completed',
      }));

      // Show success message and redirect
      const actionVerb =
        action === 'in-progress'
          ? 'started'
          : action === 'complete'
          ? 'completed'
          : 'accepted';
      
      Alert.alert('Success', `Booking ${actionVerb} successfully`);

      if (action === 'complete') {
        navigation.navigate('Bookings'); // Adjust screen name as needed
      }
    } catch (err) {
      setError(`Error with booking action: ${err.message}`);
      Alert.alert('Error', `Failed to ${action} booking`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenDispute = () => {
    // Navigate to the dispute screen with booking data
    if (bookingDetails) {
      navigation.navigate('OpenDispute', {
        bookingId: bookingDetails.id,
        bookedUserId: bookingDetails.booked_user_id,
        bookingTitle: bookingDetails.title,
        description: bookingDetails.description,
      });
    } else {
      Alert.alert('Error', 'Cannot open dispute: Missing booking information');
    }
  };

  const getTimelineData = (status) => {
    // Define status check logic
    const statusChecks = {
      pending: 1,
      accepted: 2,
      in_progress: 3,
      completed: 4,
      disputed: 4,
    };

    const currentStep = statusChecks[status] || 0;

    return [
      {
        status: 'Booking request sent',
        timestamp: bookingDetails?.createdAt
          ? new Date(bookingDetails.createdAt).toLocaleString()
          : '-',
        hasCheck: currentStep >= 1,
      },
      {
        status: 'Booking request confirmed',
        timestamp: bookingDetails?.updatedAt
          ? new Date(bookingDetails.updatedAt).toLocaleString()
          : '-',
        hasCheck: currentStep >= 2,
      },
      {
        status: 'Payment confirmed',
        timestamp: bookingDetails?.updatedAt
          ? new Date(bookingDetails.updatedAt).toLocaleString()
          : '-',
        hasCheck: currentStep >= 2,
      },
      {
        status: 'Service in progress',
        timestamp: bookingDetails?.booking_date
          ? new Date(bookingDetails.booking_date).toLocaleString()
          : '-',
        hasCheck: currentStep >= 3,
      },
      {
        status: 'Service completed',
        timestamp: bookingDetails?.updatedAt
          ? new Date(bookingDetails.updatedAt).toLocaleString()
          : '-',
        hasCheck: currentStep >= 4,
      },
    ];
  };

  const renderActionButton = () => {
    if (!bookingDetails) return null;

    switch (bookingDetails.status) {
      case 'pending':
        return (
          <TouchableOpacity
            disabled={true}
            style={[styles.actionButton, styles.disabledButton]}
          >
            <Text style={styles.disabledButtonText}>
              Start Service (Awaiting Acceptance)
            </Text>
          </TouchableOpacity>
        );
      case 'accepted':
        return (
          <TouchableOpacity
            onPress={() => handleBookingAction('in-progress')}
            disabled={isProcessing}
            style={[
              styles.actionButton,
              styles.primaryButton,
              isProcessing && styles.processingButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>Start Service</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            onPress={() => handleBookingAction('complete')}
            disabled={isProcessing}
            style={[
              styles.actionButton,
              styles.successButton,
              isProcessing && styles.processingButton,
            ]}
          >
            <Text style={styles.successButtonText}>Complete Service</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <TouchableOpacity disabled={true} style={[styles.actionButton, styles.disabledButton]}>
            <Text style={styles.disabledButtonText}>Service Completed</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const BackButton = () => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Icon name="arrow-left" size={24} color="#000" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const timelineData = getTimelineData(bookingDetails?.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <BackButton />
          </View>

          {bookingDetails && (
            <BookCard
              key={bookingDetails.id}
              id={bookingDetails.id}
              title={bookingDetails.title}
              description={bookingDetails.description}
              date={bookingDetails.booking_date}
              status={bookingDetails.status}
              location={bookingDetails.booking_location}
              fileUrl={bookingDetails.file_url}
              thumbnails={[
                bookingDetails.thumbnail01,
                bookingDetails.thumbnail02,
                bookingDetails.thumbnail03,
                bookingDetails.thumbnail04,
              ].filter(Boolean)}
            />
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progress</Text>
              <TouchableOpacity
                onPress={() =>navigation.navigate('outwardDetails', { bookingId: id })}
                
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeline}>
              {timelineData.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  {index !== timelineData.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}

                  <View style={styles.timelineIconContainer}>
                    {item.hasCheck ? (
                      <View style={styles.timelineIconChecked}>
                        <Icon name="check" size={16} color="white" />
                      </View>
                    ) : (
                      <View style={styles.timelineIconUnchecked} />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStatus}>{item.status}</Text>
                    <Text style={styles.timelineTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionContainer}>
            {renderActionButton()}

            {bookingDetails && bookingDetails.status !== 'completed' && (
              <TouchableOpacity
                onPress={handleOpenDispute}
                disabled={isProcessing}
                style={[
                  styles.actionButton,
                  styles.disputeButton,
                  isProcessing && styles.processingButton,
                ]}
              >
                <Text style={styles.disputeButtonText}>Open dispute</Text>
              </TouchableOpacity>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    // paddingBottom: 32,
  },
  header: {
    marginVertical: 14,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'AlbertSans-Medium',
  },
  errorButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  progressSection: {
    marginBottom: 16,
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#1a1a1a',
  },
  viewDetailsText: {
    color: Color.secondary,
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    textDecorationColor:Color.secondary,
    textDecorationLine: 'underline',
  },
  timeline: {
    position: 'relative',
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 40,
    paddingBottom: 32,
  },
  timelineLine: {
    position: 'absolute',
    left: 25,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: Color.secondary,
  },
  timelineIconContainer: {
    position: 'absolute',
    left: 15,
    top: 4,
  },
  timelineIconChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Color.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  timelineContent: {
    paddingLeft: 16,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: 'AlbertSans-Medium',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'AlbertSans-Regular',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#60a5fa',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  successButton: {
    backgroundColor: '#4ade80',
  },
  successButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  disputeButton: {
    backgroundColor: '#fecaca',
  },
  disputeButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  processingButton: {
    opacity: 0.5,
  },
});

export default OutwardProgress;