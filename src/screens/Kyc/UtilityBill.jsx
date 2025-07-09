import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Color } from '../../Utils/Theme';

// Define BASE_URL as a constant at the top level
const BASE_URL = 'https://skilloviaapi.vercel.app/api';

const UtilityBill = ({ navigation }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingBills, setFetchingBills] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [utilityBills, setUtilityBills] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUtilityBills();
  }, []);

  const fetchUtilityBills = async () => {
    try {
      setFetchingBills(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Access token not found');

      const response = await fetch(`${BASE_URL}/settings/kyc/get/utility`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch utility bills');
      }

      const data = await response.json();
      const formattedBills = data.data.map((bill) => ({
        id: bill.id,
        fileUrl: bill.document_url,
        fileName: bill.kyc_id_type,
        createdAt: bill.created_at,
        approvalStatus: bill.approval_status,
        kycMethod: bill.kyc_method,
      }));

      setUtilityBills(formattedBills);
    } catch (err) {
      console.error('Error fetching utility bills:', err);
      setError(err.message);
    } finally {
      setFetchingBills(false);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        console.log('User cancelled image picker');
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        const imageType = response.assets[0].type;
        const imageName = response.assets[0].fileName || 'utility_bill.jpg';

        setFile({
          uri: imageUri,
          type: imageType,
          name: imageName,
        });
        setError('');
      }
    });
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Utility Bill',
      'Are you sure you want to delete this utility bill?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const accessToken = await AsyncStorage.getItem('accessToken');
              if (!accessToken) throw new Error('Access token not found');

              const response = await fetch(
                `${BASE_URL}/settings/kyc/delete/utility/${id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error('Failed to delete utility bill');
              }

              await fetchUtilityBills();
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            } catch (err) {
              console.error('Error deleting utility bill:', err);
              setError(err.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a utility bill');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Access token not found');

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await fetch(`${BASE_URL}/settings/kyc/upload/utility`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload utility bill');
      }

      setSuccess(true);
      setFile(null);
      await fetchUtilityBills();
    } catch (err) {
      console.error('Error uploading utility bill:', err);
      setError(err.message || 'Failed to upload utility bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontFamily: 'AlbertSans-Medium',
    };

    switch (status) {
      case 'approved':
        return {
          ...baseStyle,
          backgroundColor: '#dcfce7',
          color: '#166534',
        };
      case 'rejected':
        return {
          ...baseStyle,
          backgroundColor: '#fef2f2',
          color: '#dc2626',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#d97706',
        };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Utility Bill</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Color.secondary} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Success message */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Operation completed successfully!</Text>
        </View>
      )}

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.label}>Upload Utility Bill</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={handleImagePicker}>
          <Icon name="cloud-upload-outline" size={40} color="#ccc" />
          <Text style={styles.uploadText}>Click to upload image</Text>
          <Text style={styles.fileHint}>SVG, PNG, or JPG</Text>
        </TouchableOpacity>
        {file && (
          <View style={styles.selectedFileContainer}>
            <Text style={styles.selectedFileText}>Selected file: {file.name}</Text>
          </View>
        )}
      </View>

      {/* Existing Bills Section */}
      <View style={styles.existingBillsSection}>
        <Text style={styles.sectionTitle}>Uploaded Utility Bills</Text>
        {fetchingBills ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.primary} />
          </View>
        ) : (
          <View style={styles.billsList}>
            {utilityBills.map((bill) => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billInfo}>
                  <Image
                    source={{ uri: bill.fileUrl }}
                    style={styles.billImage}
                    resizeMode="cover"
                  />
                  <View style={styles.billDetails}>
                    <Text style={styles.billFileName}>{bill.fileName}</Text>
                    <Text style={styles.billDate}>
                      Uploaded on {new Date(bill.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={getStatusBadgeStyle(bill.approvalStatus)}>
                        {bill.approvalStatus.charAt(0).toUpperCase() +
                          bill.approvalStatus.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(bill.id)}
                  disabled={deleting}
                  style={styles.deleteButton}
                >
                  <Icon name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
            {utilityBills.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No utility bills uploaded yet</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 30,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    flex: 1,
    marginLeft: 15,
  },
  saveButton: {
    backgroundColor: Color.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Color.secondary,
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  successContainer: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  uploadSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    fontFamily: 'AlbertSans-Medium',
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'AlbertSans-Medium',
  },
  fileHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  selectedFileContainer: {
    marginTop: 8,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'AlbertSans-Medium',
  },
  existingBillsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  billsList: {
    gap: 12,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billFileName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#000',
  },
  billDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'AlbertSans-Medium',
  },
});

export default UtilityBill;