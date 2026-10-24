import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { name, email } = route.params || {};  

  const [step, setStep] = useState(1);  
  const [dateOfBirth, setDateOfBirth] = useState(null);  
  const [age, setAge] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [heightValue, setHeightValue] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [sport, setSport] = useState('');

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const userAge = calculateAge(selectedDate);
      if (userAge < 13) {
        setError('You must be at least 13 years old to use this app.');
        setDateOfBirth(null);
        setAge('');
      } else {
        setDateOfBirth(selectedDate);
        setAge(userAge.toString());
        setError('');
      }
    }
    setShowPicker(false);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let userAge = today.getFullYear() - birthDate.getFullYear();
    
    if (
      today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      userAge -= 1;
    }
    return userAge;
  };

  const handleProfileSubmit = async () => {
    if (!dateOfBirth || !age || !heightValue || !weightValue || !sport) {
      Alert.alert("Error", "Please fill all the fields.");
      return;
    }

    setLoading(true);
    setError('');

    const profileData = {
      name,
      email,
      dateOfBirth: dateOfBirth.toISOString(),
      age,
      height: heightValue,
      weight: weightValue,
      sport
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/profile_setup`, profileData);
      console.log("✅ Profile setup success:", response.data);
      navigation.navigate('AdditionalProfileScreen', profileData);
    } catch (error) {
      console.error("❌ Profile setup error:", error);
      console.error("❌ Error response:", error.response);
      setError(error.response?.data?.message || "Profile setup failed. Please try again.");
      Alert.alert("Error", error.response?.data?.message || "Profile setup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/athelink-fancy.png')} 
        style={styles.logo}
        resizeMode="contain"  
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Complete Your Profile</Text>

        {step === 1 && (
          <>
            <TextInput 
              style={styles.inputBox} 
              value={name} 
              editable={false} 
              placeholder="Full Name" 
            />

            <TouchableOpacity 
              onPress={() => setShowPicker(true)} 
              style={styles.datePicker}
            >
              <Text style={[styles.dateText, !dateOfBirth && { color: 'gray' }]}>
                {dateOfBirth ? dateOfBirth.toLocaleDateString('en-GB') : 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker 
                value={dateOfBirth || new Date()} 
                mode="date" 
                display="spinner" 
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {age ? (
              <TextInput 
                style={styles.inputBox} 
                placeholder="Age" 
                value={age} 
                editable={false} 
              />
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.nextButton, !dateOfBirth && styles.disabledButton]} 
              onPress={() => setStep(2)}
              disabled={!dateOfBirth}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput 
              style={styles.inputBox} 
              placeholder="Height (cm)" 
              value={heightValue} 
              onChangeText={setHeightValue} 
              keyboardType="numeric" 
            />
            <TextInput 
              style={styles.inputBox} 
              placeholder="Weight (kg)" 
              value={weightValue} 
              onChangeText={setWeightValue} 
              keyboardType="numeric" 
            />
            <TextInput 
              style={styles.inputBox} 
              placeholder="Sport Specialization" 
              value={sport} 
              onChangeText={setSport} 
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.nextButton, loading && styles.disabledButton]} 
              onPress={handleProfileSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.nextButtonText}>Next</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  logo: {
    marginTop: 50,
    width: width * 0.8,
    height: height * 0.22,
    resizeMode: 'contain'
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  inputBox: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 15
  },
  datePicker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  dateText: {
    fontSize: 16,
    color: 'black'
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10
  },
  nextButton: {
    backgroundColor: '#AE251F',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  disabledButton: {
    opacity: 0.6
  }
});

export default ProfileSetupScreen;