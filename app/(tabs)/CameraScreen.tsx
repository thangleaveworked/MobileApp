import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig'; // Đảm bảo Firebase được cấu hình đúng

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (permission?.granted) {
      takeImage();
    }
  }, [permission?.granted]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [6, 9],
      quality: 1,
    });

    console.log(result); // Kiểm tra kết quả trên console

    if (!result.cancelled) {
      setPhotoUri(result.assets[0].uri); // Cập nhật trạng thái hình ảnh với URI của ảnh đã chụp
    }
  };

  const uploadImage = async () => {
    setUploading(true);
    try {
      if (!photoUri) {
        Alert.alert('Error', 'Vui lòng chụp ảnh trước.');
        setUploading(false);
        return;
      }

      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Tạo tham chiếu đến Firebase Storage với tên file duy nhất
      const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const snapshot = await storageRef.put(blob);

      const downloadURL = await snapshot.ref.getDownloadURL();

      setUploading(false);
      Alert.alert('Success', 'Ảnh đã được tải lên thành công!');
      setPhotoUri(null);
      console.log('Image URL:', downloadURL); // Sử dụng URL này để lưu vào cơ sở dữ liệu hoặc hiển thị trong ứng dụng
      
      // Gửi URL ảnh đến server
      sendImageUrlToServer(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      Alert.alert('Error', 'Tải ảnh lên thất bại.');
    }
  };

  const sendImageUrlToServer = async (url) => {
    try {
      const response = await fetch('http://192.168.2.51:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: url }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);
    } catch (error) {
      console.error('Error sending image URL to server:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={takeImage} style={styles.button}>
        <Text style={styles.buttonText}>Chụp ảnh</Text>
      </TouchableOpacity>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: 200, height: 200, marginTop: 20 }} />
      )}

      <TouchableOpacity onPress={uploadImage} style={styles.button}>
        <Text style={styles.buttonText}>Tải lên</Text>
      </TouchableOpacity>

      {uploading && <Text>Uploading...</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});
