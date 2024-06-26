import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const UploadMediaFile = () => {
  const [uploading, setUploading] = useState(false);
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [6, 9],
      quality: 1,
    });

    if (result && !result.canceled) {
      uploadImage(result.assets[0].uri);
    } else {
      navigation.goBack(); // Quay lại nếu người dùng hủy chọn ảnh
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
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

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>
        {uploading ? 'Đang tải ảnh lên...' : 'Đang mở thư viện ảnh...'}
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