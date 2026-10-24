import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');


const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log("🛠️ Route Params:", route.params); // Debugging: Check what's received

  const userName = route.params?.name ? String(route.params.name) : ""; 

  // Search & Follow State
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  // Fetch Users on Search
  useEffect(() => {
    if (searchQuery.length > 0) {
      axios.get(`${API_BASE_URL}/search_users?name=${searchQuery}`)
        .then(response => {
          setUsers(response.data);
        })
        .catch(error => {
          console.error("❌ Search error:", error);
        });
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async (followeeEmail) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/follow`, {
        followerEmail: "loggedInUserEmail@example.com",  // Replace with actual logged-in user
        followeeEmail
      });

      alert(response.data.message);

      // Refresh search results
      setUsers(users.map(user => 
        user.email === followeeEmail ? { ...user, isFollowing: !user.isFollowing } : user
      ));
    } catch (error) {
      console.error("❌ Follow/Unfollow error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Athelink Fancy Image */}
        <Image source={require('../assets/athelink-fancy.png')} style={styles.logo} />

        {/* Profile, Hello Text, and Notifications Icon */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() =>navigation.navigate('profiles')}>
            <Image source={require('../assets/profile-icon.png')} style={styles.profileIcon} />
          </TouchableOpacity>
          <View style={styles.userTextContainer}>
            <Text style={styles.helloText}>Hello, <Text style={styles.userName}>{userName}</Text></Text> 
          </View>
          <TouchableOpacity style={styles.notificationContainer} onPress={() =>navigation.navigate("Messages")}>
            <Image source={require('../assets/notifications-icon.png')} style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>

        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <TextInput 
            placeholder="Search users..." 
            placeholderTextColor="#FFFFFF" 
            style={styles.searchBar} 
            value={searchQuery} 
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchGap} />
          <TouchableOpacity>
            <Image source={require('../assets/filter-icon.png')} style={styles.filterIcon} />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {users.length > 0 && (
          <FlatList
            data={users}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <View style={styles.userContainer}>
                <Text style={styles.userText}>{item.name}</Text>
                <TouchableOpacity 
                  style={[styles.followButton, item.isFollowing ? styles.unfollowButton : null]}
                  onPress={() => handleFollowToggle(item.email)}
                >
                  <Text style={styles.followButtonText}>
                    {item.isFollowing ? "Unfollow" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Statistics Section */}
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsContainer}>
          <Image source={require('../assets/stats1.png')} style={styles.statsImage1} />
          <Image source={require('../assets/stats2.png')} style={styles.statsImage2} />
        </View>

        {/* Browse by Sport Section */}
        <Text style={styles.sectionTitle}>Browse by Sport</Text>
        <View style={styles.sportsContainer}>
          <View style={styles.sportItem}>
            <Image source={require('../assets/football-icon.png')} style={styles.sportIcon} />
            <Text style={styles.sportText}>Football</Text>
          </View>
          <View style={styles.sportItem}>
            <Image source={require('../assets/volleyball-icon.png')} style={styles.sportIcon} />
            <Text style={styles.sportText}>Volleyball</Text>
          </View>
          <View style={styles.sportItem}>
            <Image source={require('../assets/cricket-icon.png')} style={styles.sportIcon} />
            <Text style={styles.sportText}>Cricket</Text>
          </View>
          <View style={styles.sportItem}>
            <Image source={require('../assets/tennis-icon.png')} style={styles.sportIcon} />
            <Text style={styles.sportText}>Tennis</Text>
          </View>
        </View>

        {/* New Trials Section */}
        <Text style={styles.sectionTitle}>New Trials</Text>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.eventContainer}>
            <Image source={require('../assets/event-logo.png')} style={styles.eventLogo} />
            <View style={styles.eventTextContainer}>
              <Text style={styles.eventName}>Event Name</Text>
              <Text style={styles.eventLocation}>Location</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Image source={require('../assets/home-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PostDetails')}>
          <Image source={require('../assets/community-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Post')}>
          <Image source={require('../assets/create-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
          <Image source={require('../assets/messaging-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Opportunities')}>
          <Image source={require('../assets/opportunities-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingBottom: 80, // Added padding to make room for the bottom navigation bar
  },
  scrollContainer: { 
    paddingBottom: 100 
  },
  logo: { 
    width: '100%', 
    height: 60, 
    resizeMode: 'contain', 
    marginVertical: 10 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    justifyContent: 'space-between' 
  },
  profileIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  userTextContainer: { 
    marginLeft: 10 
  },
  helloText: { 
    fontSize: 13, 
    fontFamily: 'Poppins', 
    color: 'black' 
  },
  userName: { 
    fontSize: 20, 
    fontFamily: 'Poppins', 
    fontWeight: 'bold', 
    color: 'black' 
  },
  notificationContainer: { 
    marginLeft: 'auto' 
  },
  notificationIcon: { 
    width: 30, 
    height: 30 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 16, 
    backgroundColor: '#AE251F', 
    borderRadius: 8, 
    padding: 10, 
    marginTop: 20 
  },
  searchBar: { 
    flex: 0.85, 
    fontSize: 16, 
    color: '#FFFFFF' 
  },
  searchGap: { 
    width: 10 
  },
  filterIcon: { 
    width: 25, 
    height: 25 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Poppins', 
    fontWeight: '600', 
    color: 'black', 
    marginLeft: 16, 
    marginBottom: 12, 
    marginTop: 20 
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  statsImage1: { 
    width: 246, 
    height: 180, 
    borderRadius: 8 
  },
  statsImage2: { 
    width: 89, 
    height: 180, 
    borderRadius: 8 
  },
  sportsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginTop: 15 
  },
  sportItem: { 
    alignItems: 'center' 
  },
  sportIcon: { 
    width: 50, 
    height: 50 
  },
  sportText: { 
    marginTop: 4, 
    fontSize: 14, 
    fontFamily: 'Poppins', 
    fontWeight: 'bold', 
    color: 'black' 
  },
  eventContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginVertical: 10 
  },
  eventLogo: { 
    width: 50, 
    height: 50, 
    marginRight: 10 
  },
  eventTextContainer: { 
    flex: 1 
  },
  eventName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'black' 
  },
  eventLocation: { 
    fontSize: 14, 
    color: 'gray' 
  },
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    backgroundColor: 'white', 
    paddingVertical: 15, 
    bottom: 0, 
    width: '100%',
    position: 'absolute', 
  },
  navIcon: { 
    width: 30, 
    height: 30
  },
  userContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8, 
    margin: 10 
  },
  userText: { 
    fontSize: 16 
  },
  followButton: { 
    padding: 8, 
    backgroundColor: '#AE251F', 
    borderRadius: 5 
  },
  unfollowButton: { 
    backgroundColor: '#666' 
  },
  followButtonText: { 
    color: 'white' 
  }
});

export default HomeScreen;