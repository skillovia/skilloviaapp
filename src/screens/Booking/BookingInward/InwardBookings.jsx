import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  TouchableOpacity 
} from 'react-native';
import { Color } from '../../../Utils/Theme';

import BookCard from '../BookingCard'; 
import apiClient from '../../../Hooks/Api';

const InwardBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInwardBookings();
  }, []);

  const fetchInwardBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/bookings/get/user/inward');
      
      if (response.data && response.data.data) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching inward bookings:', err);
      setError('Failed to fetch bookings');
      Alert.alert('Error', 'Failed to load inward bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getThumbnails = (booking) => {
    // Filter out null/undefined thumbnails
    return [
      booking.thumbnail01,
      booking.thumbnail02,
      booking.thumbnail03,
      booking.thumbnail04,
    ].filter(Boolean);
  };

  const handleViewDetails = (bookingId) => {
    navigation.navigate('inwardsDetails', { bookingId: bookingId });
  };

  const renderBookingCard = ({ item }) => (
    <BookCard
      id={item.id}
      title={item.title}
      description={item.description}
      date={item.booking_date}
      status={item.status}
      location={item.booking_location}
      fileUrl={item.file_url}
      thumbnails={getThumbnails(item)}
      type="inward"
      showViewProgress={true}
      onViewProgress={() => handleViewDetails(item.id)}
      viewProgressText="View Details"
      onPress={() => navigation.navigate('inwardDetails', { bookingId: item.id })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.secondary} />
        <Text style={styles.loadingText}>Loading inward bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchInwardBookings} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.bookingsContainer}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inward bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchInwardBookings}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bookingsContainer: {
    flex: 1,
    backgroundColor: Color.background,
  
  },
  listContainer: {
    padding: 16,
    paddingTop: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
});

export default InwardBookings;