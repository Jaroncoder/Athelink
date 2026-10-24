import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const AdditionalProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // ✅ Retrieve existing data from ProfileSetupScreen
  const { name, dateOfBirth, age, heightValue, weightValue, sport, email } = route.params || {};

  // ✅ Step 3: Additional Data (Optional)
  const [achievements, setAchievements] = useState('');
  const [team, setTeam] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

  // ✅ Handle Profile Completion
  const handleFinishProfile = async () => {
    // ✅ Prepare Data (Only include non-empty fields)
    const profileData = {
      ...(achievements && { achievements }),
      ...(team && { team }),
      ...(careerGoal && { careerGoal }),
    };

    console.log("📤 Sending Additional Profile Data:", profileData);

    try {
      const response = await axios.post(`${API_BASE_URL}/additional_profile`, {
        email, // ✅ Use email for updating existing user
        ...profileData
      });
      console.log("✅ Profile updated:", response.data);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.navigate('Home'); // ✅ Navigate to HomeScreen
    } catch (error) {
      console.error("❌ Profile update error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Profile update failed.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ✅ Athelink Fancy Image */}
        <Image 
          source={require('../assets/athelink-fancy.png')} 
          style={styles.logo}
          resizeMode="contain"  
        />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>

          {/* ✅ Auto-Filled Name (Read-Only) */}
          <TextInput 
            style={styles.inputBox} 
            value={name} 
            editable={false} 
            placeholder="Full Name"
          />

          {/* ✅ Achievements (Optional) */}
          <TextInput 
            style={styles.inputBox} 
            placeholder="Achievements (Optional)" 
            value={achievements} 
            onChangeText={setAchievements} 
          />

          {/* ✅ Current Team (Optional) */}
          <TextInput 
            style={styles.inputBox} 
            placeholder="Current Team/Club (Optional)" 
            value={team} 
            onChangeText={setTeam} 
          />

          {/* ✅ Career Goal (Optional) */}
          <TextInput 
            style={styles.inputBox} 
            placeholder="Career Goal (Optional)" 
            value={careerGoal} 
            onChangeText={setCareerGoal} 
            multiline
          />

          {/* ✅ Finish Profile Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleFinishProfile}>
            <Text style={styles.submitButtonText}>Finish Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', paddingHorizontal: 16 },
  scrollContainer: { paddingBottom: 50, alignItems: 'center' },
  logo: { marginTop: 50, width: width * 0.8, height: height * 0.22, resizeMode: 'contain' },
  formContainer: { width: '100%', alignItems: 'center', marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputBox: { width: '100%', height: 50, borderWidth: 1, borderColor: 'black', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, marginBottom: 15 },
  submitButton: { backgroundColor: '#AE251F', paddingVertical: 15, width: '100%', borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default AdditionalProfileScreen;
