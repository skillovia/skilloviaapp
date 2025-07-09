import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import BookingCard from '../BookingCard';
import { Color } from '../../../Utils/Theme';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const ServiceCompleted = ({navigation}) => {
  return (
    <>
      {/* Add StatusBar */}
      <StatusBar backgroundColor={Color.secondary} barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="black" /> {/* Back icon */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.clientInfo}>
            <Image
              source={{
                uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1734134228/Group_139_nz3cn4.png',
              }}
              style={styles.avatar}
            />
            <Text style={styles.clientName}>Abdulmalik Qasim</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.messageButton}>
                <Icon name="chat" size={20} color="#1A4D00" /> {/* Chat icon */}
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="phone" size={20} color="#1A4D00" /> {/* Call icon */}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Service</Text>
          <BookingCard />
        </View>

        <View style={styles.locationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLocation}>Location</Text>
            <Text style={styles.address}>3329 Joyce St</Text>
          </View>
          <View style={styles.mapContainer}>
            <Image
              source={{
                uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1734132538/2d23fb5a6f037ce8ec173ec3ebe08557_igbxvq.png',
              }}
              style={styles.mapImage}
            />
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Message</Text>
          <Text style={styles.messageDescription}>
            This is a booking description for this particular card. You can
            click on this card to...
          </Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <View style={styles.idContainer}>
              <Text style={styles.detailValue}>485748564495794579</Text>
              <TouchableOpacity>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment method</Text>
            <Text style={styles.detailValue}>Credit/Debit Card</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>£10,000</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Service Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Open dispute</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};






const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 15,
    paddingTop: 20,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  
    paddingTop: 40
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
  },
  shareButtonText: {
    color: '#4CAF50',
    fontFamily: 'AlbertSans-Medium',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    marginVertical:10
    // paddingTop: 40
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    marginBottom: 8,
  },

  sectionLocation: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
 
  },

  address: {
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
  },
  
  clientSection: {
    paddingVertical: 16,
  },

  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clientName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
  },




  
  detailLabel: {
    fontFamily: 'AlbertSans-Regular',
  },
  detailValue: {
    fontFamily: 'AlbertSans-Medium',
  },
  copyText: {
    color: '#4CAF50',
    fontFamily: 'AlbertSans-Medium',
  },
  confirmButtonText: {
    color: Color.secondary,
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  rejectButtonText: {
      color: "#410002",
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  disputeButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  waitingButtonText: {
    color: '#757575',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  // Keep all the other styles same as before
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    backgroundColor: Color.primary,
    padding: 8,
    borderRadius: 20,
},
callButton: {
      backgroundColor: Color.primary,
  
    padding: 8,
    borderRadius: 20,
  },



  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  detailsSection: {
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },



  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionContainer: {

    gap: 12,
  },
  confirmButton: {
    backgroundColor: Color.primary,
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
 
},
rejectButton: {
    backgroundColor: '#FFE4E1',
    padding: 16,
    marginBottom:30,
    borderRadius: 50,
   
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageCard: {
   
  
    marginBottom: 10,
    paddingVertical: 10,
   
  },


  messageTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
   
    marginBottom: 4,
  },
  messageDescription: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666',
  },




  waitingButton: {
    backgroundColor: '#E0E0E0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default ServiceCompleted;