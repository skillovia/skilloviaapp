import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Clipboard,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Color } from '../../../Utils/Theme';
import BookCard from '../BookingCard';
import apiClient from '../../../Hooks/Api';
import DynamicGoogleMap from '../GoogleMap'; 
import Icon from 'react-native-vector-icons/MaterialIcons';

const InwardDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch booking details
      const bookingResponse = await apiClient.get('/bookings/get/user/inward');
      
      if (!bookingResponse.data || !bookingResponse.data.data) {
        throw new Error('Failed to fetch booking details');
      }

      const booking = bookingResponse.data.data.find(
        (booking) => booking.id === bookingId
      );
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      setBookingDetails(booking);

      // Then fetch client profile using the booking's client ID
      const profileResponse = await apiClient.get(
        `/users/basic/profile/${booking.booking_user_id}`
      );

      if (!profileResponse.data || !profileResponse.data.data) {
        throw new Error('Failed to fetch client profile');
      }

      setClientProfile(profileResponse.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      Alert.alert('Error', err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action) => {
    try {
      setIsProcessing(true);
      
      const response = await apiClient.put(`/bookings/${action}/${bookingId}`);

      if (!response.data) {
        throw new Error(`Failed to ${action} booking`);
      }

      // Update local booking status
      setBookingDetails((prev) => ({
        ...prev,
        status: action === 'accept' ? 'accepted' : 'rejected',
      }));

      // Show success message
      const message = `Booking ${action}ed successfully`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', message);
      }
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      Alert.alert('Error', `Failed to ${action} booking. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setIsProcessing(true);
      
      const response = await apiClient.put(`/bookings/completed/${bookingId}`, {
        status: 'completed',
      });

      if (!response.data) {
        throw new Error('Failed to complete booking');
      }

      // Update local booking status
      setBookingDetails((prev) => ({
        ...prev,
        status: 'completed',
      }));

      // Close confirmation modal and show success modal
      setShowCompletionModal(false);
      setShowSuccessModal(true);

      // Navigate to review page after a short delay
      setTimeout(() => {
        setShowSuccessModal(false);
        
        // Navigate to Review screen with necessary parameters
        navigation.navigate('review', {
          skillId: bookingDetails?.skill_id || bookingDetails?.id, // Adjust based on your data structure
          bookingUserId: bookingDetails?.booking_user_id,
          bookingId: bookingDetails?.id,
          title: bookingDetails?.title,
          booked_user_id: bookingDetails?.booking_user_id, // The client who booked the service
        });
      }, 2000);
    } catch (err) {
      console.error('Error completing booking:', err);
      Alert.alert('Error', 'Failed to complete booking. Please try again.');
      setShowCompletionModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatClick = () => {
    if (clientProfile && bookingDetails) {
      navigation.navigate('message', {
        userId: bookingDetails.booking_user_id,
        name: [clientProfile.firstname, clientProfile.lastname]
          .filter(Boolean) 
          .join(' ') || 'Unknown User', 
        avatar: clientProfile.photourl || null, 
      });
    }
  };

  const handleCopyId = async () => {
    try {
      await Clipboard.setString(bookingDetails?.id?.toString() || '');
      const message = 'Booking ID copied to clipboard';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied', message);
      }
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleLocationPress = () => {
    if (bookingDetails?.booking_location) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(bookingDetails.booking_location)}`;
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps');
      });
    }
  };

  const getThumbnails = (booking) => {
    return [
      booking?.thumbnail01,
      booking?.thumbnail02,
      booking?.thumbnail03,
      booking?.thumbnail04,
    ].filter(Boolean);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.secondary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Booking Progress</Text>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.clientContainer}>
            <View style={styles.clientInfo}>
              <Image
                source={{
                  uri: clientProfile?.photourl ||
                    'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
                }}
                style={styles.clientImage}
              />
              <Text style={styles.clientName}>
                {clientProfile?.firstname} {clientProfile?.lastname}
              </Text>
            </View>
            <TouchableOpacity onPress={handleChatClick} style={styles.chatButton}>
              <Icon name="chat" size={24} color={Color.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Book Card */}
        {bookingDetails && (
          <View style={styles.bookCardContainer}>
            <BookCard
              id={bookingDetails.id}
              title={bookingDetails.title}
              description={bookingDetails.description}
              date={bookingDetails.booking_date}
              status={bookingDetails.status}
              location={bookingDetails.booking_location}
              fileUrl={bookingDetails.file_url}
              thumbnails={getThumbnails(bookingDetails)}
              type="inward"
            />
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          {/* Location with Embedded Map */}
          <View style={styles.detailRow}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {bookingDetails?.booking_location || 'N/A'}
              </Text>
            </View>
            
            {/* Embedded Google Map */}
            {bookingDetails?.booking_location && (
              <View style={styles.mapContainer}>
                <DynamicGoogleMap 
                  location={bookingDetails.booking_location}
                  style={styles.embeddedMap}
                />
                <TouchableOpacity onPress={handleLocationPress} style={styles.openMapsButton}>
                  <Icon name="open-in-new" size={16} color={Color.secondary} />
                  <Text style={styles.openMapsText}>Open in Maps App</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Title */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>
              {bookingDetails?.title || 'N/A'}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Message</Text>
            <Text style={styles.detailValue}>
              {bookingDetails?.description || 'N/A'}
            </Text>
          </View>

          {/* Booking ID */}
          <View style={styles.detailRowBetween}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <View style={styles.idContainer}>
              <Text style={styles.detailValue}>
                {bookingDetails?.id || 'N/A'}
              </Text>
              <TouchableOpacity onPress={handleCopyId}>
                <Text style={styles.copyButton}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.detailRowBetween}>
            <Text style={styles.detailLabel}>Payment method</Text>
            <Text style={styles.detailValue}>
              {bookingDetails?.payment_method || 'Exchange for service'}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.detailRowBetween}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>
              £{bookingDetails?.price?.toLocaleString() || '10,000'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {bookingDetails?.status === 'completed' ? (
            <TouchableOpacity disabled style={styles.completedButton}>
              <Text style={styles.completedButtonText}>Completed</Text>
            </TouchableOpacity>
          ) : bookingDetails?.status === 'accepted' ? (
            <TouchableOpacity
              onPress={() => setShowCompletionModal(true)}
              disabled={isProcessing}
              style={[styles.acceptButton, isProcessing && styles.disabledButton]}
            >
              <Text style={styles.acceptButtonText}>
                {isProcessing ? 'Processing...' : 'Complete booking'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleBookingAction('accept')}
              disabled={isProcessing}
              style={[styles.acceptButton, isProcessing && styles.disabledButton]}
            >
              <Text style={styles.acceptButtonText}>
                {isProcessing ? 'Processing...' : 'Accept booking'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={() => handleBookingAction('reject')}
            disabled={isProcessing || bookingDetails?.status === 'completed'}
            style={[styles.rejectButton, 
              (isProcessing || bookingDetails?.status === 'completed') && styles.disabledButton]}
          >
            <Text style={styles.rejectButtonText}>
              {isProcessing ? 'Processing...' : 'Reject booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Completion Confirmation Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Booking</Text>
              <TouchableOpacity onPress={() => setShowCompletionModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>
              Are you sure you want to mark this booking as completed? You will be redirected to write a review for this service.
            </Text>

            <View style={styles.bookingDetailsCard}>
              <Text style={styles.cardTitle}>Booking Details:</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>ID:</Text>
                <Text style={styles.cardValue}>{bookingDetails?.id}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Client:</Text>
                <Text style={styles.cardValue}>
                  {clientProfile?.firstname} {clientProfile?.lastname}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Title:</Text>
                <Text style={styles.cardValue}>{bookingDetails?.title}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleCompleteBooking}
                disabled={isProcessing}
                style={[styles.confirmButton, isProcessing && styles.disabledButton]}
              >
                {isProcessing ? (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.confirmButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Completion</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCompletionModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={64} color={Color.secondary} />
            </View>
            <Text style={styles.successTitle}>Booking Completed!</Text>
            <Text style={styles.successText}>
              You have successfully marked this booking as completed. You will now be redirected to write a review.
            </Text>
            <View style={styles.redirectContainer}>
              <Text style={styles.redirectText}>
                Redirecting to review page...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background || '#f5f5f5',
    // paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background || '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background || '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  retryButton: {
    backgroundColor: Color.secondary || '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginBottom: 8,
  },
  clientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  chatButton: {
    padding: 8,
  },
  bookCardContainer: {
    marginBottom: 24,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
  // New styles for embedded map
  mapContainer: {
    marginTop: 12,
  },
  embeddedMap: {
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  openMapsText: {
    color: Color.secondary || '#4CAF50',
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    marginLeft: 4,
  },
  // Remove old map button styles
  mapButton: {
    backgroundColor: Color.secondary || '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    color: Color.secondary || '#4CAF50',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Color.secondary || '#4CAF50',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  completedButton: {
    flex: 1,
    backgroundColor: '#d1d5db',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  completedButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-SemiBold',
    color: '#1f2937',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  bookingDetailsCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#6b7280',
  },
  cardValue: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Color.secondary || '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-SemiBold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  redirectContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  redirectText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  goToBookingsButton: {
    backgroundColor: Color.secondary || '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  goToBookingsText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
});

export default InwardDetails;