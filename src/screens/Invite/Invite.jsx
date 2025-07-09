import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Linking,
  Clipboard,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Icon from 'react-native-vector-icons/FontAwesome';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';


const { width } = Dimensions.get('window');

const InviteScreen = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referredUsers, setReferredUsers] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralsError, setReferralsError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (referralCode) {
      fetchReferredUsers(referralCode);
    }
  }, [referralCode]);

  const fetchProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Access token not found');
        setLoading(false);
        return;
      }

      const userId = jwtDecode(accessToken).id;
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/users/profile/${userId}`);

      if (response.data && response.data.data && response.data.data.referral_code) {
        setReferralCode(response.data.data.referral_code);
        setError('');
      } else {
        setError('No referral code found in profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferredUsers = async (code) => {
    setLoadingReferrals(true);
    setReferralsError('');
    try {
      const response = await apiClient.get(`/users/get/myreferred/${code}`);
      setReferredUsers(response.data.data || []);
    } catch (err) {
      setReferralsError(err.message || 'Failed to fetch referred users');
      setReferredUsers([]);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralCode) return;
    try {
      await Clipboard.setString(referralCode);
      setCopySuccess(true);
      Alert.alert('Success', 'Referral code copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy the link:', err);
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };



  const renderReferredUser = ({ item, index }) => (
    <View style={styles.userItem}>
      <Image
        source={{ uri: item.photourl || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
        onError={() => {
          // Handle image error
        }}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstname} {item.lastname}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
      </View>
      {item.status === 'successful' && (
        <Icon name="check-circle" size={20} color="#22c55e" />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A4D00" />
      </View>
    );
  }

  const successfulReferrals = referredUsers.filter(u => u.status === 'successful');
  const totalRewards = successfulReferrals.reduce((sum, u) => sum + (u.rewardAmount || 0), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="users" size={32} color="#1A4D00" />
          <Text style={styles.title}>Invite Friends</Text>
        </View>
        <Text style={styles.subtitle}>
          Share the benefits with your friends and earn rewards for every successful referral!
        </Text>
      </View>

      <View style={styles.referralCodeSection}>
        <View style={styles.sectionHeader}>
          <Icon name="gift" size={20} color="#1A4D00" />
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              value={referralCode}
              editable={false}
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.copyButton, !referralCode && styles.disabledButton]}
              onPress={handleCopyLink}
              disabled={!referralCode}
            >
              <Icon 
                name={copySuccess ? "check-circle" : "copy"} 
                size={16} 
                color="white" 
              />
              <Text style={styles.copyButtonText}>
                {copySuccess ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>

      <View style={styles.contentContainer}>
        {/* How it Works */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="gift" size={20} color="#1A4D00" />
            <Text style={styles.sectionTitle}>How it Works</Text>
          </View>
          <View style={styles.stepsList}>
            {[
              {
                step: 1,
                title: 'Share your unique referral code',
                description: 'Send your code to friends via any platform'
              },
              {
                step: 2,
                title: 'Friends sign up',
                description: 'They create an account using your code'
              },
              {
                step: 3,
                title: 'Earn rewards',
                description: 'Get bonuses for successful referrals'
              }
            ].map((item) => (
              <View key={item.step} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Referral Stats */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="users" size={20} color="#1A4D00" />
            <Text style={styles.sectionTitle}>Your Referral Stats</Text>
          </View>
          <View style={styles.statsList}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="users" size={20} color="#1A4D00" />
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              <Text style={styles.statValue}>{referredUsers.length}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="check-circle" size={20} color="#1A4D00" />
                <Text style={styles.statLabel}>Successful Referrals</Text>
              </View>
              <Text style={styles.statValue}>{successfulReferrals.length}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="dollar" size={20} color="#1A4D00" />
                <Text style={styles.statLabel}>Rewards Earned</Text>
              </View>
              <Text style={styles.statValue}>${totalRewards.toFixed(2)}</Text>
            </View>
          </View>

          {/* Referred Users List */}
          <View style={styles.referredUsersSection}>
            <Text style={styles.referredUsersTitle}>People You Referred:</Text>
            {loadingReferrals ? (
              <View style={styles.loadingReferrals}>
                <ActivityIndicator size="small" color="#1A4D00" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : referralsError ? (
              <Text style={styles.errorText}>{referralsError}</Text>
            ) : referredUsers.length === 0 ? (
              <Text style={styles.noReferralsText}>
                No one has used your referral code yet.
              </Text>
            ) : (
              <FlatList
                data={referredUsers}
                renderItem={renderReferredUser}
                keyExtractor={(item, index) => item.id?.toString() || item.email || index.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Bold',
    color: '#1f2937',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',

    paddingHorizontal: 20,
    fontFamily: 'AlbertSans-Medium',
  },
  referralCodeSection: {
    backgroundColor: Color.inputbg,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#1f2937',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  codeInput: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    textAlign: 'center',
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'AlbertSans-Medium',
  },
  copyButton: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  copyButtonText: {
    color: 'white',
    fontFamily: 'AlbertSans-Medium',
  },
  shareContainer: {
    marginTop: 10,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: Color.inputbg,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  stepsList: {
    gap: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Color.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular',
  },

  statsList: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor:Color.inputbg,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  statIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'AlbertSans-Medium',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  referredUsersSection: {
    marginTop: 20,
  },
  referredUsersTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#1f2937',
    marginBottom: 10,
  },
  loadingReferrals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
  },
  noReferralsText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});

export default InviteScreen;