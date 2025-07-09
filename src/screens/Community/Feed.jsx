import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';
import Members from './Members';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('Feed');
  const [scrollOffset, setScrollOffset] = useState(0);

  const tabs = ['Feed', 'My posts', 'Members'];

  const renderFeedContent = () => (
    <>
      {renderPost()}
      {renderPost()}
    </>
  );

  const renderMyPosts = () => (
    <View style={styles.centerContent}>
      <Icon name="document-text-outline" size={48} color="#666" />
      <Text style={styles.emptyStateText}>No posts yet</Text>
    </View>
  );

  const renderMembers = () => (
    <View >

      <Members />
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Feed':
        return renderFeedContent();
      case 'My posts':
        return renderMyPosts();
      case 'Members':
        return renderMembers();
      default:
        return renderFeedContent();
    }
  };

  const renderPost = () => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1735617352/Profile_pic_mzjia4.png' }}
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.userName}>companies.tools</Text>
            <Text style={styles.userHandle}>@companies.tools</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postText}>
        This is your opening tweet. Make sure to make it catchy as this is your hook to get people reading more. Use emojis! 😎🌟
      </Text>
      
      <Image
        source={{ uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1735617354/143516752256869d0e105599cadc01d7_kxbdyk.jpg' }}
        style={styles.postImage}
      />
      
      <Text style={styles.timestamp}>11:18 PM · May 31, 2022</Text>
      
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Icon name="heart-outline" size={16} color="#666" />
          <Text style={styles.statText}>213</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.statText}>312</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="share-social-outline" size={16} color="#666" />
          <Text style={styles.statText}>4</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        onScroll={event => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri:'https://res.cloudinary.com/dmhvsyzch/image/upload/v1735617356/1df05e354331e6758a8e875df403b78c_wntxbu.jpg' }}
          style={styles.coverImage}
        />

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>Group name</Text>
          <View style={styles.membershipRow}>
            <Text style={styles.memberCount}>30k members</Text>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderContent()}
      </ScrollView>
    </View>
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
  header: {
    paddingTop: 50,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  groupInfo: {
    padding: 16,
    backgroundColor: Color.background,
  },
  groupName: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 20,
    marginBottom: 8,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  memberCount: {
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: Color.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#4CAF50',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: Color.background,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 16,
  },
  userHandle: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  postText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  timestamp: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
  },
});

export default Feed;