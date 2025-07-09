/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, SafeAreaView, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './src/screens/Auth/Login';
import Onboarding from './src/screens/Onboarding';
import CreateAccountScreen from './src/screens/Auth/signup';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPsw';
import Otp from './src/screens/Auth/Otp';
import PersonalDetails from './src/screens/Auth/PersonalDetails';
import WelcomeScreen from './src/screens/Auth/WelocmeScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Home from './src/screens/Home/Home';
import Community from './src/screens/Community/Community';
import Profile from './src/screens/Profile/Profile';
import Booking from './src/screens/Booking/Booking';
import SettingsScreen from './src/screens/Settings/Settings';

import AddSkillScreen from './src/screens/Myskills/AddSkill';
import ExprienceLevel from './src/screens/Myskills/ExprienceLevel';
import SkillDescription from './src/screens/Myskills/Description';
import HourlyRate from './src/screens/Myskills/HourlyRate';
import EditProfile from './src/screens/Profile/EditProfile';
import NotificationSettings from './src/screens/Notification/Notification';
import Apperance from './src/screens/Settings/Apperance';
import SecurityScreen from './src/screens/Security/Security';
import HomeIcon from './assets/Icons/explore.svg';
import KYCList from './src/screens/Kyc/KycList';
import IDscreen from './src/screens/Kyc/IDscreen';
import ChangePasswordScreen from './src/screens/Security/ChangPassword';
import SkillDetailsScreen from './src/screens/Myskills/SkillDetails';
// import EmptySkillsScreen from './src/screens/Myskills/EmptySKill';
import PeopleNearProfile from './src/screens/PeopleNearby/PeopleNeearProfile';
import Explore from './src/screens/Explore/Explore';
import ViewService from './src/screens/Booking/BookService/ViewService';
import BookServiceForm from './src/screens/Booking/BookService/BookServiceForm';
import SummaryPage from './src/screens/Booking/BookService/SummaryPage';
import InwardDetails from './src/screens/Booking/BookingInward/InwardDetails';
import ServiceCompleted from './src/screens/Booking/BookingInward/SerciceCompleted';
import MessagesListScreen from './src/screens/Chat/MessagesListScreen';
import ChatScreen from './src/screens/Chat/ChatScreen';
import Notify from './src/screens/Chat/Notify';
import BookingProgress from './src/screens/Booking/BookingOutward/BookingProgress';
import OutwardDetails from './src/screens/Booking/BookingOutward/OutwardDetails';
import WriteReview from './src/screens/Booking/WriteReview';
import CommunityListScreen from './src/screens/Community/CommunityList';
import Feed from './src/screens/Community/Feed';
import SearchScreen from './src/screens/Search/Search';
import UserProfile from './src/screens/Profile/UserProfile';
import BookService from './src/screens/Booking/BookService/BookServiceForm';
import BookingForm from './src/screens/Booking/BookService/BookingForm';
import MySkillsScreen from './src/screens/Myskills/Skills';
import InviteScreen from './src/screens/Invite/Invite';
import TermsAndConditionsScreen from './src/screens/PrivacyTerms/TermsCondition';
import PrivacyPolicyScreen from './src/screens/PrivacyTerms/PrivacyPolicy';
import ExploreList from './src/screens/Explore/ExploreList';
import ExploreAllCategories from './src/screens/Explore/ExploreViewAll';
import LogoutModal from './src/screens/Auth/LogoutModal';
import FollowersFollowingTab from './src/screens/Followers/FollwerList';
import OpenDisputePage from './src/screens/ReviewDispute/OpenDispute';
import EditSkillScreen from './src/screens/Myskills/EditSKill';
import StripeOnboarding from './src/screens/LinkStripe/Stripe';
import Payment from './src/screens/PaymentMethod/Payment';
import WithdrawalManagement from './src/screens/PaymentMethod/WithdrawManagement/Withdraw';
import AddWithdrawal from './src/screens/PaymentMethod/WithdrawManagement/AddWithdraw';
import BillingManagement from './src/screens/PaymentMethod/BillingManagment/Billing';
import AddBillingScreen from './src/screens/PaymentMethod/BillingManagment/AddBilling';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for Home
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        animation: 'shift',
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconSize;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            iconSize = 20; 
          } else if (route.name === 'Booking') {
            iconName = focused ? 'calendar-sharp' : 'calendar-outline';
            iconSize = 20; 
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
            iconSize = 24;
          } else if (route.name === 'User Profile') {
            iconName = focused ? 'person-circle-sharp' : 'person-circle-outline';
            iconSize = 26; 
          }else if (route.name === 'Logout') {
            iconName = 'poweroff';
            iconSize = 20; 
            return <AntDesignIcon name={iconName} size={iconSize} color={color} />;
          }
          

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#1A4D00',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontFamily: 'AlbertSans-Medium', animation: 'shift' },
        tabBarStyle: {
          backgroundColor: '#F0F6E6',
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Community" component={Community} options={{ headerShown: false }} />
      <Tab.Screen name="Booking" component={Booking} options={{ headerShown: false }} />
      <Tab.Screen name="User Profile" component={Profile} options={{ headerShown: false }} />
      <Tab.Screen name="Logout" component={LogoutModal} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const App = () => {

  useEffect(() => {
    SplashScreen.hide();
    

    StatusBar.setBarStyle('light-content', true);
    
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('', true);
      StatusBar.setTranslucent(false);
    }
  }, []);

  return (
    <>
      {/* Global Status Bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#ffff" 
        translucent={false}
        hidden={false}
      />
      
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F6E6' }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="onboard"
            screenOptions={{
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          >
            <Stack.Screen
              name="onboard"
              component={Onboarding}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="signup"
              component={CreateAccountScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="otp"
              component={Otp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="personal"
              component={PersonalDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="forgotpsw"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="home"
              component={HomeTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="search-sc"
              component={SearchScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="myskill"
              component={MySkillsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="skilldetails"
              component={SkillDetailsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="addskill"
              component={AddSkillScreen}
              options={{ headerShown: false }}
            />


<Stack.Screen 
  name="EditSkill" 
  component={EditSkillScreen} 
  options={{ headerShown: false }}
/>


<Stack.Screen
              name="FlowersList"
              component={FollowersFollowingTab}
              options={{ headerShown: false }}
            />

            {/* profile */}

            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="editprofile"
              component={EditProfile}
              options={{ headerShown: false }}
            />

            {/* notification */}

            <Stack.Screen
              name="notification"
              component={NotificationSettings}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="appearance"
              component={Apperance}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="security"
              component={SecurityScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="kyclist"
              component={KYCList}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="id"
              component={IDscreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="editpsw"
              component={ChangePasswordScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="peopleProfile"
              component={PeopleNearProfile}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="explore"
              component={Explore}
              options={{ headerShown: false }}
            />

            <Stack.Screen 
              name="ExploreList" 
              component={ExploreList}
              options={{ headerShown: false }}
            />

            <Stack.Screen 
              name="ExploreAll" 
              component={ExploreAllCategories}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="viewservice"
              component={ViewService}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="bookingform"
              component={BookingForm}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="bookservice"
              component={BookService}
              options={{ headerShown: false }}
            />


<Stack.Screen 
  name="stripe-setup" 
  component={StripeOnboarding} 
  options={{ headerShown: false }}
/>

{/* payment method */}

<Stack.Screen 
  name="payment" 
  component={Payment} 
  options={{ headerShown: false }}
/>

<Stack.Screen 
  name="GetPaid" 
  component={WithdrawalManagement} 
  options={{ headerShown: false }}
/>

<Stack.Screen 
  name="AddWithdrawal" 
  component={AddWithdrawal} 
  options={{ headerShown: false }}
/>

<Stack.Screen 
  name="Bills" 
  component={BillingManagement} 
  options={{ headerShown: false }}
/>

<Stack.Screen 
  name="AddBills" 
  component={AddBillingScreen} 
  options={{ headerShown: false }}
/>




{/* payment method */}



            <Stack.Screen
              name="summarypage"
              component={SummaryPage}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="inwardsDetails"
              component={InwardDetails}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="servicesCompleted"
              component={ServiceCompleted}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="bookingProgress"
              component={BookingProgress}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="outwardDetails"
              component={OutwardDetails}
              options={{ headerShown: false }}
            />

<Stack.Screen
              name="OpenDispute"
              component={OpenDisputePage}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="review"
              component={WriteReview}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Chats"
              component={MessagesListScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="message"
              component={ChatScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="notify"
              component={Notify}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="invite"
              component={InviteScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="terms"
             component={TermsAndConditionsScreen}
              options={{ headerShown: false }
              } /> 

              <Stack.Screen name="policy"
               component={PrivacyPolicyScreen}
                options={{ headerShown: false }} 
                />

            <Stack.Screen
              name="communityList"
              component={CommunityListScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="feed"
              component={Feed}
              options={{ headerShown: false }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

export default App;