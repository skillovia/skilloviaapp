import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { Color } from '../../Utils/Theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BookCard = ({
  id,
  title,
  description,
  date,
  status,
  location,
  fileUrl,
  thumbnails,
  type,
  onViewProgress,
  showViewProgress = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      
      // Format to readable date
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString; // Return original string if error
    }
  };

  // Function to get all available images
  const getAllImages = () => {
    if (thumbnails && thumbnails.length > 0) {
      return thumbnails;
    }
    return fileUrl ? [fileUrl] : [];
  };

  const images = getAllImages();
  const primaryImage = images[0];
  const hasMultipleImages = images.length > 1;

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.cardContent} activeOpacity={0.8}>
          <View style={styles.imageContainer}>
            {primaryImage && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: primaryImage }}
                  style={styles.primaryImage}
                  resizeMode="cover"
                />

                {hasMultipleImages && (
                  <TouchableOpacity
                    onPress={openModal}
                    style={styles.imageOverlay}
                    activeOpacity={0.7}
                  >
                    <View style={styles.overlayContent}>
                      <Text style={styles.overlayCountText}>
                        +{images.length - 1}
                      </Text>
                      <Text style={styles.overlayText}>View more</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
            <Text style={styles.date} numberOfLines={1}>
              {formatDate(date)}
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  status === 'accepted'
                    ? styles.acceptedBadge
                    : status === 'completed'
                    ? styles.completedBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    status === 'accepted'
                      ? styles.acceptedText
                      : status === 'completed'
                      ? styles.completedText
                      : styles.pendingText,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* View Progress Button */}
        {showViewProgress && onViewProgress && (
          <TouchableOpacity 
            style={styles.viewProgressButton}
            onPress={onViewProgress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewProgressText}>View Progress</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Gallery Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close button */}
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Icon name="x" size={24} color="white" />
            </TouchableOpacity>

            {/* Main image */}
            <View style={styles.mainImageContainer}>
              <Image
                source={{ uri: images[currentImageIndex] }}
                style={styles.modalImage}
                resizeMode="contain"
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <TouchableOpacity
                    onPress={prevImage}
                    style={[styles.navButton, styles.leftNavButton]}
                    activeOpacity={0.7}
                  >
                    <Icon name="chevron-left" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={nextImage}
                    style={[styles.navButton, styles.rightNavButton]}
                    activeOpacity={0.7}
                  >
                    <Icon name="chevron-right" size={24} color="white" />
                  </TouchableOpacity>
                </>
              )}

              {/* Image counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.counterText}>
                  {currentImageIndex + 1} of {images.length}
                </Text>
              </View>
            </View>

            {/* Thumbnail navigation */}
            {images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailContainer}
              >
                {images.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => goToImage(index)}
                    style={[
                      styles.thumbnailButton,
                      index === currentImageIndex && styles.activeThumbnail,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: Color.gray,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
  },
  imageContainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  primaryImage: {
    width: 112,
    height: 112,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayCountText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'AlbertSans-Bold',
    color: '#1a1a1a',
    fontSize: 16,
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'AlbertSans-Medium',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'AlbertSans-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedBadge: {
    backgroundColor: '#dcfce7',
  },
  completedBadge: {
    backgroundColor: '#dbeafe',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
  },
  acceptedText: {
    color: '#166534',
  },
  completedText: {
    color: '#1e40af',
  },
  pendingText: {
    color: '#92400e',
  },
  viewProgressButton: {
    backgroundColor: Color.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProgressText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.9,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageContainer: {
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: screenHeight * 0.7,
    borderRadius: 8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -20 }],
  },
  leftNavButton: {
    left: 16,
  },
  rightNavButton: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  thumbnailButton: {
    opacity: 0.7,
  },
  activeThumbnail: {
    opacity: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
  },
  thumbnailImage: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
});

export default BookCard;