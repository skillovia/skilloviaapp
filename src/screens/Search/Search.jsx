import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import apiClient from '../../Hooks/Api';
import { Color } from "../../Utils/Theme";

const UserSearch = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSkillLoading, setIsSkillLoading] = useState(false);
  
  // New state for search history
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchUser();
        searchSkill();
        setShowHistory(false);
      }
      if (searchTerm.length === 0) {
        setUsers([]);
        setSkills([]);
        setShowHistory(true); // Show history when search is empty
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const searchUser = async () => {
    if (searchTerm.length < 3) return;

    setIsLoading(true);
    try {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      
      const response = await apiClient.get(`/users/searchuser/${normalizedSearchTerm}`);
      
      if (response.data.status === 'success') {
        const matchingUsers = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        setUsers(matchingUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setUsers([]);
    }
    setIsLoading(false);
  };

  const searchSkill = async () => {
    if (searchTerm.length < 3) return;
    setIsSkillLoading(true);

    try {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      
      const response = await apiClient.get(`/skills/searchname/${normalizedSearchTerm}`);
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setSkills(response.data.data);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error('Error searching skill:', error);
      setSkills([]);
    }
    setIsSkillLoading(false);
  };

  const handleUserClick = (userId) => {
    if (!userId) {
      Alert.alert('Error', 'Invalid user ID.');
      return;
    }
    navigation.navigate('UserProfile', { userId });
  };

  const handleSkillClick = (skill) => {
    navigation.navigate('ExploreList', {
      id: skill._id,
      category: skill.title,
    });
  };

  // Function to add search result to history
  const addToHistory = (item, type) => {
    const historyItem = {
      ...item,
      type: type,
      searchedAt: new Date().toISOString(),
      id: `${type}_${item._id}_${Date.now()}` // Unique ID for history
    };

    setSearchHistory(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(historyItem => 
        !(historyItem._id === item._id && historyItem.type === type)
      );
      // Add to beginning and limit to 20 items
      return [historyItem, ...filtered].slice(0, 20);
    });
  };

  // Enhanced click handlers that add to history
  const handleUserClickWithHistory = (user) => {
    addToHistory(user, 'user');
    handleUserClick(user._id);
  };

  const handleSkillClickWithHistory = (skill) => {
    addToHistory(skill, 'skill');
    handleSkillClick(skill);
  };

  // Function to handle clicking on history items
  const handleHistoryClick = (item) => {
    if (item.type === 'user') {
      handleUserClick(item._id);
    } else if (item.type === 'skill') {
      handleSkillClick(item);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setUsers([]);
    setSkills([]);
    setShowHistory(true);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeFromHistory = (itemId) => {
    setSearchHistory(prev => prev.filter(item => item.id !== itemId));
  };

  const renderSkillItem = ({ item, index }) => (
    <TouchableOpacity
      key={item._id || index}
      style={styles.resultItem}
      onPress={() => handleSkillClickWithHistory(item)}
    >
      <View style={styles.avatarContainer}>
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.skillAvatar}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.skillAvatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>SKILL</Text>
          </View>
        )}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item, index }) => (
    <TouchableOpacity
      key={item._id || index}
      style={styles.resultItem}
      onPress={() => handleUserClickWithHistory(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: item.photourl || 
              'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
          }}
          style={styles.userAvatar}
          resizeMode="cover"
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>
          {`${item.firstname} ${item.lastname}`}
        </Text>
        <Text style={styles.itemSubtitle}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryClick(item)}
    >
      <View style={styles.historyItemContent}>
        <View style={styles.avatarContainer}>
          {item.type === 'user' ? (
            <Image
              source={{
                uri: item.photourl || 
                  'https://i.pinimg.com/736x/4c/85/31/4c8531dbc05c77cb7a5893297977ac89.jpg'
              }}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          ) : (
            item.thumbnail ? (
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.skillAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.skillAvatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>SKILL</Text>
              </View>
            )
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>
            {item.type === 'user' 
              ? `${item.firstname} ${item.lastname}`
              : item.title
            }
          </Text>
          <Text style={styles.itemSubtitle}>
            {item.type === 'user' ? item.email : item.description}
          </Text>
        </View>
        <View style={styles.historyMeta}>
          <Text style={styles.historyType}>
            {item.type.toUpperCase()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromHistory(item.id)}
      >
        <Icon name="x" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#6B7280" />
      <Text style={styles.loadingText}>Searching...</Text>
    </View>
  );

  const renderEmptyState = () => {
    if (searchTerm.length < 3 && searchTerm.length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Keep typing...</Text>
          <Text style={styles.emptySubtitle}>At least 3 characters needed</Text>
        </View>
      );
    }

    if (searchTerm.length >= 3 && users.length === 0 && skills.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No users or skills found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      );
    }

    return null;
  };

  const renderHistoryHeader = () => (
    <View style={styles.historyHeader}>
      <Text style={styles.historyTitle}>Recent Searches</Text>
      {searchHistory.length > 0 && (
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearHistoryText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search input */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search users, Skills..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={() => {
                searchUser();
                searchSkill();
              }}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Loading indicator */}
      {(isLoading || isSkillLoading) && renderLoadingIndicator()}

      {/* Show search history when no active search */}
      {showHistory && searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          {renderHistoryHeader()}
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.historyList}
          />
        </View>
      )}

      {/* Show empty state for history */}
      {showHistory && searchHistory.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="clock" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No recent searches</Text>
          <Text style={styles.emptySubtitle}>Your search history will appear here</Text>
        </View>
      )}

      {/* Results */}
      {!showHistory && (
        <FlatList
          style={styles.resultsList}
          keyExtractor={(item, index) => item._id || index.toString()}
          data={[
            // Skills section
            ...(skills.length > 0 ? [{ type: 'section', title: 'Skills' }] : []),
            ...skills.map(skill => ({ ...skill, type: 'skill' })),
            // Users section
            ...(users.length > 0 ? [{ type: 'section', title: 'Users' }] : []),
            ...users.map(user => ({ ...user, type: 'user' })),
          ]}
          renderItem={({ item, index }) => {
            if (item.type === 'section') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
              );
            } else if (item.type === 'skill') {
              return renderSkillItem({ item, index });
            } else if (item.type === 'user') {
              return renderUserItem({ item, index });
            }
            return null;
          }}
          ListEmptyComponent={!isLoading && !isSkillLoading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6FCEB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Color.gray,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderAvatar: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'AlbertSans-Medium',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Medium',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // New styles for history
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#111827',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'AlbertSans-Medium',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.inputbg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyMeta: {
    marginLeft: 'auto',
    marginRight: 8,
  },
  historyType: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'AlbertSans-Medium',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default UserSearch;