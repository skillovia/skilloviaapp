import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color } from '../../../Utils/Theme';

const ViewService = ({navigation}) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const ReviewItem = ({ name, rating, text }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewerName}>{name}</Text>
      <View style={styles.starsContainer}>{renderStars(rating)}</View>
      <Text style={styles.reviewText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Darnell Mertz - Dog walking</Text>
        </View>

        {/* Main Image */}
        <View style ={styles.imgCon}>

        <Image
          source={{uri: "https://res.cloudinary.com/dmhvsyzch/image/upload/v1733911582/958d3c3fcfaf510ff7bda481f103d10e_zqshfn.jpg"}}
          style={styles.mainImage}
          />
          </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            Passionate about creativity and innovation, this individual thrives on exploring new ideas and pushing boundaries. With a love for nature and travel, they find...
          </Text>

          {/* Experience Level */}
          <Text style={styles.experienceLevel}>Experience level: Expert</Text>
          <View style={styles.starsContainer}>{renderStars(5)}</View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <Icon name="time-outline" size={20} color="#666" />
            <Text style={styles.pricingText}>Hourly rate</Text>
            <Text style={styles.price}>£20 · 2 spark tokens</Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Reviews (120)</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ReviewItem
            name="Winifred Stamm"
            rating={5}
            text="lure voluptatem dicta necessitatibus cupiditate ut. In nulla consequatur voluptatibus voluptatem fugi..."
          />
          
          <ReviewItem
            name="Winifred Stamm"
            rating={5}
            text="lure voluptatem dicta necessitatibus cupiditate ut. In nulla consequatur voluptatibus voluptatem fugi..."
          />
        </View>

        {/* Book Button */}
        <TouchableOpacity onPress={() => navigation.navigate("serviceform")} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop:30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 16,
  },

  imgCon: {
    
    marginHorizontal:20,
  },


  mainImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  descriptionContainer: {
    padding: 16,

  },
  descriptionTitle: {
    fontFamily: 'AlbertSans-Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  experienceLevel: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricingText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
  },
  reviewsContainer: {
    padding: 16,
    
},
reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
},
reviewsTitle: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
},
seeAllText: {
    fontFamily: 'AlbertSans-Medium',
    color: '#666',
},
reviewItem: {
      backgroundColor: Color.gray,

    marginBottom: 16,
    padding:10,
    borderRadius:5
  },
  reviewerName: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  reviewText: {
    fontFamily: 'AlbertSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#FFE135',
    margin: 16,
    padding: 16,
    borderRadius: 40,
    alignItems: 'center',
  },
  bookButtonText: {
    fontFamily: 'AlbertSans-Medium',
    fontSize: 16,
  },
});

export default ViewService;