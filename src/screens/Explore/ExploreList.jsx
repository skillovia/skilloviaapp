import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';
import FollowButton from '../Followers/FollowBtn'; 

const ExploreList = () => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const route = useRoute();
  
  // Get parameters from navigation
  const categoryId = route.params?.id || '';
  const categoryName = route.params?.category || '';
   const categoryDescription = route.params?.description || '';

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get(`/skills/category/${categoryId}/users`);
        console.log(response.data);

        if (response.data.status === 'success') {
          setSkills(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch skills');
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        const errorMessage = err.response?.data?.message || 'Unable to load skills. Please try again later.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchSkills();
    }
  }, [categoryId]);

  const handleUserPress = (userId) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleExploreMore = () => {
    navigation.navigate('ExploreAll');
  };

  const handleFollowSuccess = (isFollowing, userId) => {
    // Optional: Handle follow success callback
    console.log(`User ${userId} ${isFollowing ? 'followed' : 'unfollowed'}`);
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={64} color="#6B7280" />
      <Text style={styles.emptyTitle}>No Skills Found</Text>
      <Text style={styles.emptyDescription}>
        No one is currently offering skills in {categoryName}. Check back later
        or try searching for a different category.
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={handleExploreMore}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreButtonText}>Explore More Categories</Text>
      </TouchableOpacity>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="user-x" size={64} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderSkillItem = (skill) => (
    <TouchableOpacity
      key={skill._id}
      style={styles.skillItem}
      onPress={() => handleUserPress(skill.userId?._id)}
      activeOpacity={0.7}
    >
      <View style={styles.skillContent}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => handleUserPress(skill.userId?._id)}>
            <Image
              source={{
                uri: skill.userId?.photourl ||
                  'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
              }}
              style={styles.userImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {skill.userId?.firstname} {skill.userId?.lastname}
            </Text>
            <View style={styles.skillInfo}>
              <Text style={styles.skillInfoText}>
                Exp: {skill.experience_level}
              </Text>
            </View>
            <View style={styles.skillInfo}>
              <Text style={styles.skillInfoText}>
                Rate: £{skill.hourly_rate}/hr
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.followButtonContainer}>
          <FollowButton
            userId={skill.userId?._id}
            onFollowSuccess={(isFollowing) => handleFollowSuccess(isFollowing, skill.userId?._id)}
            showAlert={false} // Set to true if you want success alerts
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName}
         
        </Text>

        
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && <ErrorState />}

        {/* Empty State */}
        {!isLoading && !error && skills?.length === 0 && <EmptyState />}

        {/* Skills List */}
        {!isLoading && !error && skills?.length > 0 && (
          <View style={styles.skillsList}>
            {skills.map(renderSkillItem)}
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
    // paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold', 
    color: '#111827',
    textTransform: 'capitalize',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Medium', 
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    maxWidth: 300,
  },
  exploreButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  skillsList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skillItem: {
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  skillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userImage: {
    width: 58,
    height: 58,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium', 
    color: '#111827',
    marginBottom: 4,
  },
  skillInfo: {
    marginVertical: 1,
  },
  skillInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',    
  },
  followButtonContainer: {
    marginLeft: 12,
  },
});

export default ExploreList;