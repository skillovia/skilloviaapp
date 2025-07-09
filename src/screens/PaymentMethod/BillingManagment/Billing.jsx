import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../../Hooks/Api'; 
import { Color } from '../../../Utils/Theme';


const BillingManagement = () => {
  const navigation = useNavigation();
  const [billingMethods, setBillingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchBillingMethods();
    }, [])
  );

  const fetchBillingMethods = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings/payment/billingmethods');
      setBillingMethods(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch billing methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Billing Method',
      'Are you sure you want to delete this billing method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            setIsDeleting(true);
            try {
              await apiClient.delete(`/settings/payment/billingmethod/${id}`);
              setBillingMethods((prev) => prev.filter(method => method.id !== id));
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete billing method');
            } finally {
              setIsDeleting(false);
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const navigateToAddBills = () => {
    navigation.navigate('AddBills');
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons 
        name="credit-card-refund-outline" 
        size={64} 
        color="#9CA3AF" 
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Billing method found</Text>
      <Text style={styles.emptyDescription}>Click the button below to add one</Text>
    </View>
  );

  const BillingMethodCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={styles.cardIcon} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardNumber}>•••• •••• •••• {item.card_number.slice(-4)}</Text>
            <Text style={styles.cardExpiry}>Expiry: {item.expiry_date}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          disabled={isDeleting}
        >
          {isDeleting && deletingId === item.id ? (
            <ActivityIndicator size={16} color="#6B7280" />
          ) : (
            <Icon name="delete-outline" size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBillingMethod = ({ item }) => <BillingMethodCard item={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backButtonText}>Bills</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Billing Methods</Text>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9CA3AF" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchBillingMethods}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : billingMethods.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={billingMethods}
              renderItem={renderBillingMethod}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={navigateToAddBills}
          >
            <Text style={styles.addButtonText}>Add a New Billing Method</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
    color: '#1F2937',
  },
  mainContent: {
    flex: 1,
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
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Medium',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: Color.secondary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 'auto',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
  },
});

export default BillingManagement;