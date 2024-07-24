import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
type RootStackParamList = {
  ScreenAddTransaction: { invoiceData: { total_amount: any; date: any; description: any; ghichu: any; }; };
  // Add other screens as needed
};
type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScreenAddTransaction'>;

export default function CameraScreen() {
  const [status, setStatus] = useState('checking'); // 'checking', 'capturing', 'uploading', 'processing'
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // Explicitly define the type
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const navigation1 = useNavigation();
  
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
        [{ text: 'OK', onPress: () => navigation1.goBack() }]
      );
    }
  };

  const takePhoto = async () => {
    setStatus('capturing');
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (result && !result.canceled) {
        await uploadImage(result.assets[0].uri);
      } else {
        navigation1.goBack();
      }
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      navigation1.goBack();
    }
  };
  const compressImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }], // Resize to width of 1000, height will adjust automatically
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
    );
    return result.uri;
  };

  const uploadImage = async (uri: string) => {
    setStatus('uploading');
    try {
      if (!uri) {
        throw new Error('Không có ảnh được chụp.');
      }

      // Compress the image before uploading
      const compressedUri = await compressImage(uri);

      const response = await fetch(compressedUri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const snapshot = await storageRef.put(blob);

      const downloadURL = await snapshot.ref.getDownloadURL();

      console.log('Image URL:', downloadURL);
      await sendUrlToApi(downloadURL);
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      Alert.alert('Thất bại', 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      navigation1.goBack();
    }
  };
  // const uploadImage = async (uri: any) => {
  //   setStatus('uploading');
  //   try {
  //     if (!uri) {
  //       throw new Error('Không có ảnh được chụp.');
  //     }

  //     const response = await fetch(uri);
  //     const blob = await response.blob();

  //     const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
  //     const snapshot = await storageRef.put(blob);

  //     const downloadURL = await snapshot.ref.getDownloadURL();

  //     console.log('Image URL:', downloadURL);
  //     await sendUrlToApi(downloadURL);
  //   } catch (error) {
  //     console.error('Lỗi khi tải ảnh lên:', error);
  //     Alert.alert('Thất bại', 'Tải ảnh lên thất bại. Vui lòng thử lại.');
  //     navigation1.goBack();
  //   }
  // };

  const sendUrlToApi = async (url: any) => {
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

      // Kiểm tra xem data có chứa thông tin cần thiết không
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
      Alert.alert('Error', 'Ảnh không hợp lệ hoặc không có thông tin cần thiết');
      navigation1.goBack();
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
        {status === 'checking' ? 'Đang kiểm tra quyền truy cập camera...' :
          status === 'capturing' ? 'Đang chuẩn bị chụp ảnh...' :
            status === 'uploading' ? 'Đang tải ảnh lên...' :
              'Đang xử lý ảnh...'}
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

