import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';


const { width } = Dimensions.get('window');

// Helper function to convert ID type to API format
const formatIdType = (type) => {
  const typeMap = {
    'Residence permit': 'residence-permit',
    'Driving license': 'driving-license',
    'International passport': 'international-passport'
  };
  return typeMap[type] || '';
};


const formatDisplayType = (type) => {
  const displayMap = {
    'residence-permit': 'Residence permit',
    'driving-license': 'Driving license',
    'international-passport': 'International passport'
  };
  return displayMap[type] || type;
};

// Modal Component for ID Type Selection
const IDTypeModal = ({ isVisible, onClose, onSelect }) => {
  const idTypes = [
    'Residence permit',
    'Driving license',
    'International passport'
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select ID Type</Text>
          
          {idTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.modalOption}
              onPress={() => {
                onSelect(type);
                onClose();
              }}
            >
              <Text style={styles.modalOptionText}>{type}</Text>
              <View style={styles.radioButton} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Identification = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [identityDocs, setIdentityDocs] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchIdentityDocs();
  }, []);

  const fetchIdentityDocs = async () => {
    try {
      setFetchingDocs(true);
      
      const response = await apiClient.get('/settings/kyc/get/identity');
      
      if (response.data && response.data.data) {
        const formattedDocs = response.data.data.map(doc => ({
          id: doc.id,
          fileUrl: doc.document_url,
          type: doc.kyc_id_type,
          createdAt: doc.created_at,
          approvalStatus: doc.approval_status,
          kycMethod: doc.kyc_method
        }));
        
        setIdentityDocs(formattedDocs);
      }
    } catch (err) {
      console.error('Error fetching identity documents:', err);
      Alert.alert('Error', 'Failed to fetch identity documents');
    } finally {
      setFetchingDocs(false);
    }
  };

  const selectImage = () => {
    const options = {
      title: 'Select ID Image',
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this identity document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              
              await apiClient.delete(`/settings/kyc/delete/identity/${id}`);
              
              await fetchIdentityDocs();
              Alert.alert('Success', 'Identity document deleted successfully!');
            } catch (err) {
              console.error('Error deleting identity document:', err);
              Alert.alert('Error', 'Failed to delete identity document');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an ID type');
      return;
    }
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an ID document image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', formatIdType(selectedType));
      formData.append('file', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'id_document.jpg',
      });

      const response = await apiClient.post('/settings/kyc/upload/identity', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'ID document uploaded successfully!');
      setSelectedImage(null);
      setSelectedType('');
      await fetchIdentityDocs();
    } catch (err) {
      console.error('Error uploading ID:', err);
      Alert.alert('Error', 'Failed to upload ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'rejected':
        return { backgroundColor: '#fecaca', color: '#991b1b' };
      default:
        return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← KYC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Uploading...' : 'Save changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* ID Type Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>ID Type</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setIsModalOpen(true)}
          >
            <Text style={[styles.selectButtonText, !selectedType && styles.placeholderText]}>
              {selectedType || 'Select option'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Upload */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Upload ID image</Text>
          <TouchableOpacity style={styles.uploadContainer} onPress={selectImage}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                <Text style={styles.selectedImageText}>
                  {selectedImage.fileName || 'Selected image'}
                </Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📄</Text>
                <Text style={styles.uploadText}>Click to upload image</Text>
                <Text style={styles.uploadSubtext}>SVG, PNG, or JPG</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Existing Documents Section */}
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Uploaded Identity Documents</Text>
        
        {fetchingDocs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A4D00" />
          </View>
        ) : (
          <View style={styles.documentsList}>
            {identityDocs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No identity documents uploaded yet
                </Text>
              </View>
            ) : (
              identityDocs.map((doc) => (
                <View key={doc.id} style={styles.documentItem}>
                  <View style={styles.documentInfo}>
                    <Image
                      source={{ uri: doc.fileUrl }}
                      style={styles.documentThumbnail}
                    />
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentType}>
                        {formatDisplayType(doc.type)}
                      </Text>
                      {/* <Text style={styles.documentDate}>
                        Uploaded on {formatDate(doc.createdAt)}
                      </Text> */}
                      <View style={[styles.statusBadge, getStatusStyle(doc.approvalStatus)]}>
                        <Text style={[styles.statusText, getStatusStyle(doc.approvalStatus)]}>
                          {doc.approvalStatus.charAt(0).toUpperCase() + doc.approvalStatus.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(doc._id)}
                    disabled={deleting}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* ID Type Selection Modal */}
      <IDTypeModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={setSelectedType}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1A4D00',
    fontFamily: 'AlbertSans-Bold',
  },
  saveButton: {
    backgroundColor: '#1A4D00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'AlbertSans-Bold',
  },
  form: {
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
    fontFamily: 'AlbertSans-Bold',
  },
  selectButton: {
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: Color.inputbg,
    padding: 32,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'AlbertSans-Regular',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedImageText: {
    fontSize: 14,
    color: '#6b7280',
  },
  documentsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 16,
    color: '#111827',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  documentsList: {
    gap: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor:Color.gray,
    padding: 16,
    borderRadius: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 16,
  },
  documentDetails: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Color.background,
    borderRadius: 12,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 16,
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor:Color.gray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'AlbertSans-Regular',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCloseButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'AlbertSans-Bold',
  },
});

export default Identification;