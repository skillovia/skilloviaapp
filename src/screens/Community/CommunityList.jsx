// CommunityListScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { Color } from '../../Utils/Theme';

const CommunityListScreen = ({ navigation }) => {
  const communities = [
    {
      id: '1',
      name: 'The DevOps of Silicon valley',
      members: '100 members',
      icon: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735616132/ece3253fc62b2ffa314345d0980967ae_ivf1vh.png",
      backgroundColor: '#2C3E50',
    },
    {
      id: '2',
      name: 'The Design community',
      members: '100 members',
      icon: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735616127/bf0830d7ac4727a8d909e48f748634c6_xe5nag.png",
      backgroundColor: '#F1C40F',
    },
    {
      id: '3',
      name: 'The Arial Metrics',
      members: '100 members',
      icon: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735616129/8994933450fc3a45f87c196d32497666_tikhv9.png",
      backgroundColor: '#E74C3C',
    },
    {
      id: '4',
      name: 'The Dictator reviews',
      members: '100 members',
      icon: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1735616126/f263173c1403badae1896fba6b1f6819_f483az.png",
      backgroundColor: '#9B59B6',
    },
  ];

  const renderCommunityItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("feed")} style={styles.communityItem}>
      <View style={[styles.iconContainer]}>
        <Image source={{uri:item.icon}} style={styles.icon} />
      </View>
      <View style={styles.communityInfo}>
        <Text style={styles.communityName}>{item.name}</Text>
        <Text style={styles.memberCount}>{item.members}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Join a community</Text>
        <Text style={styles.subtitle}>
          Select and join any of these communities closest to you.
        </Text>

        <FlatList
          data={communities}
          renderItem={renderCommunityItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 22,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  list: {
    flex: 1,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 58,
    height: 38,

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 120,

  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontFamily: 'AlbertSans-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  memberCount: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
  },
});

export default CommunityListScreen;