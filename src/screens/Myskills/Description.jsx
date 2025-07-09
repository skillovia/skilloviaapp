import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';

const SkillDescription = ({ navigation }) => {
  const [description, setDescription] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a skill</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Sell yourself to clients</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a description..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.nextButton, !description.trim() && styles.disabledButton]}
        onPress={() => description.trim() && navigation.navigate('rate', { description })}
        disabled={!description.trim()}
      >
        <Text style={styles.nextButtonText}>Next, Hourly rate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: Color.gray,
    borderRadius: 8,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 120,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  nextButton: {
    backgroundColor: '#32CD32',
    padding: 16,
    borderRadius: 30,
    margin: 16,
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

export default SkillDescription;