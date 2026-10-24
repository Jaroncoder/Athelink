import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']); // ✅ 5-digit OTP
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const otpInputs = useRef([]);

  // Handle OTP Change
  const handleOtpChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Handle Name & Email Submission (Step 1)
  const handleSignUp = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please enter your name and email.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, { name, email });
      console.log(response.data);
      setStep(2); // Move to OTP verification step
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Signup failed.");
      console.error(error);
    }
  };

  // Handle OTP Verification (Step 2)
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 5) { // ✅ Ensure 5 digits
      Alert.alert("Error", "Please enter the full OTP.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/verify_otp`, { email, otp: otpCode });
      console.log(response.data);
      setStep(3); // Move to password setup step
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "OTP verification failed.");
      console.error(error);
    }
  };

  // Handle Password Submission (Step 3)
  const handlePasswordSetup = async () => {
    if (password === confirmPassword) {
      try {
        const response = await axios.post(`${API_BASE_URL}/password_setup`, { email, password });
        console.log(response.data);
        navigation.navigate('ProfileSetup', { name, email });  // ✅ Pass email to Profile Setup
      } catch (error) {
        console.error(error.response.data);
      }
    } else {
      setPasswordError('Passwords do not match.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/athelink-fancy.png')} style={styles.logo} resizeMode="contain" />
      {step === 1 ? (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TextInput style={styles.inputBox} placeholder="Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.inputBox} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TouchableOpacity style={styles.nextButton} onPress={handleSignUp}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : step === 2 ? (
        <>
          <Text style={styles.title}>Verify OTP</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputs.current[index] = ref)}
                style={styles.otpBox}
                placeholder="•"
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleVerifyOtp}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Set New Password</Text>
          <TextInput style={styles.inputBox} placeholder="Enter New Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.inputBox} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <TouchableOpacity style={styles.nextButton} onPress={handlePasswordSetup}>
            <Text style={styles.nextButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ✅ **Styles Object (Missing Previously)**
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', paddingHorizontal: 16 },
  logo: { marginTop: 50, width: width * 0.8, height: height * 0.22, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputBox: { width: '100%', height: 50, borderWidth: 1, borderColor: 'black', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, marginBottom: 15 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  otpBox: { width: 50, height: 50, borderWidth: 1, borderColor: 'black', borderRadius: 8, fontSize: 22, textAlign: 'center', marginHorizontal: 5 },
  nextButton: { backgroundColor: '#AE251F', paddingVertical: 15, width: '100%', borderRadius: 10, alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 10 },
});

export default SignUpScreen;
