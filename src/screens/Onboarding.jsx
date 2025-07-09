import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../Utils/Theme';
import Google from '../../assets/Icons/svgs/google';

const { width } = Dimensions.get('window');

const Onboarding = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const images = [
    'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732049206/rsz_0f97c93d7e2a172dfab38a344f9b8ce0_r6frdm_i0xs60.jpg',
    'https://res.cloudinary.com/dmhvsyzch/image/upload/v1732032776/212760ab183179b3b25c4e05722b52ed_rvwdpf.jpg',
  ];

  // Check for access token on component mount
  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // Token exists, navigate to home (which contains HomeTabs)
        navigation.replace('home');
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      // Continue with onboarding if there's an error
    }
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / width);
    setCurrentPage(currentIndex);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <ImageBackground
            key={index}
            source={{ uri: image }}
            style={styles.backgroundImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.title}>Get some shit {'\n'} done!</Text>

              {/* Social Login Buttons */}
              {/* <TouchableOpacity style={[styles.socialButton, styles.facebook]}>
                <Icon name="facebook" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.socialText}>Continue with Facebook</Text>
              </TouchableOpacity> */}

              <TouchableOpacity style={[styles.socialButton, styles.google]}>
                <Google />
                <Text style={[styles.socialText, styles.googleText]}>Continue with Google</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={[styles.socialButton, styles.apple]}>
                <Icon name="apple" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity> */}

              <View style={styles.divider}>
                <Text style={styles.orText}>or</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('signup')}
                style={styles.createAccountButton}
              >
                <Text style={styles.createAccountText}>Create an account</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.loginText}
                  onPress={() => navigation.navigate('login')}
                >
                  Log in
                </Text>
              </Text>

              <Text style={styles.termsText}>
                By continuing to use Skillovia, you agree to our Terms of Service and
                Privacy Policy
              </Text>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentPage === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 38,
    color: '#fff',
    width: "100%",
    marginBottom: 20,
    fontFamily: 'AlbertSans-Bold', 
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 25,
  },
  facebook: {
    backgroundColor: '#1877F2',
  },
  google: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  apple: {
    backgroundColor: '#000',
  },
  socialText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'AlbertSans-Medium',
  },
  googleText: {
    color: Color.text,
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    marginVertical: 20,
  },
  orText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Light',
  },
  createAccountButton: {
    backgroundColor: Color.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  createAccountText: {
    fontSize: 16,
    color: Color.secondary,
    fontFamily: 'AlbertSans-Bold',
  },
  footerText: {
    fontSize: 15,
    color: '#fff',
    marginTop: 20,
    width: "100%",
    fontFamily: 'AlbertSans-Regular',
  },
  loginText: {
    textDecorationLine: 'underline',
    fontFamily: 'AlbertSans-Bold',
    fontSize: 18,
  },
  termsText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 10,
    fontFamily: 'AlbertSans-Light',
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default Onboarding;