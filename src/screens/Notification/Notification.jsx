import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const NotificationSettings = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    bookingMessages: false,
    orderUpdates: true,
    orderMessages: true,
    promotions: true,
    accountNotifications: true,
    marketingNotifications: true,
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity onPress={() => {}} style={styles.testButton}>
          <Text style={styles.testButtonText}>Send test notification</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Options */}
      <View style={styles.content}>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Booking messages</Text>
          <Switch
            value={notifications.bookingMessages}
            onValueChange={() => handleToggle('bookingMessages')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Order updates</Text>
          <Switch
            value={notifications.orderUpdates}
            onValueChange={() => handleToggle('orderUpdates')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Order messages</Text>
          <Switch
            value={notifications.orderMessages}
            onValueChange={() => handleToggle('orderMessages')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Promotions</Text>
          <Switch
            value={notifications.promotions}
            onValueChange={() => handleToggle('promotions')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Account notifications</Text>
          <Switch
            value={notifications.accountNotifications}
            onValueChange={() => handleToggle('accountNotifications')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Marketing notifications</Text>
          <Switch
            value={notifications.marketingNotifications}
            onValueChange={() => handleToggle('marketingNotifications')}
            trackColor={{ false: '#767577', true: '#32CD32' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
  },
  testButton: {
    marginLeft: 'auto',
  },
  testButtonText: {
    color: Color.secondary,
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 26,


  },
  optionText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333333',
  },
});

export default NotificationSettings;