import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const KYCList = ({ navigation }) => {
  const options = [
    {
      id: '1',
      title: 'Email',
      description: 'Verify your email to get started',
      icon: 'mail-outline',
      status: 'checkmark-circle',
      color: '#4CAF50',
      screen: 'EmailVerification', // Separate screen for email verification
    },
    {
      id: '2',
      title: 'Identification',
      description: 'A valid legal document to identify you',
      icon: 'card-outline',
      status: 'arrow-forward-circle',
      color: '#9E9E9E',
      screen: 'id', // Separate screen for ID upload
    },
    {
      id: '3',
      title: 'Utility Bill',
      description: 'Provide your latest utility bill',
      icon: 'document-text-outline',
      status: 'arrow-forward-circle',
      color: '#9E9E9E',
      screen: 'UtilityBillUpload', // Separate screen for utility bill upload
    },
  ];

  const handleOptionPress = (option) => {
    navigation.navigate(option.screen, { 
      id: option.id, 
      title: option.title 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={true} />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>KYC</Text>
      </View>
      <Text style={styles.subtitle}>Details to provide</Text>
      <Text style={styles.description}>
        The following are information we want from you.
      </Text>

      <View>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.card}
            onPress={() => handleOptionPress(option)}
          >
            <View style={styles.iconContainer}>
              <Icon name={option.icon} size={24} color="#000" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </View>
            <Icon name={option.status} size={24} color={option.color} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 25
  },
  header: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    color: '#000',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Light',
    color: '#666',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.gray,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginVertical: 10,
    paddingVertical: 20
  },
  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Light',
    color: '#666',
  },
});

export default KYCList;