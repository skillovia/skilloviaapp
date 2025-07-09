import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';


const { width } = Dimensions.get('window');

export default function ExploreAllCategories() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError('');

      try {
        const response = await apiClient.get('/admin/skills/get/published');

        if (response.data.status === 'success') {
          setCategories(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Unable to load categories. Please try again later.';
        setCategoriesError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('ExploreList', {
      category: category.title,
      id: category._id,
    });
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: category.thumbnail || 
                'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
            }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle} numberOfLines={2}>
            {category.title}
          </Text>
          <Text style={styles.categoryDescription} numberOfLines={3}>
            {category.description}
          </Text>
        </View>
        
    
      </View>
 
    </TouchableOpacity>
  );

  const renderPaginationButton = (pageNum, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => typeof pageNum === 'number' && goToPage(pageNum)}
      disabled={pageNum === '...'}
      style={[
        styles.pageButton,
        pageNum === currentPage && styles.activePageButton,
        pageNum === '...' && styles.disabledPageButton,
      ]}
    >
      <Text
        style={[
          styles.pageButtonText,
          pageNum === currentPage && styles.activePageButtonText,
          pageNum === '...' && styles.disabledPageButtonText,
        ]}
      >
        {pageNum}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Skills Categories</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {isCategoriesLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {/* Error State */}
        {categoriesError && (
          <View style={styles.errorContainer}>
            <Icon name="user-x" size={32} color="#EF4444" />
            <Text style={styles.errorText}>{categoriesError}</Text>
          </View>
        )}

        {/* Categories List */}
        {!isCategoriesLoading && !categoriesError && (
          <>
            {currentCategories.length > 0 ? (
              <View style={styles.categoriesContainer}>
                {currentCategories.map(renderCategoryItem)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="map-pin" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No categories available.</Text>
              </View>
            )}

            {/* Pagination */}
            {categories.length > itemsPerPage && (
              <View style={styles.paginationContainer}>
                <Text style={styles.paginationInfo}>
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, categories.length)} of {categories.length}{' '}
                  categories
                </Text>

                <View style={styles.paginationControls}>
                  {/* Previous Button */}
                  <TouchableOpacity
                    onPress={goToPrevious}
                    disabled={currentPage === 1}
                    style={[
                      styles.navButton,
                      currentPage === 1 && styles.disabledNavButton,
                    ]}
                  >
                    <Icon name="chevron-left" size={16} color={currentPage === 1 ? '#9CA3AF' : '#374151'} />
                    <Text
                      style={[
                        styles.navButtonText,
                        currentPage === 1 && styles.disabledNavButtonText,
                      ]}
                    >
                      Prev
                    </Text>
                  </TouchableOpacity>

                  {/* Page Numbers */}
                  <View style={styles.pageNumbers}>
                    {getPageNumbers().map(renderPaginationButton)}
                  </View>

                  {/* Next Button */}
                  <TouchableOpacity
                    onPress={goToNext}
                    disabled={currentPage === totalPages}
                    style={[
                      styles.navButton,
                      currentPage === totalPages && styles.disabledNavButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.navButtonText,
                        currentPage === totalPages && styles.disabledNavButtonText,
                      ]}
                    >
                      Next
                    </Text>
                    <Icon name="chevron-right" size={16} color={currentPage === totalPages ? '#9CA3AF' : '#374151'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // paddingTop: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium', 
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'AlbertSans-Medium', 
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryItem: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: Color.inputbg,
   
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    marginRight: 16,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium', 
    color: '#111827',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Regular', 
    lineHeight: 20,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Color.secondary,
    borderRadius: 20,

  },
  viewButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: Color.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium', 
    color: '#6B7280',
    marginTop: 16,
  },
  paginationContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  disabledNavButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#374151',
    marginHorizontal: 4,
  },
  disabledNavButtonText: {
    color: '#9CA3AF',
  },
  pageNumbers: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  disabledPageButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pageButtonText: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium', 
    color: '#374151',
  },
  activePageButtonText: {
    color: '#FFFFFF',
  },
  disabledPageButtonText: {
    color: '#9CA3AF',
  },
});