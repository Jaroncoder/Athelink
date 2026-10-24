import React, { useState } from 'react';
import { 
  View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useVideoPlayer, VideoView } from 'expo-video';
import { API_BASE_URL } from '../config';

const VideoPreview = ({ uri, style }) => {
  const player = useVideoPlayer(uri, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
  });

  return (
    <VideoView 
      style={style} 
      player={player} 
      allowsFullscreen 
      nativeControls 
    />
  );
};

const { width } = Dimensions.get('window');

// Updated Backend URL
const BACKEND_URL = API_BASE_URL;

const PostScreen = () => {
  const navigation = useNavigation();
  const [postTitle, setPostTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your gallery.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!postTitle || !description) {
      Alert.alert("Missing Fields", "Please enter both title and description.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('⏳ Sending post request to:', `${BACKEND_URL}/create_post`);
      
      const response = await axios.post(`${BACKEND_URL}/create_post`, {
        userName: "User Name", // Replace with actual user name
        title: postTitle,
        description: description,
        mediaUrl: media || "",
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Post Response:', response.data);
      Alert.alert("Success", "Post created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('❌ Post Error:', error);
      
      if (error.code === 'ECONNABORTED') {
        Alert.alert("Timeout Error", "Request took too long. Please try again.");
      } else if (!error.response) {
        Alert.alert(
          "Network Error", 
          "Please check your connection and make sure the server is running."
        );
      } else {
        Alert.alert("Post Failed", error.response?.data?.message || "Failed to create post.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Add Post</Text>

        <View style={styles.userContainer}>
          <Image source={require('../assets/user-icon.png')} style={styles.userIcon} />
          <Text style={styles.userName}>User Name</Text>
        </View>

        <Text style={styles.label}>Post Title</Text>
        <TextInput 
          style={styles.inputBox} 
          placeholder="Enter post title" 
          value={postTitle} 
          onChangeText={setPostTitle} 
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={styles.descriptionBox} 
          placeholder="Enter description" 
          value={description} 
          onChangeText={setDescription} 
          multiline
        />

        <TouchableOpacity style={styles.uploadButton} onPress={pickMedia}>
          <Ionicons name="cloud-upload-outline" size={24} color="black" />
          <Text style={styles.uploadText}>Upload Image / Video</Text>
        </TouchableOpacity>

        {media && (
          <View style={styles.mediaPreview}>
            {media.endsWith('.mp4') || media.endsWith('.mov') ? (
              <VideoPreview uri={media} style={styles.media} />
            ) : (
              <Image source={{ uri: media }} style={styles.media} />
            )}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.postButton, isLoading && styles.postButtonDisabled]} 
          onPress={handlePost}
          disabled={isLoading}
        >
          <Text style={styles.postButtonText}>
            {isLoading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 80
  },
  backButton: {
    position: 'absolute',
    top: 61,
    left: 21
  },
  backCircle: {
    width: 49.91,
    height: 49.91,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#AE251F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    textAlign: 'left',
    marginTop: 80,
    marginLeft: 30,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DM Sans',
    color: 'black'
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 30
  },
  userIcon: {
    width: 56,
    height: 56
  },
  userName: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black'
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    marginTop: 30,
    marginLeft: 30
  },
  inputBox: {
    width: width * 0.75,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 30,
    marginTop: 5
  },
  descriptionBox: {
    width: width * 0.75,
    height: 155,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 30,
    marginTop: 5,
    textAlignVertical: 'top',
    paddingTop: 10
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginLeft: 30,
    marginTop: 15,
    width: width * 0.75
  },
  uploadText: {
    fontSize: 14,
    marginLeft: 10
  },
  mediaPreview: {
    marginTop: 15,
    alignItems: 'center'
  },
  media: {
    width: width * 0.75,
    height: 200,
    borderRadius: 8
  },
  postButton: {
    width: width * 0.5,
    backgroundColor: '#AE251F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 30
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  postButtonDisabled: {
    backgroundColor: '#cccccc'
  }
});

export default PostScreen;