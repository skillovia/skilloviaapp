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
  Linking,
  Clipboard,
  Dimensions,
} from 'react-native';
import { Color } from '../../../Utils/Theme';
import BookCard from '../BookingCard';
import apiClient from '../../../Hooks/Api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DynamicGoogleMap from '../GoogleMap';

const { width } = Dimensions.get('window');

const OutwardDetails = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [bookingDetails, setBookingDetails] = useState(null);
  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch booking details
      const bookingResponse = await apiClient.get('/bookings/get/user/outward');
      
      if (bookingResponse.data && bookingResponse.data.data) {
        const booking = bookingResponse.data.data.find(
          (booking) => booking.id === bookingId || booking.id.toString() === bookingId.toString()
        );

        if (!booking) {
          throw new Error('Booking not found');
        }

        setBookingDetails(booking);

        // Then fetch technician profile using the booking's technician ID
        const profileResponse = await apiClient.get(
          `/users/basic/profile/${booking.booked_user_id}`
        );

        if (profileResponse.data && profileResponse.data.data) {
          setTechnicianProfile(profileResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch booking details');
      Alert.alert('Error', 'Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action) => {
    setIsProcessing(true);
    
    try {
      const response = await apiClient.put(`/bookings/${action}/${bookingId}`);
      
      if (response.data) {
        // Update local booking status
        setBookingDetails((prev) => ({
          ...prev,
          status: action === 'accept' ? 'accepted' : 'rejected',
        }));

        // If the action is "accept", navigate to the review page
        if (action === 'accept') {
          handleNavigateToReview();
        } else {
          Alert.alert('Success', `Booking ${action}ed successfully`);
          navigation.goBack();
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      Alert.alert('Error', `Failed to ${action} booking. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigateToReview = () => {
    if (bookingDetails) {
      navigation.navigate('Review', {
        skillId: bookingDetails.skills_id,
        bookingUserId: bookingDetails.booking_user_id,
        bookingId: bookingDetails.id,
        title: bookingDetails.title,
        booked_user_id: bookingDetails.booked_user_id,
      });
    } else {
      Alert.alert('Error', 'Cannot submit review: Missing booking information');
    }
  };

  const handleOpenDispute = () => {
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

  const handleChatClick = () => {
    if (technicianProfile && bookingDetails) {
      navigation.navigate('message', {
        userId: bookingDetails.booked_user_id,
        name: [technicianProfile.firstname, technicianProfile.lastname]
          .filter(Boolean) 
          .join(' ') || 'Unknown User', 
        avatar: technicianProfile.photourl || null, 
      });
    }
  };

  const handleCopyId = () => {
    if (bookingDetails?.id) {
      Clipboard.setString(bookingDetails.id.toString());
      Alert.alert('Success', 'Booking ID copied to clipboard');
    }
  };


  const getThumbnails = (booking) => {
    return [
      booking.thumbnail01,
      booking.thumbnail02,
      booking.thumbnail03,
      booking.thumbnail04,
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

  if (!bookingDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      {/* Technician Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact your technician</Text>
        <View style={styles.technicianContainer}>
          <View style={styles.technicianInfo}>
            <Image
              source={{
                uri: technicianProfile?.photourl || 
                'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
              }}
              style={styles.technicianImage}
            />
            <Text style={styles.technicianName}>
              {technicianProfile?.firstname} {technicianProfile?.lastname}
            </Text>
          </View>
          <TouchableOpacity onPress={handleChatClick} style={styles.chatButton}>
            <Icon name="chat" size={24} color={Color.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Card */}
      <View style={styles.bookingCardContainer}>
        <BookCard
          id={bookingDetails.id}
          title={bookingDetails.title}
          description={bookingDetails.description}
          date={bookingDetails.booking_date}
          status={bookingDetails.status}
          location={bookingDetails.booking_location}
          fileUrl={bookingDetails.file_url}
          thumbnails={getThumbnails(bookingDetails)}
          type="outward"
        />
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <View style={styles.locationHeader}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>
            {bookingDetails?.booking_location || 'N/A'}
          </Text>
        </View>

        <DynamicGoogleMap 
                  location={bookingDetails.booking_location}
                  style={styles.embeddedMap}
                />
    
      </View>

      {/* Details Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Title</Text>
        <Text style={styles.detailText}>{bookingDetails?.title || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message</Text>
        <Text style={styles.detailText}>{bookingDetails?.description || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Booking ID</Text>
        <View style={styles.detailValueContainer}>
          <Text style={styles.detailValue}>{bookingDetails?.id || 'N/A'}</Text>
          <TouchableOpacity onPress={handleCopyId}>
            <Text style={styles.copyButton}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Payment method</Text>
        <Text style={styles.detailValue}>
          {bookingDetails?.payment_method || 'Exchange for service'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Price</Text>
        <Text style={styles.detailValue}>
          £{bookingDetails?.price?.toLocaleString() || '10,000'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleOpenDispute}
          disabled={isProcessing}
          style={[styles.actionButton, styles.disputeButton]}
        >
          <Text style={styles.disputeButtonText}>
            {isProcessing ? 'Processing...' : 'Open dispute'}
          </Text>
        </TouchableOpacity>
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '600',
    color: '#000',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  technicianContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  technicianImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  technicianName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '500',
    color: '#000',
  },
  chatButton: {
    padding: 8,
  },
  bookingCardContainer: {
    margin: 16,
    marginTop: 0,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.secondary,
  },
  mapButtonText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '500',
    color: '#000',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#22c55e',
    marginLeft: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  disputeButtonText: {
    fontSize: 15,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '500',
    color: '#dc2626',
  },
 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
});

export default OutwardDetails;