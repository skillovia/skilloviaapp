import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Color } from '../../Utils/Theme';
import Icon from 'react-native-vector-icons/Ionicons';

const VerifyEmailModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {/* Email Icon */}
            <Image
              source={{
                uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732151638/Artwork_ek9843.png',
              }}
              style={styles.image}
            />

            {/* Title and Text */}
            <Text style={styles.title}>Verify email</Text>
            <Text style={styles.subtitle}>We need to verify your email</Text>
            <Text style={styles.emailText}>user@gmail.com</Text>
            <Text style={styles.infoText}>
              Check your email and click the link to activate your account
            </Text>
          </View>

          {/* Bottom Button Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
  },
  modalContent: {
    backgroundColor: '#F6FCEB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: 500,
    justifyContent: 'space-between',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 15,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginVertical: 10,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#F6FCEB',
  },
  verifyButton: {
    backgroundColor: Color.primary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: Color.secondary,
  },
});

export default VerifyEmailModal;