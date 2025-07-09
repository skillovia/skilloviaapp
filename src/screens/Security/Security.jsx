import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const SecurityScreen = ({navigation}) => {
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(true);

  const toggleFaceRecognition = () => {
    setFaceRecognitionEnabled((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back-outline" size={24} color="#000" />
        <Text style={styles.headerText}>Security</Text>
      </TouchableOpacity>

      {/* Authentication Options Section */}
      <Text style={styles.sectionTitle}>Authentication options</Text>

      {/* Password Option */}
      <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="checkmark-circle" size={20} color="#32CD32" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Password has been set</Text>
            <Text style={styles.optionSubtitle}>
              You change your password to a more stronger one
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('editpsw')}>
          <Icon name="create-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Face or Fingerprint Recognition Option */}
      {/* <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="checkmark-circle" size={20} color="#32CD32" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Face or fingerprint recognition</Text>
            <Text style={styles.optionTitle}>Enabled</Text>
            <Text style={styles.optionSubtitle}>
              Use your face or fingerprint when logging in.
            </Text>
          </View>
        </View>
        <Switch
          value={faceRecognitionEnabled}
          onValueChange={toggleFaceRecognition}
          trackColor={{ false: '#DDD', true: '#32CD32' }}
          thumbColor="#FFF"
        />
      </View> */}
    </View>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
 
    marginVertical:10,
  
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    marginLeft: 10,
  },
  optionTitle: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'AlbertSans-Medium',
    paddingBottom:4
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'AlbertSans-Medium',
  },
});
