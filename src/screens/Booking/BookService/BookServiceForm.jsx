import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Color } from '../../../Utils/Theme';


const { width: screenWidth } = Dimensions.get('window');

const BookService = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, skill } = route.params || {};

  const [loading, setLoading] = useState(false);

  // Check if required data is available
  if (!user || !skill) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No service details available.</Text>
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

  // Extract skill_id
  const skill_id = skill.skill_id || skill.id;
  console.log('Skill ID:', skill_id);

  // Extract thumbnail URLs
  const thumbnails = skill
    ? [
        skill.thumbnail01,
        skill.thumbnail02,
        skill.thumbnail03,
        skill.thumbnail04,
      ].filter(Boolean)
    : [];

  // Handle booking click
  const handleBookClick = () => {
    setLoading(true);
    
  
    navigation.navigate('bookingform', {
      user,
      skill,
      skillId: skill_id,
    });
    

    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
        <Text style={styles.headerTitle}>{skill.skill_type}</Text>
        <TouchableOpacity
          style={[
            styles.bookHeaderButton,
            loading && styles.bookHeaderButtonDisabled,
          ]}
          onPress={handleBookClick}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#92400E" />
          ) : (
            <Text style={styles.bookHeaderButtonText}>Book</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallerySection}>
          <Text style={styles.sectionTitle}>Service Images</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
            contentContainerStyle={styles.imageGalleryContent}
          >
            {thumbnails.length > 0 ? (
              thumbnails.map((thumbnail, index) => (
                <Image
                  key={index}
                  source={{ uri: thumbnail }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              // Fallback image if no thumbnails are available
              <Image
                source={{
                  uri: 'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg',
                }}
                style={styles.serviceImage}
                resizeMode="cover"
              />
            )}
          </ScrollView>
        </View>

        {/* Service Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Description</Text>
          <Text style={styles.descriptionText}>{skill.description}</Text>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Experience Level:</Text>
            <Text style={styles.detailValue}>{skill.experience_level}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hourly Rate:</Text>
            <Text style={styles.detailValue}>
              £{skill.hourly_rate} - {skill.spark_token} Spark Token
            </Text>
          </View>
        </View>

        {/* Service Provider Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Provider</Text>
          <View style={styles.providerInfo}>
            <Image
              source={{
                uri: user.photourl ||
                  'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
              }}
              style={styles.providerImage}
              resizeMode="cover"
            />
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>
                {user.firstname} {user.lastname}
              </Text>
              <Text style={styles.providerEmail}>{user.email}</Text>
              {user.bio && <Text style={styles.providerBio}>{user.bio}</Text>}
            </View>
          </View>
        </View>

        {/* Book Button at Bottom */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
            style={[
              styles.bookButton,
              loading && styles.bookButtonDisabled,
            ]}
            onPress={handleBookClick}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#92400E" />
                <Text style={styles.bookButtonText}>Booking...</Text>
              </View>
            ) : (
              <Text style={styles.bookButtonText}>Book This Service</Text>
            )}
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookHeaderButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookHeaderButtonText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'AlbertSans-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 12,
  },
  imageGallerySection: {
    paddingVertical: 16,
  },
  imageGallery: {
    marginTop: 8,
  },
  imageGalleryContent: {
    paddingRight: 16,
  },
  serviceImage: {
    width: screenWidth * 0.7,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'AlbertSans-Medium',
    flex: 1,
    textAlign: 'right',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  providerEmail: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
    marginBottom: 4,
  },
  providerBio: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular',
    lineHeight: 16,
  },
  bookButtonContainer: {
    paddingVertical: 24,
    paddingBottom: 32,
  },
  bookButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookButtonText: {
    fontSize: 16,
    color: '#92400E',
    fontFamily: 'AlbertSans-Bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default BookService;