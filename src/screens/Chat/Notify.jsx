import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';


const Notify = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    bookings: [],
    followers: [],
    followees: [],
    message: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all notifications from different endpoints
  const fetchNotifications = async () => {
    try {
      setError(null);
      
      // Fetch all notification types in parallel
      const [bookingsRes, followersRes, followeesRes, messageRes] = await Promise.all([
        apiClient.get('/notifications/bookings'),
        apiClient.get('/notifications/follower'),
        apiClient.get('/notifications/followees'),
        apiClient.get('/notifications/message'),
      ]);

      setNotifications({
        bookings: bookingsRes.data?.data || [],
        followers: followersRes.data?.data || [],
        followees: followeesRes.data?.data || [],
        message: messageRes.data?.data || [],
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as seen - implemented based on web version
  const markNotificationAsSeen = async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/mark-seen`);
      
      // Update local state - same logic as web version
      setNotifications(prev => {
        const updateList = (list) =>
          list.map(n => n._id === notificationId ? { ...n, markAsSeen: 'YES' } : n);

        return {
          bookings: updateList(prev.bookings),
          followers: updateList(prev.followers),
          followees: updateList(prev.followees),
          message: updateList(prev.message),
        };
      });
    } catch (err) {
      console.error('Failed to mark notification as seen:', err);
      Alert.alert('Error', 'Failed to update notification');
    }
  };

  // Get all notifications in a single array with type information
  const getAllNotifications = () => {
    return [
      ...notifications.bookings.map(n => ({ ...n, type: 'bookings' })),
      ...notifications.followers.map(n => ({ ...n, type: 'followers' })),
      ...notifications.followees.map(n => ({ ...n, type: 'followees' })),
      ...notifications.message.map(n => ({ ...n, type: 'message' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bookings':
        return 'event-note';
      case 'followers':
        return 'person-add';
      case 'followees':
        return 'people';
      case 'message':
        return 'message';
      default:
        return 'notifications';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Now';
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString();
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={80} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>We'll let you know when updates arrive!</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        item.markAsSeen === 'NO' && styles.unreadNotification
      ]}
      onPress={() => markNotificationAsSeen(item._id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getNotificationIcon(item.type)} 
            size={24} 
            color={item.markAsSeen === 'NO' ? '#4CAF50' : '#666'} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.description}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
          {item.markAsSeen === 'NO' && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allNotifications = getAllNotifications();

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
      {renderHeader()}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#FF5722" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : allNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={allNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => `${item.type}-${item._id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: Color.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 18,
    color: '#000',
  },
  headerSpacer: {
    width: 40, // To balance the back button width
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
    fontFamily: 'AlbertSans-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'AlbertSans-Regular',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  unreadNotification: {
    backgroundColor: '#F8FFF8',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'AlbertSans-Medium',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
    lineHeight: 20,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'AlbertSans-Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});

export default Notify;