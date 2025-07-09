import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Color } from '../../Utils/Theme';
import apiClient from '../../Hooks/Api';

const MySkillsScreen = ({ navigation }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch skills from API
  const fetchSkills = async () => {
    try {
      const response = await apiClient.get('/skills/user/all');
   
      if (response.data.status === 'success') {
        setSkills(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch skills');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSkills();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSkills();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  // Map API data to display format
  const getSkillDisplayData = (skill) => {
    return {
      id: skill._id,
      title: skill.skillCategoryId?.name || 'Skill', 
      level: skill.experience_level,
      description: skill.description,
      hourlyRate: `£${skill.hourly_rate}`,
      tokens: `${skill.spark_token} spark tokens`,
      approvalStatus: skill.approval_status,
      thumbnail: skill.thumbnail01,
      userId: skill.userId,
    };
  };

  // Generate star rating based on experience level
  const getStarRating = (level) => {
    const ratings = {
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5
    };
    return ratings[level?.toLowerCase()] || 3;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={16}
          color="#FFC107"
        />
      );
    }
    return stars;
  };

  const renderSkillCard = ({ item }) => {
    const skillData = getSkillDisplayData(item);
    const starRating = getStarRating(skillData.level);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.skillTitle}>{skillData.title}</Text>
            {skillData.approvalStatus === 'published' && (
              <View style={styles.publishedBadge}>
                <Text style={styles.publishedText}>Published</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("skilldetails", { skillId: skillData.id })}
          >
            <Icon name="edit" size={20} color="#4F4F4F" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.skillLevel}>
          Experience level: {skillData.level?.charAt(0).toUpperCase() + skillData.level?.slice(1)}
        </Text>
        
        <View style={styles.rating}>
          {renderStars(starRating)}
        </View>
        
        <Text style={styles.skillDescription} numberOfLines={3}>
          {skillData.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.hourlyRate}>{skillData.hourlyRate}</Text>
          <Text style={styles.tokens}>{skillData.tokens}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="work-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No Skills Yet</Text>
      <Text style={styles.emptyDescription}>
        Add your first skill to start earning with your talents
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.header}>My skills</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.loadingText}>Loading your skills...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* StatusBar */}
      {/* <StatusBar translucent barStyle="dark-content" /> */}
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>My skills</Text>
      </View>
      
      {/* Skill Cards */}
      <FlatList
        data={skills}
        keyExtractor={(item) => item._id}
        renderItem={renderSkillCard}
        contentContainerStyle={[
          styles.list,
          skills.length === 0 && styles.emptyList
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
      />
      
      {/* Add Skill Button */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('addskill')} 
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Add a skill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    marginLeft: 10,
    color: '#333333',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Color.gray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginRight: 8,
  },
  publishedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  publishedText: {
    fontSize: 10,
    fontFamily: 'AlbertSans-Medium',
    color: '#FFFFFF',
  },
  skillLevel: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Medium',
    color: '#777777',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  skillDescription: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555555',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourlyRate: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
  },
  tokens: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#555555',
  },
  addButton: {
    backgroundColor: Color.primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    margin: 16,
  },
  addButtonText: {
    color: Color.secondary,
    fontSize: 16,
    fontFamily: 'AlbertSans-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'AlbertSans-Regular',
    color: '#777777',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Regular',
    color: '#777777',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default MySkillsScreen;