import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SummaryPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book service</Text>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <Image
                source={{uri:  ""}}
                style={styles.thumbnail}
              />
              <View style={styles.summaryContent}>
                <Text style={styles.serviceName}>Dog Walking</Text>
                <Text style={styles.serviceDescription}>
                  I want you to walk my dog for a few hours, he's a German Shepard and likes treats.
                </Text>
                <Text style={styles.dateTime}>23 Sept, 2022 - 12:39 AM</Text>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service charge</Text>
              <Text style={styles.price}>£2,300</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service charge</Text>
              <Text style={styles.price}>£400</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>£2,700</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            
            {/* Credit Card Option */}
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'card' && styles.radioOuterSelected
                ]}>
                  {paymentMethod === 'card' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentLabel}>Debit/Credit Card</Text>
              </View>
              <View style={styles.cardInfo}>
                <Image
                  source={{uri: ""}}
                  style={styles.cardIcon}
                />
                <Text style={styles.cardNumber}>**** **** **** 4002</Text>
                <Text style={styles.cardExpiry}>Expire on 20/2023</Text>
              </View>
            </TouchableOpacity>

            {/* Barter Service Option */}
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'barter' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('barter')}
            >
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'barter' && styles.radioOuterSelected
                ]}>
                  {paymentMethod === 'barter' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentLabel}>Barter service</Text>
              </View>
              <Text style={styles.barterText}>Select a service</Text>
              <Text style={styles.barterSubtext}>Exchange your skills & services for payment</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
    marginBottom: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  summaryContent: {
    flex: 1,
  },
  serviceName: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  serviceDescription: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateTime: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceLabel: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
  },
  price: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  totalLabel: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  totalPrice: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedPayment: {
    borderColor: '#90EE90',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#90EE90',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#90EE90',
  },
  paymentLabel: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    width: 24,
    height: 24,
  },
  cardNumber: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
  },
  cardExpiry: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  barterText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  barterSubtext: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#90EE90',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
    color: '#000',
  },
});

export default SummaryPage;