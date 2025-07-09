import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Color } from '../../Utils/Theme';

export const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#1A4D00" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Skillovia – Terms and Conditions</Text>
          <Text style={styles.effectiveDate}>Effective Date: [Insert Date]</Text>
          
          <Text style={styles.paragraph}>
            Welcome to Skillovia ("we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of the Skillovia platform (the "Service"), available via our web app and (soon) mobile apps.
          </Text>

          <Text style={styles.sectionTitle}>1. Use of the Platform</Text>
          <Text style={styles.paragraph}>
            You must be 18 years or older to use Skillovia. By accessing our platform, you agree to use the services lawfully and responsibly.
          </Text>

          <Text style={styles.sectionTitle}>2. Services Offered</Text>
          <Text style={styles.paragraph}>
            Skillovia enables users to exchange skills and services through barter (Spark tokens) or hybrid payments (cash + tokens). All service listings and transactions are user-generated.
          </Text>

          <Text style={styles.sectionTitle}>3. Payments and Spark Tokens</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                <Text style={styles.bold}>Spark tokens:</Text> Awarded or purchased to facilitate trades.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                <Text style={styles.bold}>Cash payments:</Text> Processed securely via Stripe during booking.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            You are charged at the time of checkout for paid services. Skillovia does not guarantee the quality of any services exchanged.
          </Text>

          <Text style={styles.sectionTitle}>4. Disputes and Refund Policy</Text>
          <Text style={styles.paragraph}>
            If a service is unsatisfactory, please contact our support team within 5 days. Refunds for cash payments are handled on a case-by-case basis. Spark tokens are non-refundable unless due to platform error.
          </Text>

          <Text style={styles.sectionTitle}>5. Cancellation Policy</Text>
          <Text style={styles.paragraph}>
            Users can cancel bookings up to 24 hours in advance for a full refund. Late cancellations may be subject to partial or no refunds.
          </Text>

          <Text style={styles.sectionTitle}>6. Prohibited Conduct</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Misrepresent skills or reviews.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Engage in illegal, fraudulent, or abusive activity.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Circumvent payments outside the platform.</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate access if these Terms are violated.
          </Text>

          <Text style={styles.sectionTitle}>8. Liability</Text>
          <Text style={styles.paragraph}>
            Skillovia is a facilitator and is not responsible for the services provided by users. You use the platform at your own risk.
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
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',

  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1A4D00',
    fontFamily: 'AlbertSans-Medium',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AlbertSans-Medium',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  effectiveDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
  paragraph: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#1f2937',
    marginTop: 10,
    marginBottom: 15,
  },
  listContainer: {
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 20,
  },
  bullet: {
    fontSize: 16,
    color: '#1f2937',
    marginRight: 10,
    fontFamily: 'AlbertSans-Medium',
  },
  listText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    flex: 1,
    fontFamily: 'AlbertSans-Regular',
  },
  bold: {
    fontFamily: 'AlbertSans-Bold',
  },
  contactContainer: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  emailLink: {
    color: '#1A4D00',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default TermsAndConditionsScreen;