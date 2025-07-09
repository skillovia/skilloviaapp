// MessagesListScreen.js - Updated with API integration
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Text,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Color } from '../../Utils/Theme';
import EmptyMessagesScreen from './EmptyMessagesScreen ';
import apiClient from '../../Hooks/Api';


const MessagesListScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);

 
  // Format time function
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes <= 0 ? 1 : diffMinutes}m ago`;
    }
    
    // If today, show time
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }
    
    // Else, show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch chat users
  const fetchChatUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/message/chat/history/users');
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        const formattedUsers = response.data.data.map(user => ({
          id: user.user_id,
          name: user.name,
          message: user.lastMessage || 'No messages yet',
          time: formatTime(user.lastMessageTime),
          avatar: user.photourl || 'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg',
          unreadCount: user.unreadMessageCount || 0,
          userId: user.user_id,
        }));
        setMessages(formattedUsers);
        setFilteredMessages(formattedUsers);
      }
    } catch (err) {
      console.error('Error fetching chat users:', err);
      setError(err.message || 'Failed to load chats');
      Alert.alert('Error', 'Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(message =>
        message.name.toLowerCase().includes(query.toLowerCase()) ||
        message.message.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  };

  useEffect(() => {
    fetchChatUsers();
    
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchChatUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() =>
        navigation.navigate('message', {
          userId: item.userId,
          name: item.name,
          avatar: item.avatar,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{item.time}</Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.messageText} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Color.secondary} />
 
    </View>
  );

  const ErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load chats</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchChatUsers}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <LoadingComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {error ? (
        <ErrorComponent />
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyMessagesScreen}
          refreshing={loading}
          onRefresh={fetchChatUsers}
        />
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 40
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Regular',
    color: '#000',
  },


  searchContainer: {
    padding: 16,
    paddingTop:20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 32,
    paddingHorizontal: 12,
    borderWidth:1
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#333',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 13,
    color: '#fff',
  },
  messageText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
  },
});

export default MessagesListScreen;