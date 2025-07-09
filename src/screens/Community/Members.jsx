import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const profiles = [
  { id: '1', name: 'Sophia Johnson', username: '@sophiaJJ', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Emily Davis', username: '@davis', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Oliver Smith', username: '@oliverSmith', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '4', name: 'Ava Brown', username: '@avaBrown', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '5', name: 'Noah Wilson', username: '@WilsonNoah', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '6', name: 'Emma Martinez', username: '@emmaMtz', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

const Members = ({navigation}) => {
  const [followStates, setFollowStates] = useState(
    profiles.reduce((acc, profile) => ({
      ...acc,
      [profile.id]: {
        following: false,
        animation: new Animated.Value(0)
      }
    }), {})
  );

  const handleFollow = (id) => {
    const newFollowing = !followStates[id].following;
    
    // Update state
    setFollowStates(prevState => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        following: newFollowing
      }
    }));

    // Animate button
    Animated.sequence([
      Animated.spring(followStates[id].animation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(followStates[id].animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const renderProfile = ({ item }) => {
    const isFollowing = followStates[item.id].following;
    const animatedStyle = {
      transform: [
        {
          scale: followStates[item.id].animation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1]
          })
        }
      ]
    };

    return (
      <View style={styles.profileCard}>
        <Image source={{ uri: item.image }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={() => handleFollow(item.id)}
          >
            <Text style={isFollowing ? styles.followingText : styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <FlatList
    data={profiles}
    keyExtractor={(item) => item.id}
    renderItem={renderProfile}
    contentContainerStyle={styles.listContainer}
    showsVerticalScrollIndicator={false}
  />

  );
};

const styles = StyleSheet.create({


  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.gray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
  },
  username: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    // backgroundColor: '#FFE664',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Color.secondary,
    borderColor: '#4CAF50',
  },
  followButtonText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  followingText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
});

export default Members;