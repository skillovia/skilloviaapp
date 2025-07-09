import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';


const { width } = Dimensions.get('window');

const WalletPockets = ({ cash_balance, spark_token_balance }) => {
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    cash: cash_balance || 0,
    tokens: spark_token_balance || 0,
    currency: 'gbp',
  });

  // Function to fetch the latest balance
  const fetchBalance = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/wallet/balance');
      
      if (response.data) {
        setBalanceData({
          cash: response.data.balance || 0,
          tokens: response.data.spark_tokens || 0,
          currency: response.data.currency || 'gbp',
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      Alert.alert(
        'Error',
        'Failed to fetch wallet balance. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, []);

  const handleRefresh = () => {
    fetchBalance();
  };

  const pockets = [
    {
      title: 'Cash balance',
      amount: balanceData.cash,
      iconName: 'attach-money',
      bgColor: Color.primary, 
      textColor: Color.secondary,
    },
    {
      title: 'Spark tokens',
      amount: balanceData.tokens,
      iconName: 'stars',
      bgColor: Color.secondary, 
      textColor: '#fff',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pockets</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
        
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1A4D00" />
          ) : (
            <Icon name="refresh" size={24} color="#1A4D00" />
          )}
        
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {pockets.map((pocket, index) => (
          <View
            key={index}
            style={[
              styles.pocketCard,
              { backgroundColor: pocket.bgColor },
            ]}
          >
            <View style={styles.pocketHeader}>
              <Text style={[styles.pocketTitle, { color: pocket.textColor }]}>
                {pocket.title}
              </Text>
              <Icon
                name={pocket.iconName}
                size={24}
                color={pocket.textColor}
                style={styles.pocketIcon}
              />
            </View>
            <View style={styles.amountContainer}>
              {index === 0 && (
                <Text style={[styles.currencySymbol, { color: pocket.textColor }]}>
                  £
                </Text>
              )}
              <Text style={[styles.amount, { color: pocket.textColor }]}>
                {pocket.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {pockets.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === 0 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    // paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans-Medium',
    color: '#374151',
  },

  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    marginBottom: 12,
  },

  pocketCard: {
    width: width * 0.7,
    maxWidth: 280,
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
  
  },
  pocketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pocketTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans-Bold',
  },
  pocketIcon: {
    opacity: 0.7,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Medium',
    marginRight: 2,
  },
  amount: {
    fontSize: 24,
    fontFamily: 'AlbertSans-Bold',
  },
 
});

export default WalletPockets;