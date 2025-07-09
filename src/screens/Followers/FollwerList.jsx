
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';


const FollowersFollowingTab = () => {
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        apiClient.get('/follows/getfollowers'),
        apiClient.get('/follows/getfollowings'),
      ]);

      setFollowers(followersResponse.data.data || []);
      setFollowing(followingResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      Alert.alert('Error', 'Failed to load followers and following data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToProfile = (userId) => {
    navigation.navigate('UserProfile', { userId });
  };

  const renderUserItem = ({ item }) => {
    // Extract user data based on active tab
    const user = activeTab === 'followers' ? item.follower_id : item.following_id;
    
    if (!user) return null;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => navigateToProfile(user._id)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: user.photourl || 'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstname} {user.lastname}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const message = activeTab === 'followers' 
      ? 'No followers yet' 
      : 'Not following anyone yet';
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4D00" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const data = activeTab === 'followers' ? followers : following;

    return (
      <FlatList
        data={data}
        renderItem={renderUserItem}
        keyExtractor={(item, index) => `${activeTab}-${index}`}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchData}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'followers' && styles.activeTab
          ]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'followers' && styles.activeTabText
          ]}>
            Followers ({followers.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'following' && styles.activeTab
          ]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'following' && styles.activeTabText
          ]}>
            Following ({following.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 18,
    color: Color.secondary,
  
    fontFamily: 'AlbertSans-Bold', 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Color.inputbg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Color.secondary,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Color.secondary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'AlbertSans-Bold',

  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Color.inputbg,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium', 
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
fontFamily: 'AlbertSans-Medium', 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Color.secondary,
    fontFamily: 'AlbertSans-Medium', 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default FollowersFollowingTab;