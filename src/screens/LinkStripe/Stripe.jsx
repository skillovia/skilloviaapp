import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/Feather'; // Make sure to install and link react-native-vector-icons
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const StripeOnboarding = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [step, setStep] = useState('initial'); // initial, account-created, onboarding-ready, completed

  // Create Stripe account
  const createStripeAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('You must be logged in to set up payment processing.');
      }

      const response = await apiClient.post('/users/stripe/create/connected/account');

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to create Stripe account');
      }

      setStripeAccount(response.data.data);
      setStep('account-created');

      // Automatically proceed to get onboarding link
      await getOnboardingLink(response.data.data.stripe_account_id);
    } catch (err) {
      console.error('Error creating Stripe account:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create Stripe account');
    } finally {
      setLoading(false);
    }
  };

  // Get onboarding link using the stripe account ID
  const getOnboardingLink = async (stripeAccountId) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('You must be logged in to continue onboarding.');
      }

      const response = await apiClient.post('/users/stripe/connected/account/link', {
        stripeAccountId,
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to get onboarding link');
      }

      setOnboardingUrl(response.data.data.url);
      setStep('onboarding-ready');
    } catch (err) {
      console.error('Error getting onboarding link:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get onboarding link');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setStep('initial');
    setStripeAccount(null);
    setOnboardingUrl(null);
  };

  const redirectToOnboarding = async () => {
    if (onboardingUrl) {
      try {
        const supported = await Linking.canOpenURL(onboardingUrl);
        if (supported) {
          await Linking.openURL(onboardingUrl);
        } else {
          Alert.alert('Error', 'Cannot open the onboarding URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open onboarding link');
      }
    }
  };

  const openTermsOfService = () => {
    Linking.openURL('https://stripe.com/tos');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://stripe.com/privacy');
  };

  const navigateToSupport = () => {
    navigation.navigate('Support'); // Adjust route name as needed
  };

  const renderInitialStep = () => (
    <>
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Benefits of connecting:</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Icon name="check" size={16} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.benefitText}>
              Receive payments directly to your bank account
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="check" size={16} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.benefitText}>Secure payment processing</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="check" size={16} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.benefitText}>Detailed transaction reporting</Text>
          </View>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By connecting, you agree to Stripe's{' '}
          <Text style={styles.linkText} onPress={openTermsOfService}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.linkText} onPress={openPrivacyPolicy}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={createStripeAccount}
        disabled={loading}
      >
        <Icon name="dollar-sign" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Set Up Payment Processing</Text>
      </TouchableOpacity>
    </>
  );

  const renderLoadingStep = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1A4D00" />
      <Text style={styles.loadingText}>
        {step === 'initial'
          ? 'Creating your Stripe account...'
          : step === 'account-created'
          ? 'Generating onboarding link...'
          : 'Processing...'}
      </Text>
    </View>
  );

  const renderOnboardingReadyStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Icon name="check" size={32} color="#10B981" />
      </View>

      <Text style={styles.successTitle}>Account Created Successfully!</Text>
      <Text style={styles.successDescription}>
        Your Stripe account has been created. Now you need to complete the onboarding process.
      </Text>

      {stripeAccount && (
        <View style={styles.accountDetailsContainer}>
          <Text style={styles.accountDetailsTitle}>Account Details:</Text>
          <Text style={styles.accountDetailItem}>
            <Text style={styles.accountDetailLabel}>Account ID:</Text>{' '}
            {stripeAccount.stripe_account_id}
          </Text>
        
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                Charges: {stripeAccount.charges_enabled ? 'Enabled' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                Payouts: {stripeAccount.payouts_enabled ? 'Enabled' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                Details: {stripeAccount.details_submitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={redirectToOnboarding}
      >
        <Icon name="external-link" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Complete Stripe Onboarding</Text>
      </TouchableOpacity>

      <Text style={styles.redirectNote}>
        You'll be redirected to Stripe to complete your account setup.
      </Text>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Icon name="x" size={32} color="#EF4444" />
      </View>

      <Text style={styles.errorTitle}>Something Went Wrong</Text>
      <Text style={styles.errorDescription}>{error}</Text>

      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleTryAgain}
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={navigateToSupport}
        >
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Payment Processing Setup</Text>
          <Text style={styles.headerSubtitle}>
            Connect with Stripe to receive payments on our platform
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <View style={styles.cardHeaderLeft}>
                <Icon name="credit-card" size={24} color="#FFFFFF" />
                <Text style={styles.cardHeaderTitle}>Skillovia</Text>
              </View>
              <View style={styles.secureBadge}>
                <Text style={styles.secureBadgeText}>Secure</Text>
              </View>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {!loading && step === 'initial' && !error && renderInitialStep()}
            {loading && renderLoadingStep()}
            {step === 'onboarding-ready' && onboardingUrl && !loading && renderOnboardingReadyStep()}
            {error && renderErrorStep()}
          </View>
        </View>

        {/* Support Footer */}
        <View style={styles.supportFooter}>
          <Text style={styles.supportFooterText}>
            Need help?{' '}
            <Text style={styles.supportLink} onPress={navigateToSupport}>
              Contact Support
            </Text>
          </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  card: {
    backgroundColor: Color.inputbg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',

  },
  cardHeader: {
    backgroundColor: '#1A4D00', // secondary color
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secureBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  secureBadgeText: {
    color: '#1A4D00',
    fontSize: 12,
    fontFamily: 'AlbertSans-Bold',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
  },
  termsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
  },
  linkText: {
    color: '#1A4D00',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A4D00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    backgroundColor: '#D1FAE5',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'AlbertSans-Regular',
  },
  accountDetailsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
  },
  accountDetailsTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  accountDetailItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  accountDetailLabel: {
    fontFamily: 'AlbertSans-Bold',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'AlbertSans-Regular',
  },
  redirectNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'AlbertSans-Regular',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorIcon: {
    backgroundColor: '#FEE2E2',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  supportFooter: {
    alignItems: 'center',
    marginTop: 32,
  },
  supportFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  supportLink: {
    color: '#1A4D00',
  },
});

export default StripeOnboarding;