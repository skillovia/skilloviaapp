import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const { width } = Dimensions.get('window');

// Shuffle function
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ExploreSkill = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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
      console.error('Fetch error:', err);
      setCategoriesError('Unable to load categories. Please try again later.');
      Alert.alert('Error', 'Unable to load categories. Please try again later.');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const randomCategories = categories.length > 0 ? shuffleArray(categories).slice(0, 6) : [];

  const gradientColors = [
    ['#8FF15F', '#1A4D00'],

    ['#1A4D00', '#003333'],
 
    ['#8FF15F', '#2D5016'],
    ['#FECA57', '#B8860B'],
  ];

  const navigateToExploreList = (category) => {
    navigation.navigate('ExploreList', {
      category: category.title,
      id: category._id,
    });
  };

  const navigateToViewAll = () => {
    navigation.navigate('ExploreAll');
  };

  const renderCategoryItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigateToExploreList(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[...gradientColors[index % gradientColors.length], '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.thumbnail ||
                'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
            }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <View style={styles.textContainer}>
              <Text style={styles.categoryTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <View style={styles.pulseCircle} />
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{categoriesError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📍</Text>
      <Text style={styles.emptyText}>No categories available.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background gradient decoration */}
      <LinearGradient
        colors={['#EBF4FF', '#F3E8FF', '#FDF2F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Skills</Text>
        <TouchableOpacity 
          style={styles.viewAllButton} 
          onPress={navigateToViewAll}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Text style={styles.viewAllIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isCategoriesLoading && renderLoadingState()}
      
      {categoriesError && !isCategoriesLoading && renderErrorState()}
      
      {!isCategoriesLoading && !categoriesError && (
        <>
          {randomCategories.length > 0 ? (
            <FlatList
              key="horizontal-flatlist"
              data={randomCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id || item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
 
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold', 
    color: Color.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'AlbertSans-Medium', 
    color: Color.secondary,
  },
  viewAllIcon: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: Color.secondary,
    marginLeft: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    opacity: 0.2,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginHorizontal: 16,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
  },
  listContainer: {
    // paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    width: 16,
  },
  categoryCard: {
    width: width * 0.60, 
    borderRadius: 16,
    overflow: 'hidden',

  },
  gradientBackground: {
    padding: 4,
    borderRadius: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    justifyContent: 'flex-end',
  },
  textContainer: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium', 
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  categoryDescription: {
    fontSize: 13,
    fontFamily: 'AlbertSans-Regular', 
    color: '#FFFFFF',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 18,
  },
});

export default ExploreSkill;