import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../../Hooks/Api'; 
import { Color } from '../../../Utils/Theme';


// Custom Modal Component
const CustomModal = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

// Empty State Component
const EmptyState = ({ title, description, icon }) => {
  return (
    <View style={styles.emptyState}>
      {icon && icon()}
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
    </View>
  );
};

// Back Button Component
const BackButton = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Icon name="arrow-back" size={24} color="#333" />
      <Text style={styles.backButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const WithdrawalManagement = () => {
  const navigation = useNavigation();
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWithdrawalMethods();
  }, []);

  const fetchWithdrawalMethods = async () => {
    try {
      const response = await apiClient.get('/settings/payment/withdrawalmethods');
      setWithdrawalMethods(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch withdrawal methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/settings/payment/withdrawalmethod/${id}`);
      
      setWithdrawalMethods((prevMethods) => 
        prevMethods.filter((method) => method.id !== id)
      );
      setShowDeleteModal(false);
      Alert.alert('Success', 'Withdrawal method deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete withdrawal method';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (id) => {
    setSelectedMethodId(id);
    setShowDeleteModal(true);
  };

  const WithdrawalMethodCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Icon name="account-balance" size={24} color="#666" style={styles.bankIcon} />
        <View style={styles.cardInfo}>
          <Text style={styles.bankName}>{item.bank_name}</Text>
          <Text style={styles.accountName}>{item.account_name}</Text>
          <Text style={styles.accountNumber}>•••••{item.account_number.slice(-4)}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => confirmDelete(item.id)}
        style={styles.deleteButton}
        disabled={isDeleting}
      >
        <Icon name="delete" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const DeleteConfirmationModal = () => (
    <CustomModal
      visible={showDeleteModal}
      onClose={() => !isDeleting && setShowDeleteModal(false)}
      title="Confirm Deletion"
    >
      <View style={styles.modalBody}>
        <Text style={styles.confirmText}>
          Are you sure you want to delete this withdrawal method?
        </Text>
        <View style={styles.modalActions}>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(false)}
            style={[styles.modalButton, styles.cancelButton]}
            disabled={isDeleting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(selectedMethodId)}
            disabled={isDeleting}
            style={[styles.modalButton, styles.deleteButtonModal]}
          >
            {isDeleting ? (
              <View style={styles.deletingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.deleteButtonText}>Deleting...</Text>
              </View>
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (withdrawalMethods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No withdrawal method found"
            description="Click the button below to add one"
            icon={() => (
              <CommunityIcon name="credit-card-refund" size={64} color="#666" />
            )}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={withdrawalMethods}
        renderItem={({ item }) => <WithdrawalMethodCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton 
          label="Withdrawal" 
          onPress={() => navigation.goBack()} 
        />
      </View>
      
      <View style={styles.content}>
        {renderContent()}
        
        <TouchableOpacity
          onPress={() => navigation.navigate('AddWithdrawal')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add a New Withdrawal Method</Text>
        </TouchableOpacity>
      </View>
      
      <DeleteConfirmationModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Color.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
    fontFamily: 'AlbertSans-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'AlbertSans-Regular',
  },
  listContainer: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium',
    color: '#333',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'AlbertSans-Regular',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: Color.secondary,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonModal: {
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default WithdrawalManagement;