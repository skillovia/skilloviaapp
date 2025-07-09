import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Color } from '../../Utils/Theme';

export const PrivacyPolicyScreen = ({ navigation }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@skillovia.com');
  };

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
          <Text style={styles.title}>Skillovia – Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Effective Date: [Insert Date]</Text>
          
          <Text style={styles.paragraph}>
            Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your data.
          </Text>

          <Text style={styles.sectionTitle}>1. Data We Collect</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                <Text style={styles.bold}>Personal Data:</Text> Name, email, address, phone number.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                <Text style={styles.bold}>Service Data:</Text> Skills, transactions, profile activity.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                <Text style={styles.bold}>Payment Info:</Text> Processed securely via Stripe, we do not store card details.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>To provide and personalise services.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>To process payments and issue Spark tokens.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>To improve platform performance.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>To prevent fraud and enforce platform policies.</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>3. Sharing Your Data</Text>
          <Text style={styles.paragraph}>We do not sell your data. We only share with:</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Stripe (for payments)</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Analytics and hosting providers (only as needed)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>4. Cookies</Text>
          <Text style={styles.paragraph}>
            We use cookies for site performance and analytics. You may disable them in browser settings.
          </Text>

          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Request access to your data.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Request corrections or deletions.</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Opt out of marketing communications.</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>6. Security</Text>
          <Text style={styles.paragraph}>
            We use secure protocols (HTTPS, encryption) to protect your data.
          </Text>

          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Text style={styles.bold}>Email: </Text>
              <TouchableOpacity onPress={handleEmailPress}>
                <Text style={styles.emailLink}>support@skillovia.com</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.bold}>Address: </Text>
              <Text style={styles.paragraph}>[Insert registered address]</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.bold}>Phone: </Text>
              <Text style={styles.paragraph}>[Insert contact number]</Text>
            </View>
          </View>
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

export default PrivacyPolicyScreen;