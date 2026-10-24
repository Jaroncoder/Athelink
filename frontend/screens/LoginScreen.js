import React, { useState } from 'react';
import { 
  View, Text, Image, TextInput, TouchableOpacity, 
  StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView, Platform, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { 
        email: email.trim(), 
        password 
      });

      // ✅ Extract user name from response
      const userName = response.data.name;
      console.log("✅ Login Successful, User:", userName);

      Alert.alert("Success", "Login successful!");

      // ✅ Navigate to Home and pass the user name
      navigation.navigate('Home', { name: userName });
      
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Athelink Fancy Image */}
        <Image 
          source={require('../assets/athelink-fancy.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Back Arrow & Log Into Account */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.loginText}>Log into Account</Text>
        </View>

        {/* Email Input */}
        <TextInput 
          style={styles.inputBox} 
          placeholder="Enter your email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={{ marginBottom: 20 }} />

        {/* Password Input with Visibility Toggle */}
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.inputBox} 
            placeholder="Enter your password"
            placeholderTextColor="#777"
            secureTextEntry={!passwordVisible} 
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
            <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? "Logging in..." : "Log In"}</Text>
        </TouchableOpacity>

        {/* ✅ Create New Account Button (Restored) */}
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.createAccountButton}>
          <Text style={styles.createAccountText}>Create New Account</Text>
        </TouchableOpacity>

        {/* Terms & Privacy Policy */}
        <Text style={styles.termsText}>
          By logging in you accept the Terms and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20 },
  logo: { marginTop: 50, width: width * 0.8, height: height * 0.22, resizeMode: 'contain' },

  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 30, marginBottom: 20 },
  backArrow: { position: 'absolute', left: 10 },
  loginText: { fontSize: 20, fontWeight: 'bold', color: 'black', textAlign: 'center', letterSpacing: 1.5 },

  inputBox: { width: '100%', height: 50, borderWidth: 1, borderColor: 'black', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, marginBottom: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  eyeIcon: { position: 'absolute', right: 10 },

  forgotPassword: { color: 'black', alignSelf: 'flex-start', marginBottom: 15, fontSize: 14, marginLeft: 8 },

  loginButton: { backgroundColor: '#AE251F', paddingVertical: 15, width: '100%', borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // ✅ New Account Button
  createAccountButton: { marginTop: 10 },
  createAccountText: { color: '#AE251F', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  termsText: { color: 'grey', fontSize: 12, textAlign: 'center', marginTop: 20, marginBottom: 10 },
});

export default LoginScreen;
