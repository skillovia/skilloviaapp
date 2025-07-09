import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { Color } from '../../Utils/Theme';

const windowWidth = Dimensions.get('window').width;

const CommunityScreen = ({navigation}) => {
  const [showModal, setShowModal] = useState(false);

  const features = [
    {
      id: 1,
      title: 'Connect with people',
      description: 'Follow your neighbors and see what theyre up to',
      icon: '👥'
    },
    {
      id: 2,
      title: 'Share skills',
      description: 'Share your unique skills with your community',
      icon: '💡'
    },
    {
      id: 3,
      title: 'Volunteer for Local Events',
      description: 'Participate in community events, clean-up activities, or fundraisers to support local initiatives',
      icon: '❤️'
    }
  ];

  const handleCheckItOut = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.imageGrid}>
            {/* First row */}
            <View style={styles.row}>
              <Image
                source={{ uri: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735602469/Frame_1000003971_mu3jrs.png" }}
                style={[styles.gridImage, styles.largeImage]}
              />
              <Image
                source={{ uri: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735602471/Frame_1000003970_e9fd3s.png" }}
                style={[styles.gridImage, styles.smallImage]}
              />
            </View>
            {/* Second row */}
            <View style={styles.row}>
              <Image
                source={{ uri: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735602460/Frame_1000003970_1_kuvqtl.png" }}
                style={[styles.gridImage, styles.smallImage]}
              />
              <Image
              source={{ uri: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735602468/Frame_1000003971_1_qpw9pt.png" }}
                style={[styles.gridImage, styles.largeImage]}
              />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Welcome to Community</Text>
            <Text style={styles.subtitle}>
              Building connections, sharing knowledge, and fostering a sense of belonging within your neighborhood.
            </Text>

            {features.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={handleCheckItOut} style={styles.button}>
              <Text style={styles.buttonText}>Check it out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Coming Soon Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalIcon}>🚀</Text>
              <Text style={styles.modalTitle}>Coming Soon!</Text>
              <Text style={styles.modalDescription}>
                We're working hard to bring you an amazing community experience. Stay tuned for updates!
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  imageGrid: {
    width: windowWidth,
    height: windowWidth * 0.8,  // Adjusted for better proportions
  },
  row: {
    flexDirection: 'row',
    height: '50%',
  },
  gridImage: {
    height: '100%',
    resizeMode: 'cover',
  },
  largeImage: {
    flex: 0.65,  // Takes up 65% of the row width
  },
  smallImage: {
    flex: 0.35,  // Takes up 35% of the row width
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 24,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
    lineHeight: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    backgroundColor: Color.primary,
    padding: 6,
    borderRadius: 5,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'AlbertSans-SemiBold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  featureDescription: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: Color.primary,
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: 'AlbertSans-SemiBold',
    color: Color.secondary,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 300,
  },
  modalIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 24,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Color.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'AlbertSans-SemiBold',
    color: Color.secondary,
    fontSize: 16,
  },
});

export default CommunityScreen;