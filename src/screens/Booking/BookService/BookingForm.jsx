import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,

} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';

import apiClient from '../../../Hooks/Api';

import { Color } from '../../../Utils/Theme';



const BookingForm = () => {
  const GOOGLE_PLACES_API_KEY = 'AIzaSyChFAjrSODzkkKl_TaCCslNXdHwIWR-_uw';
  const navigation = useNavigation();
  const route = useRoute();
  const { user, skill, skillId } = route.params || {};

  const [formData, setFormData] = useState({
    description: '',
    location: '',
    date: new Date(),
    thumbnails: [],
    lon: null,
    lat: null,
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [balanceData, setBalanceData] = useState({
    cash: 0,
    tokens: 0,
    currency: 'GBP',
  });
  const [balanceLoading, setBalanceLoading] = useState(false);



  if (!user || !skill) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking information not available.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const calculatePrice = () => {
    return skill?.hourly_rate ? skill.hourly_rate : 9;
  };

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await apiClient.get('/wallet/balance');
      setBalanceData({
        cash: response.data.balance,
        tokens: response.data.spark_tokens,
        currency: response.data.currency || 'GBP',
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      Alert.alert('Error', 'Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (showPaymentModal) {
      fetchBalance();
    }
  }, [showPaymentModal]);



  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' ? { lon: null, lat: null } : {}),
    }));
  };

  const handleImageUpload = () => {
    if (formData.thumbnails.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 images allowed.');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 4 - formData.thumbnails.length,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));

        const updatedThumbnails = [...formData.thumbnails, ...newImages].slice(0, 4);
        setFormData(prev => ({
          ...prev,
          thumbnails: updatedThumbnails,
        }));
        setImagePreview(updatedThumbnails.map(img => img.uri));
      }
    });
  };

  const handleRemoveImage = (index) => {
    const newThumbnails = formData.thumbnails.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      thumbnails: newThumbnails,
    }));
    setImagePreview(newThumbnails.map(img => img.uri));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData(prev => ({
      ...prev,
      date: currentDate,
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location.');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Validation Error', 'Please select a date.');
      return false;
    }
    return true;
  };

  const handleBookNowClick = () => {
    if (!validateForm()) return;
    setShowPaymentModal(true);
  };

  const handlePaymentChoice = (method) => {
    const normalizedPaymentMethod = method === 'account' ? 'wallet' : 
                                   method === 'sparktoken' ? 'spark_token' : method;
    
    setPaymentMethod(normalizedPaymentMethod);
    setShowPaymentModal(false);

    if (normalizedPaymentMethod === 'wallet') {
      handleWalletPayment();
    } else if (normalizedPaymentMethod === 'spark_token') {
      handleSparkTokenPayment();
    }
  };

  const handleWalletPayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/users/stripe/payment/intent', {
        amount: calculatePrice(),
        currency: 'gbp',
        paymentMethod: 'wallet',
      });

      if (response.data) {
        Alert.alert('Success', 'Wallet payment successful!');
        handleBookingSubmit();
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      Alert.alert('Payment Error', error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSparkTokenPayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/users/stripe/payment/intent', {
        amount: calculatePrice(),
        currency: 'gbp',
        paymentMethod: 'spark_token',
      });

      if (response.data) {
        Alert.alert('Success', 'SparkToken payment successful!');
        handleBookingSubmit();
      }
    } catch (error) {
      console.error('SparkToken payment error:', error);
      Alert.alert('Payment Error', error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (paymentIntentId) => {
    setLoading(true);
    try {
      const bookingData = new FormData();
      bookingData.append('skills_id', skill.skill_id || skillId);
      bookingData.append('booked_user_id', user.id);
      bookingData.append('title', `Booking for ${skill.skill_type}`);
      bookingData.append('description', formData.description);
      bookingData.append('booking_location', formData.location);
      bookingData.append('booking_lon', formData.lon);
      bookingData.append('booking_lat', formData.lat);
      bookingData.append('booking_date', formData.date.toISOString().split('T')[0]);
      bookingData.append('payment_intent_id', paymentIntentId || '');
      bookingData.append('payment_method', paymentMethod);

      formData.thumbnails.forEach((file) => {
        bookingData.append('thumbnails', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });

      const response = await apiClient.post('/bookings', bookingData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          description: '',
          location: '',
          date: new Date(),
          thumbnails: [],
          lon: null,
          lat: null,
        });
        setImagePreview([]);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Booking Error', error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigation.navigate('Bookings'); 
  };

  const formatCurrency = (amount, currency = 'GBP') => {
    const currencySymbols = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
        <TouchableOpacity
          style={[styles.bookHeaderButton, loading && styles.bookHeaderButtonDisabled]}
          onPress={handleBookNowClick}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#92400E" />
          ) : (
            <Text style={styles.bookHeaderButtonText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skill Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Skill</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={skill.skill_type}
            editable={false}
          />
        </View>

        {/* Description Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder={`Describe what you need for ${skill.skill_type}...`}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location Field */}
        <View style={styles.section}>
  <Text style={styles.label}>Location</Text>
  <GooglePlacesAutocomplete
    placeholder="Enter location..."
    minLength={2}
    fetchDetails={true}
    onPress={(data, details = null) => {
      const { lat, lng } = details.geometry.location;
      setFormData(prev => ({
        ...prev,
        location: data.description,
        lon: lng,
        lat: lat,
      }));
    }}
    query={{
      key: GOOGLE_PLACES_API_KEY,
      language: 'en',
    }}
    styles={{
      textInput: styles.input,
      container: { flex: 0 },
      listView: { backgroundColor: '#fff' },
    }}
    enablePoweredByContainer={false}
    debounce={200}
  />
  {formData.lon && formData.lat && (
    <Text style={styles.coordinatesText}>
      Coordinates: {formData.lon.toFixed(6)}, {formData.lat.toFixed(6)}
    </Text>
  )}
</View>

        {/* Date Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.date.toLocaleDateString()}
            </Text>
            <Icon name="calendar" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Upload Images (max 4)</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
            disabled={formData.thumbnails.length >= 4}
          >
            <Icon name="upload" size={24} color="#6B7280" />
            <Text style={styles.uploadButtonText}>
              {formData.thumbnails.length > 0
                ? `${formData.thumbnails.length} image(s) selected`
                : 'Click to upload up to 4 images'}
            </Text>
            <Text style={styles.uploadSubText}>SVG, PNG, or JPG</Text>
          </TouchableOpacity>

          {imagePreview.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {imagePreview.map((uri, index) => (
                <View key={index} style={styles.imagePreviewItem}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Icon name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={formData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Payment Choice Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {balanceLoading ? (
              <View style={styles.balanceLoading}>
                <ActivityIndicator size="large" color="#10B981" />
              </View>
            ) : (
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceTitle}>Your Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Cash:</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrency(balanceData.cash, balanceData.currency)}
                  </Text>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>SparkTokens:</Text>
                  <Text style={styles.balanceValue}>
                    {balanceData.tokens} Tokens
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  parseFloat(balanceData.cash) < calculatePrice() && styles.paymentOptionDisabled
                ]}
                onPress={() => handlePaymentChoice('account')}
                disabled={parseFloat(balanceData.cash) < calculatePrice()}
              >
                <Icon name="credit-card" size={24} color="#3B82F6" />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Pay with Account</Text>
                  <Text style={styles.paymentOptionSubtitle}>Use your wallet balance</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  balanceData.tokens < skill.spark_token && styles.paymentOptionDisabled
                ]}
                onPress={() => handlePaymentChoice('sparktoken')}
                disabled={balanceData.tokens < skill.spark_token}
              >
                <Icon name="zap" size={24} color="#8B5CF6" />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Pay with SparkToken</Text>
                  <Text style={styles.paymentOptionSubtitle}>Use your available SparkTokens</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.fundButton}>
              <Text style={styles.fundButtonText}>Fund Account</Text>
            </TouchableOpacity>

            {parseFloat(balanceData.cash) < calculatePrice() &&
              balanceData.tokens < skill.spark_token && (
                <View style={styles.insufficientFunds}>
                  <Text style={styles.insufficientFundsText}>
                    Insufficient funds. Please top up your wallet or tokens.
                  </Text>
                </View>
              )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Icon name="check-circle" size={64} color="#1A4D00" />
            <Text style={styles.successTitle}>Booking Successful!</Text>
            <Text style={styles.successMessage}>
              Your booking for {skill.skill_type} has been confirmed.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 26,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'AlbertSans-Regular',
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6FCEB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  bookHeaderButton: {
    backgroundColor: Color.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookHeaderButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookHeaderButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'AlbertSans-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    backgroundColor: Color.inputbg,
  },
  disabledInput: {
    backgroundColor: Color.inputbg,
    color: '#6B7280',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',

  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'AlbertSans-Regular',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  backgroundColor: Color.inputbg,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#374151',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: Color.inputbg,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontFamily: 'AlbertSans-Regular',
  },
  uploadSubText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'AlbertSans-Regular',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  imagePreviewItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Color.background,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  balanceLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  balanceContainer: {
    backgroundColor: Color.inputbg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,

  },
  balanceTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#6B7280',
  },
  balanceValue: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    color: '#374151',
  },
  paymentOptions: {
    gap: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: Color.inputbg,
  },
  paymentOptionDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Regular',
    color: '#6B7280',
  },
  fundButton: {
    backgroundColor: Color.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  fundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
  insufficientFunds: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  insufficientFundsText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: 'AlbertSans-Regular',
    textAlign: 'center',
  },
  successModalContent: {
    backgroundColor: Color.background,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#374151',
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: Color.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },
});

export default BookingForm;