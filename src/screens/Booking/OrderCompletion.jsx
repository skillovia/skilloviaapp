import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; 
import { Color } from '../../Utils/Theme';

const { height } = Dimensions.get('window');

const OrderCompletionSheet = ({ visible, onClose }) => {
  const navigation = useNavigation(); 

  const handleReviewPress = () => {
    onClose(); // Close the modal
    navigation.navigate('review'); 
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sheetContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Success Icon Circle */}
            <View style={styles.iconCircle}>
              <View style={styles.personContainer}>
                <View style={styles.person}>
                  <View style={styles.personBody} />
                  <View style={styles.personHead} />
                </View>
              </View>
              <View style={styles.checkmarkContainer}>
                <Icon name="check" size={20} color="#fff" />
              </View>
            </View>

            <Text style={styles.title}>Your order has been completed!</Text>
            <Text style={styles.description}>
              Congratulations, please give the seller a review to help others find them better.
            </Text>

            <TouchableOpacity style={styles.reviewButton} onPress={handleReviewPress}>
              <Text style={styles.reviewButtonText}>Write a review</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={onClose}>
              <Text style={styles.homeButtonText}>Go home</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Handle Bar */}
          <View style={styles.handleBar} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Color.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: height * 0.5,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  personContainer: {
    alignItems: 'center',
  },
  person: {
    alignItems: 'center',
  },
  personBody: {
    width: 20,
    height: 30,
    backgroundColor: '#A0A0A0',
    borderRadius: 10,
  },
  personHead: {
    width: 24,
    height: 24,
    backgroundColor: '#A0A0A0',
    borderRadius: 12,
    marginBottom: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'AlbertSans-Regular',
    paddingHorizontal: 20,
  },
  reviewButton: {
    backgroundColor: Color.primary,
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 12,
  },
  reviewButtonText: {
    color: Color.secondary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Bold',
  },
  homeButton: {
    paddingVertical: 16,
    width: '100%',
  },
  homeButtonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 12,
  },
});

export default OrderCompletionSheet;
