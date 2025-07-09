import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const Apperance = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      level: 'Light',
      description: "A bright and clean interface"
    },
    {
      level: 'Dark',
      description: 'A sleek, low-light design'
    },
    {
      level: 'System',
      description: "Adjusted based on device settings"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Custom Status Bar */}
      <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
      </View>

     

      {/* Experience Levels */}
      {levels.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.levelItem,
            selectedLevel === item.level && styles.selectedLevelItem,
          ]}
          onPress={() => setSelectedLevel(item.level)}
        >
          <View style={styles.levelContent}>
            <Text
              style={[
                styles.levelText,
                selectedLevel === item.level && styles.selectedLevelText,
              ]}
            >
              {item.level}
            </Text>
            <Text
              style={[
                styles.descriptionText,
                selectedLevel === item.level && styles.selectedDescriptionText,
              ]}
            >
              {item.description}
            </Text>
          </View>
          {/* Circle Icon */}
          <View style={styles.radioButton}>
            <View
              style={[
                styles.outerCircle,
                selectedLevel === item.level && styles.selectedOuterCircle,
              ]}
            >
              {selectedLevel === item.level && <View style={styles.innerCircle} />}
            </View>
          </View>
        </TouchableOpacity>
      ))}

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 46,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 24,
    color: '#333333',
    marginTop: 25,
  },
  levelItem: {
    
    padding: 16,
    paddingVertical:30,
    backgroundColor: Color.gray,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelContent: {
    flex: 1,
  },
  levelText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
  },
  selectedLevelItem: {
    // borderColor: '#32CD32',
    // backgroundColor: '#F0FFF0',
  },
  selectedLevelText: {
    // color: '#32CD32',
    fontFamily: 'AlbertSans-Bold',
  },
  selectedDescriptionText: {
    // color: '#32CD32',
  },
  radioButton: {
    marginLeft: 12,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOuterCircle: {
    borderColor: '#32CD32',
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#32CD32',
    
  },
  nextButton: {
    backgroundColor: '#32CD32',
    padding: 16,
    borderRadius: 30,
    marginTop: 'auto',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});

export default Apperance;