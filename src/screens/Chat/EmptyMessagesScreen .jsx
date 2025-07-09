// src/screens/EmptyMessagesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EmptyMessagesScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon 
          name="chatbubbles-outline" 
          size={70} 
          color={'#333'}
      
        />
      </View>
      
      <Text style={styles.emptyText}>Nothing to see here!</Text>
      <Text style={styles.subText}>You have no messages</Text>
      <Text style={styles.hintText}>
        Start a conversation to see your messages here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  iconContainer: {
  paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  
  },
  emptyText: {
    fontSize: 24,
  
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  hintText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular',
  },
});

export default EmptyMessagesScreen;