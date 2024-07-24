import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { firebase } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const UploadMediaFile = () => {
  const [status, setStatus] = useState('picking'); // 'picking', 'uploading', 'processing'
  const navigation = useNavigation();

  useEffect(() => {
    pickAndUploadImage();
  }, []);

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied!', 'Bạn cần cho phép truy cập thư viện.');
      navigation.goBack();
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result && !result.canceled) {
      const compressedImage = await compressImage(result.assets[0].uri);
      await uploadImage(compressedImage);
    } else {
      navigation.goBack(); // Quay lại nếu người dùng hủy chọn ảnh
    }
  };

  const compressImage = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to width 1080, height will adjust automatically
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log('Compressed image size:', manipulatedImage.width, 'x', manipulatedImage.height);
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original URI if compression fails
    }
  };

  const uploadImage = async (uri: string) => {
    setStatus('uploading');
    try {
      if (!uri) {
        throw new Error('Không có ảnh được chọn.');
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const snapshot = await storageRef.put(blob);

      const downloadURL = await snapshot.ref.getDownloadURL();

      console.log('Image URL:', downloadURL);

      await sendUrlToApi(downloadURL);
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      Alert.alert('Thất bại', 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      navigation.goBack();
    }
  };

  const sendUrlToApi = async (url: string) => {
    setStatus('processing');
    try {
      const response = await fetch('http://192.168.2.23:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: "extract_text", user_id: "1", image_url: url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send URL to API');
      }
  
      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data));
  
      if (data && data.description) {
        console.log('Extracted data:', data);
        navigation.navigate('ScreenAddTransaction', { 
          invoiceData: {
            total_amount: data.total_amount,
            date: data.date,
            description: data.description,
            ghichu: data.ghichu
          } 
        });  
        setTimeout(() => {
          Alert.alert('Thành công', 'Ảnh đã được xử lý thành công!');
        }, 500);
      } else {
        throw new Error('Invalid API response structure');
      }
  
    } catch (error) {
      Alert.alert('Error', 'Ảnh không hợp lệ hoặc không có thông tin cần thiết');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>
        {status === 'picking' ? 'Đang mở thư viện ảnh...' :
         status === 'uploading' ? 'Đang tải ảnh lên...' :
         'Đang xử lý ảnh...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default UploadMediaFile;