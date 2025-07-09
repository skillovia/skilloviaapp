/* eslint-disable quotes */
import React from "react";
import { View, Text, SectionList, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; 
import { Color } from "../../Utils/Theme";

const SettingsScreen = ({ navigation }) => {
  const sections = [
    {
      title: "My Skillovia",
      data: [
        { title: "My skills", icon: "book", route: "myskill" },
        { title: "Edit profile", icon: "person", route: "editprofile" },
        { title: "KYC", icon: "id-card", route: "kyclist" },
        { title: "Invite friends", icon: "share-social", route: "invite" },
 
        { title: "Fund account", icon: "wallet", route: "Fund" },
        { title: "Link Stripe", icon: "link", route: "stripe-setup" },
  
        
      ],
    },
    {
      title: "General",
      data: [
        { title: "Security", icon: "shield-checkmark", route: "security" },
        { title: "Payment settings", icon: "card", route: "payment" },
        { title: "Notifications settings", icon: "notifications", route: "notification" },
        // { title: "Linked Devices", icon: "laptop", route: "LinkedDevices" },
        // { title: "Appearance", icon: "color-palette", route: "appearance" },
      ],
    },
    {
      title: "Legal & Support",
      data: [
        { title: "Terms of Service", icon: "document-text", route: "terms" },
        { title: "Privacy Policy", icon: "lock-closed", route: "policy" },
        { title: "Help Center", icon: "help-circle", route: "HelpCenter" },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* <StatusBar translucent={true} barStyle="dark-content" hidden={false} /> */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerContainer}>
        <View style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </View>
        <Text style={styles.header}>Settings</Text>
      </TouchableOpacity>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}
          >
            <Icon name={item.icon} size={20} color="#6B7280" style={styles.icon} />
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: "row", 
    paddingHorizontal: 16,
    paddingVertical: 10, 
  },
  header: {
    fontSize: 20,
    fontFamily: 'AlbertSans-Bold',
    paddingHorizontal: 5,
    color: Color.text,
  },
  sectionHeader: {
    fontSize: 14,
    padding: 6,
    paddingHorizontal: 16,
    fontFamily: 'AlbertSans-Bold',
    marginVertical: 8,
    color: Color.text,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: Color.gray,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 15,
    color: "#374151",
    fontFamily: 'AlbertSans-Medium',
  },
});

export default SettingsScreen;
