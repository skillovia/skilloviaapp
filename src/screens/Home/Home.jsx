import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../Utils/Theme';
import SearchBar from './Search';

import ExploreSkill from '../Explore/Explore';
import PeopleNearby from '../PeopleNearby/PeopleNeearProfile';
import ProfileStat from './ProfileStat';

const Home = ({navigation}) => {
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar translucent={true} barStyle="dark-content" hidden={false} />
      <View style={styles.container}>
        <SearchBar />
        
    

        {/* ScrollView with proper flex */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >     
          <ProfileStat />
          <View style={styles.sectionHeader}>
            <ExploreSkill />
          </View>

          <View style={styles.peopleCon}>
       
            <PeopleNearby navigation={navigation} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.background,
  },

  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingHorizontal: 20,
    // paddingTop: 10,
  },



  scrollView: {
    flex: 1, // Takes remaining space after header
  },
  
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add bottom padding for better UX
  },

 

 


 

});

export default Home;