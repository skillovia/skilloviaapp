import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // For the back arrow icon
import { Color } from '../../Utils/Theme';

const EmptySkillsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={{
            uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732448661/Group_590_ye4ah2.png',
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Text Content */}
        <Text style={styles.title}>Add a skill</Text>
        <Text style={styles.subtitle}>
          Add your skills to get clients and get paid.
        </Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('myskill')}>
          <Text style={styles.buttonText}>Add a skill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6EC', // Background color to match the design
  },
  header: {
    marginTop: 40, // Add spacing for the header
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 24, // Space between the logo and the title
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Light',
    color: 'gray',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Color.primary,
    padding: 16,
    borderRadius: 28,
  },
  buttonText: {
    color: Color.secondary,
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
  },
});

export default EmptySkillsScreen;
