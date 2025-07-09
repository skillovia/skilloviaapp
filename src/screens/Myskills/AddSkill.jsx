import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';

const AddSkillTabs = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('5.00');
  const [thumbnails, setThumbnails] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customSkillModal, setCustomSkillModal] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const levels = [
    {
      level: 'Beginner',
      description: "I'm learning basics and exploring"
    },
    {
      level: 'Intermediate',
      description: 'I have some experience in the past'
    },
    {
      level: 'Expert',
      description: "I've done this for years"
    }
  ];

  const tabs = [
    { title: 'Select Skill', icon: 'checkmark-circle-outline' },
    { title: 'Experience', icon: 'school-outline' },
    { title: 'Description', icon: 'document-text-outline' },
    { title: 'Rate', icon: 'card-outline' },
    { title: 'Images', icon: 'image-outline' },
  ];

  const MAX_FILES = 4;
  const poundsToSparkTokens = (pounds) => {
    const value = parseFloat(pounds);
    if (isNaN(value)) return 0;
    return (value * 0.5).toFixed(1);
  };

  // Fetch published skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/skills/get/published');
      
      const publishedSkills = response.data.data
        .filter((skill) => skill.status === 'published')
        .map((skill) => ({
          id: skill._id,
          title: skill.title,
        }));
      
      setSkills(publishedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Could not load skills. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillSelect = (skillObj) => {
    setSelectedSkill(skillObj.title);
    setSelectedSkillId(skillObj.id);
  };

  const handleAddCustomSkill = async () => {
    if (!customSkillInput.trim()) return;
    
    try {
      setIsLoading(true);
      
      await apiClient.post('/suggestedskills', {
        name: customSkillInput.trim()
      });

      Alert.alert(
        'Success',
        'Your custom skill has been submitted for admin approval. An admin will review it within 2 days and get back to you.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Explore')
          }
        ]
      );
    } catch (error) {
      console.error('Error suggesting skill:', error);
      Alert.alert('Error', 'Failed to suggest skill. Please try again.');
    } finally {
      setIsLoading(false);
      setCustomSkillInput('');
      setCustomSkillModal(false);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: MAX_FILES - thumbnails.length,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        
        setThumbnails(prev => [...prev, ...newImages]);
      }
    });
  };

  const removeImage = (index) => {
    setThumbnails(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!selectedSkillId || !selectedLevel || !description.trim() || !hourlyRate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const sparkToken = poundsToSparkTokens(hourlyRate);
      
      const formData = new FormData();
      formData.append('skillCategoryId', selectedSkillId);
      formData.append('experience_level', selectedLevel.toLowerCase());
      formData.append('hourly_rate', hourlyRate);
      formData.append('spark_token', sparkToken);
      formData.append('description', description);

      // Add thumbnail images
      thumbnails.forEach((image, index) => {
        formData.append('thumbnails', {
          uri: image.uri,
          type: image.type,
          name: image.name || `thumbnail_${index}.jpg`,
        });
      });

      const response = await apiClient.post('/skills', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        'Success',
        'Skill added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('myskill')
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting skill:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add skill. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered skills based on search input
  const filteredSkills = skills.filter((skill) =>
    skill.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const sparkTokens = poundsToSparkTokens(hourlyRate);

  const handleRateChange = (text) => {
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setHourlyRate(cleanedText);
  };

  const canProceedToNext = () => {
    switch (currentTab) {
      case 0: return selectedSkill !== null;
      case 1: return selectedLevel !== null;
      case 2: return description.trim() !== '';
      case 3: return hourlyRate !== '';
      case 4: return true; // Images are optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderTabIndicator = () => (
    <View style={styles.tabIndicator}>
      {tabs.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentTab && styles.activeDot,
            index < currentTab && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );

  const renderCustomSkillModal = () => {
    if (!customSkillModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Custom Skill</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter your skill"
            value={customSkillInput}
            onChangeText={setCustomSkillInput}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setCustomSkillModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                !customSkillInput.trim() && styles.disabledButton
              ]}
              onPress={handleAddCustomSkill}
              disabled={!customSkillInput.trim() || isLoading}
            >
              <Text style={styles.modalSubmitText}>
                {isLoading ? 'Adding...' : 'Add & Proceed'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSkillSelection = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search skills"
        placeholderTextColor="#B0B0B0"
        value={searchText}
        onChangeText={setSearchText}
      />
      <Text style={styles.title}>Select your skill</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={Color.secondary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredSkills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.skillItem,
                selectedSkill === item.title && styles.selectedSkillItem,
              ]}
              onPress={() => handleSkillSelect(item)}
            >
              <Text
                style={[
                  styles.skillText,
                  selectedSkill === item.title && styles.selectedSkillText,
                ]}
              >
                {item.title}
              </Text>
              <FontAwesome
                name={selectedSkill === item.title ? 'dot-circle-o' : 'circle-o'}
                size={20}
                color={selectedSkill === item.title ? '#32CD32' : '#B0B0B0'}
              />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No skills found matching your search</Text>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => setCustomSkillModal(true)}
              >
                <Text style={styles.addCustomButtonText}>Can't find your skill? Add it</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );

  const renderExperienceLevel = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>What's your experience level?</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Sell yourself to clients</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Enter a description..."
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>
    </View>
  );

  const renderHourlyRate = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Set your hourly/token rate</Text>
      <View style={styles.rateContainer}>
        <Text style={styles.label}>Hourly rate</Text>
        <View style={styles.rateInputContainer}>
          <Text style={styles.currencySymbol}>£</Text>
          <TextInput
            style={styles.rateInput}
            value={hourlyRate}
            onChangeText={handleRateChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
          <Text style={styles.perHour}>/hr</Text>
        </View>
        <Text style={styles.tokenRate}>{sparkTokens} Spark tokens</Text>
      </View>
    </View>
  );

  const renderImageUpload = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Add skill images</Text>
      <Text style={styles.subtitle}>Upload Thumbnails (Max {MAX_FILES} images)</Text>
      
      <TouchableOpacity
        style={styles.imagePickerButton}
        onPress={handleImagePicker}
        disabled={thumbnails.length >= MAX_FILES}
      >
        <Ionicons name="camera" size={24} color="#666" />
        <Text style={styles.imagePickerText}>
          {thumbnails.length >= MAX_FILES ? 'Maximum images selected' : 'Select Images'}
        </Text>
      </TouchableOpacity>

      {thumbnails.length > 0 && (
        <Text style={styles.imageCount}>
          Selected {thumbnails.length} of {MAX_FILES} images
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
        {thumbnails.map((image, index) => (
          <View key={index} style={styles.imagePreview}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0: return renderSkillSelection();
      case 1: return renderExperienceLevel();
      case 2: return renderDescription();
      case 3: return renderHourlyRate();
      case 4: return renderImageUpload();
      default: return renderSkillSelection();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevious}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a skill</Text>
      </View>

      {/* Tab Indicator */}
      {renderTabIndicator()}

      {/* Current Tab Content */}
      {renderCurrentTab()}

      {/* Custom Skill Modal */}
      {renderCustomSkillModal()}

      {/* Navigation Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          (!canProceedToNext() || isLoading) && styles.disabledButton
        ]}
        onPress={handleNext}
        disabled={!canProceedToNext() || isLoading}
      >
        <Text style={styles.nextButtonText}>
          {isLoading ? 'Loading...' : 
           currentTab === tabs.length - 1 ? 'Complete' : 
           `Next, ${tabs[currentTab + 1].title}`}
        </Text>
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
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  tabIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.primary,
  },
  activeDot: {
    backgroundColor: Color.secondary,
    width: 24,
    borderRadius: 12,
  },
  completedDot: {
    backgroundColor: '#32CD32',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loader: {
    marginTop: 50,
  },
  searchInput: {
    backgroundColor: Color.gray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
  },
  title: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 24,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    marginBottom: 16,
    color: '#666666',
  },
  skillItem: {
    padding: 16,
    backgroundColor: Color.gray,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333333',
  },
  selectedSkillItem: {
    borderColor: '#32CD32',
  },
  selectedSkillText: {
    fontFamily: 'AlbertSans-Bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addCustomButton: {
    backgroundColor: '#32CD32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCustomButtonText: {
    color: 'white',
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  levelItem: {
    padding: 16,
    paddingVertical: 30,
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
    borderColor: '#32CD32',
  },
  selectedLevelText: {
    fontFamily: 'AlbertSans-Bold',
  },
  selectedDescriptionText: {
    color: '#32CD32',
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
  descriptionInput: {
    height: 120,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  rateContainer: {
    // styling for rate container
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Color.gray,
    borderRadius: 8,
    padding: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#333333',
    marginRight: 4,
  },
  rateInput: {
    flex: 1,
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#333333',
    padding: 10,
  },
  perHour: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  tokenRate: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#666666',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.gray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
  },
  imageCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'AlbertSans-Regular',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 16,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#666',
    fontFamily: 'AlbertSans-Medium',
  },
  modalSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#32CD32',
    borderRadius: 6,
  },
  modalSubmitText: {
    color: 'white',
    fontFamily: 'AlbertSans-Medium',
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

export default AddSkillTabs;