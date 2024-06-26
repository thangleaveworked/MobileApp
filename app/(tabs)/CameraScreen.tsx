import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkPermissionAndTakePhoto();
  }, []);

  const checkPermissionAndTakePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');

    if (status === 'granted') {
      takePhoto();
    } else {
      Alert.alert(
        'Quyền truy cập camera bị từ chối',
        'Vui lòng cấp quyền truy cập camera trong cài đặt để sử dụng tính năng này.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [6, 9],
        quality: 1,
      });

      if (result && !result.canceled) {
        uploadImage(result.assets[0].uri);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      navigation.goBack();
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      if (!uri) {
        throw new Error('Không có ảnh được chụp.');
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const snapshot = await storageRef.put(blob);

      const downloadURL = await snapshot.ref.getDownloadURL();

      console.log('Image URL:', downloadURL);
      sendUrlToApi(downloadURL)
      navigation.navigate('Home');
      setTimeout(() => {
        Alert.alert('Thành công', 'Ảnh đã được tải lên thành công!');
      }, 500);
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      navigation.navigate('Home');
      setTimeout(() => {
        Alert.alert('Thất bại', 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      }, 500);
    } finally {
      setUploading(false);
    }
  };
  const sendUrlToApi = async (url) => {
    try {
      const response = await fetch('http://192.168.2.51:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send URL to API');
      }
  
      const data = await response.json();
      console.log('API response:', data);
    } catch (error) {
      console.error('Error sending URL to API:', error);
      Alert.alert('Error', 'Gửi URL đến API thất bại.');
    }
  };
  if (hasCameraPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>
        {uploading ? 'Đang tải ảnh lên...' : 'Đang chuẩn bị chụp ảnh...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});