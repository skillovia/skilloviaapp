import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const Payment = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const navigateToBills = () => {
    navigation.navigate('Bills');
  };

  const navigateToGetPaid = () => {
    navigation.navigate('GetPaid');
  };

;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backButtonText}>Payment</Text>
          </TouchableOpacity>

          {/* Billing Button */}
          <TouchableOpacity style={styles.menuButton} onPress={navigateToBills}>
            <View style={styles.menuButtonContent}>
              <View style={styles.menuButtonLeft}>
                <Icon name="credit-card" size={24} color="#6B7280" />
                <View style={styles.menuButtonTextContainer}>
                  <Text style={styles.menuButtonTitle}>Billing</Text>
                  <Text style={styles.menuButtonSubtitle}>
                    View and manage your payment methods, and billing details.
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Get Paid Button */}
          <TouchableOpacity style={styles.menuButton} onPress={navigateToGetPaid}>
            <View style={styles.menuButtonContent}>
              <View style={styles.menuButtonLeft}>
                <Icon name="business" size={24} color="#6B7280" />
                <View style={styles.menuButtonTextContainer}>
                  <Text style={styles.menuButtonTitle}>Get Paid</Text>
                  <Text style={styles.menuButtonSubtitle}>
                    Set up and manage your payout methods to receive payments.
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

      
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    maxWidth: 896, 
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#374151',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  menuButton: {
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  menuButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButtonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    fontFamily: 'AlbertSans-Regular',
  },
  walletSection: {
    paddingTop: 40,
    alignItems: 'center',
  },
 
});

export default Payment;