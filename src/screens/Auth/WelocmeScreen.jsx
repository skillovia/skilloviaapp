import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const WelcomeScreen = ({navigation}) => {
  return (
    <ImageBackground
      source={{
        uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732059327/b684ba517d0dfe5fe609710dc7707387_qseays.jpg',
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
        <Image
          source={{
            uri: 'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732059328/WHT_Vert._Logo_jq8tx8.png',
          }}
          style={styles.logoImage}
        />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.subtitle}>Skillovia</Text>
          <Text style={styles.description}>
            You can now request and get services close to you like never before!
          </Text>
        </View>

        {/* Button Positioned Downwards */}
        <TouchableOpacity onPress={() => navigation.navigate('login')} style={styles.button}>
          <Text style={styles.buttonText}>Start exploring</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay
  },
  logoImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',

    marginTop: 130, 
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    marginTop: 20, 
  },
  title: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'AlbertSans-ExtraBold',
  },
  subtitle: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'AlbertSans-ExtraBold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'AlbertSans-Medium',
  },
  button: {
    backgroundColor: Color.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '90%', // Ensures the button takes up 90% of the screen width
    marginBottom: 40, // Positions the button away from the bottom edge
  },
  buttonText: {
    color: Color.secondary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
});


export default WelcomeScreen;

