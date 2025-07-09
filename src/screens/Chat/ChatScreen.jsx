import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Bubble,
  GiftedChat,
  Send,
  InputToolbar,
  Composer,
} from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Color } from '../../Utils/Theme';
import EmptyMessagesScreen from './EmptyMessagesScreen ';
import apiClient from '../../Hooks/Api';

const ChatScreen = ({ navigation, route }) => {
  const { userId, name, avatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const pollingInterval = useRef(null);

  // Get current user ID from token
  const getCurrentUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return null;
      const decodedToken = jwtDecode(token);
      return decodedToken?.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  // Transform API messages to GiftedChat format
  const transformMessages = (apiMessages, currentUserId) => {
    return apiMessages.map((msg) => ({
      _id: msg._id,
      text: msg.content,
      createdAt: new Date(msg.createdAt || msg.created_at),
      user: {
        _id: msg.sender_id || msg.senderId,
      },
    })).reverse(); // GiftedChat expects messages in reverse chronological order
  };

  // Mark messages as read
  const markMessagesAsRead = async (messages) => {
    if (!currentUserId) return;
    
    const unreadMessages = messages.filter(
      (msg) => (msg.sender_id || msg.senderId) !== currentUserId && !msg.mark_as_read
    );

    for (const msg of unreadMessages) {
      try {
        await apiClient.put(`/message/markasread/${msg._id}`);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Fetch chat history
  const fetchChatHistory = async () => {
    try {
      if (!currentUserId || !userId) return;
      
      const response = await apiClient.get(`/message/${currentUserId}/${userId}`);
      const apiMessages = response.data.data || [];
      
      const transformedMessages = transformMessages(apiMessages, currentUserId);
      setMessages(transformedMessages);
      
      // Mark messages as read
      markMessagesAsRead(apiMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const onSend = useCallback(async (newMessages = []) => {
    if (!currentUserId || !userId) return;
    
    setSending(true);
    const messageToSend = newMessages[0];
    
    try {
      const response = await apiClient.post('/message', {
        senderId: currentUserId,
        receiverId: userId,
        content: messageToSend.text,
        mark_as_read: false,
      });
      
      // Add message to local state immediately for better UX
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessages)
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Remove the message from local state if sending failed
      setMessages(previousMessages =>
        previousMessages.filter(msg => msg._id !== messageToSend._id)
      );
    } finally {
      setSending(false);
    }
  }, [currentUserId, userId]);

  // Initialize component
  useEffect(() => {
    const initializeChat = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    
    initializeChat();
  }, []);

  // Fetch messages when currentUserId is available
  useEffect(() => {
    if (currentUserId) {
      fetchChatHistory();
      
      // Set up polling for new messages
      pollingInterval.current = setInterval(() => {
        fetchChatHistory();
      }, 3000);
      
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [currentUserId]);



  const renderSend = (props) => {
    return (
      <Send {...props} disabled={sending}>
        <View style={styles.sendingContainer}>
          {sending ? (
            <ActivityIndicator size={24} color="#2e64e5" />
          ) : (
            <MaterialCommunityIcons
              name="send-circle"
              size={32}
              color="#2e64e5"
            />
          )}
        </View>
      </Send>
    );
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Color.secondary,
            borderRadius: 12,
            marginVertical: 3,
            paddingHorizontal: 2,
          },
          left: {
            backgroundColor: Color.gray,
            borderRadius: 12,
            marginVertical: 3,
            paddingHorizontal: 2,
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
            fontFamily: 'AlbertSans-Regular',
            fontSize: 15,
            lineHeight: 20,
          },
          left: {
            color: '#000',
            fontSize: 15,
            lineHeight: 20,
            fontFamily: 'AlbertSans-Regular',
          },
        }}
      />
    );
  };

  const renderComposer = (props) => {
    return (
      <View style={styles.composerContainer}>
    
        <Composer
          {...props}
          textInputStyle={styles.composer}
        />
      </View>
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputToolbarPrimary}
      />
    );
  };

  const renderHeader = () => {
    const handleProfilePress = () => {
      // Navigate to user profile screen
      navigation.navigate('UserProfile', { 
        userId: userId,
        name: name,
        avatar: avatar 
      });
    };
  
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        
        {/* User Info Container */}
        <TouchableOpacity 
          style={styles.userInfoContainer} 
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Image 
            source={{ 
              uri: avatar || 'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg' 
            }} 
            style={styles.headerAvatar} 
          />
          <View style={styles.userTextInfo}>
            <Text style={styles.headerTitle}>{name}</Text>
            {/* You can add online status here if needed */}
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.secondary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
      {renderHeader()}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: currentUserId,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderComposer={renderComposer}
        renderInputToolbar={renderInputToolbar}
        alwaysShowSend
        renderDay={(props) => {
          return (
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>
                {new Date().toDateString() === new Date(props.currentMessage.createdAt).toDateString() 
                  ? 'Today' 
                  : new Date(props.currentMessage.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                }
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginRight: 12,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  onlineStatus: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Regular',
    color: '#4CAF50',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 5,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    flex: 1,
  },
  uploadButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composer: {
    backgroundColor: Color.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginLeft: 4,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
  },
  inputToolbar: {
    backgroundColor: Color.background,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingVertical: 4,
  },
  inputToolbarPrimary: {
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dayText: {
    backgroundColor: Color.gray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#666',
    fontSize: 12,
    fontFamily: 'AlbertSans-Regular',
  },
});

export default ChatScreen;