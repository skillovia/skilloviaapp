import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';

const { width } = Dimensions.get('window');

const EditSkillScreen = ({ navigation, route }) => {
  const { skillId, skillData: initialSkillData } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    skill_type: '',
    experience_level: '',
    hourly_rate: '',
    description: '',
    thumbnails: [null, null, null, null],
  });

  const [imageFiles, setImageFiles] = useState([null, null, null, null]);

  // Load initial data
  useEffect(() => {
    if (initialSkillData) {
      const thumbnailsArray = [
        initialSkillData.thumbnail01,
        initialSkillData.thumbnail02,
        initialSkillData.thumbnail03,
        initialSkillData.thumbnail04,
      ];

      setFormData({
        skill_type: initialSkillData.skill_type || '',
        experience_level: initialSkillData.experience_level || '',
        hourly_rate: initialSkillData.hourly_rate?.toString() || '',
        description: initialSkillData.description || '',
        thumbnails: thumbnailsArray,
      });
    }
  }, [initialSkillData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (index) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (asset.fileSize > maxSize) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        // Update thumbnails array
        setFormData(prev => {
          const newThumbnails = [...prev.thumbnails];
          newThumbnails[index] = asset.uri;
          return {
            ...prev,
            thumbnails: newThumbnails,
          };
        });

        // Update image files for upload
        setImageFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || `image_${index}.jpg`,
          };
          return newFiles;
        });
      }
    });
  };

  const handleDeleteImage = async (index) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingImageIndex(index);
            try {
              const thumbnailKey = {
                0: 'thumbnail01',
                1: 'thumbnail02',
                2: 'thumbnail03',
                3: 'thumbnail04',
              }[index];

              const response = await apiClient.delete(`/skills/photo/${skillId}`, {
                data: { key: thumbnailKey }
              });

              if (response.data.status === 'success') {
                // Update local state
                setFormData(prev => {
                  const newThumbnails = [...prev.thumbnails];
                  newThumbnails[index] = null;
                  return {
                    ...prev,
                    thumbnails: newThumbnails,
                  };
                });

                setImageFiles(prev => {
                  const newFiles = [...prev];
                  newFiles[index] = null;
                  return newFiles;
                });

                Alert.alert('Success', 'Image deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete image');
            } finally {
              setDeletingImageIndex(null);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.skill_type || !formData.experience_level || !formData.hourly_rate || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      
      formDataObj.append('skill_type', formData.skill_type);
      formDataObj.append('experience_level', formData.experience_level);
      formDataObj.append('hourly_rate', formData.hourly_rate);
      formDataObj.append('description', formData.description);

      // Add image files
      imageFiles.forEach((file) => {
        if (file) {
          formDataObj.append('thumbnails', file);
        }
      });

      const response = await apiClient.put(`/skills/${skillId}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        Alert.alert('Success', 'Skill updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      Alert.alert('Error', 'Failed to update skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async () => {
    setDeleting(true);
    try {
      const response = await apiClient.delete(`/skills/${skillId}`);
      
      if (response.data.status === 'success') {
        setShowDeleteModal(false);
        Alert.alert('Success', 'Skill deleted successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('UserProfile'), 
          },
        ]);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      Alert.alert('Error', 'Failed to delete skill');
    } finally {
      setDeleting(false);
    }
  };

  const renderImageUpload = (index) => {
    const hasImage = formData.thumbnails[index];
    
    return (
      <View key={index} style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.imageUpload}
          onPress={() => handleImageUpload(index)}
        >
          {hasImage ? (
            <>
              <Image source={{ uri: formData.thumbnails[index] }} style={styles.uploadedImage} />
              <View style={styles.imageOverlay}>
                <Icon name="photo-camera" size={24} color="#FFFFFF" />
              </View>
            </>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Icon name="add-photo-alternate" size={32} color="#CCCCCC" />
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {hasImage && (
          <TouchableOpacity
            style={styles.deleteImageButton}
            onPress={() => handleDeleteImage(index)}
            disabled={deletingImageIndex === index}
          >
            {deletingImageIndex === index ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="delete" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const DeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteModal}
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Icon name="warning" size={32} color="#FF5252" />
            <Text style={styles.modalTitle}>Delete Skill</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this skill? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDeleteSkill}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Skill</Text>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          style={styles.deleteHeaderButton}
        >
          <Icon name="delete" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imageGrid}>
            {[0, 1, 2, 3].map(renderImageUpload)}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Skill Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.skill_type}
              onChangeText={(value) => handleInputChange('skill_type', value)}
              placeholder="Enter skill type"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          {/* Experience Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience Level *</Text>
            <View style={styles.pickerContainer}>
              {['beginner', 'intermediate', 'expert'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.pickerOption,
                    formData.experience_level === level && styles.pickerOptionSelected
                  ]}
                  onPress={() => handleInputChange('experience_level', level)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.experience_level === level && styles.pickerOptionTextSelected
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hourly Rate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate (£) *</Text>
            <TextInput
              style={styles.input}
              value={formData.hourly_rate}
              onChangeText={(value) => handleInputChange('hourly_rate', value)}
              placeholder="0.00"
              placeholderTextColor="#CCCCCC"
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your skill and experience"
              placeholderTextColor="#CCCCCC"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteModal />
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    flex: 1,
    marginLeft: 16,
  },
  deleteHeaderButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imageUpload: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#CCCCCC',
    marginTop: 4,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5252',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: Color.secondary,
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#555',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Color.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#333',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
});

export default EditSkillScreen;