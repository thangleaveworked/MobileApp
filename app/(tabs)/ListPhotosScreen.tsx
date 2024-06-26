// import React, { useState, useEffect } from 'react';
// import { StyleSheet, View, Image, FlatList, Modal, Button, Alert, ActivityIndicator, Text } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { useNavigation } from '@react-navigation/native';
// import { firebase } from '../../firebaseConfig'; // Đảm bảo Firebase được cấu hình đúng

// export default function ListPhotosScreen() {
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [modalVisible, setModalVisible] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [imageUri, setImageUri] = useState(null);
//   const navigation = useNavigation();

//   useEffect(() => {
//     (async () => {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'Permission to access media library is required!');
//         closeListPhotosScreen();
//       } else {
//         await pickImage();
//       }
//     })();
//   }, []);

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [6, 9],
//       quality: 1,
//     });

//     if (!result.cancelled) {
//       setImageUri(result.assets[0].uri); // Cập nhật trạng thái với URI của ảnh đã chọn
//       setSelectedImages(prevImages => [...prevImages, result.assets[0].uri]);
//       await uploadImage(result.assets[0].uri); // Gọi hàm tải lên Firebase
//     } else {
//       closeListPhotosScreen();
//     }
//   };

//   const uploadImage = async (uri) => {
//     setUploading(true);
//     try {
//       if (!uri) {
//         Alert.alert('Error', 'Vui lòng chọn ảnh trước.');
//         setUploading(false);
//         return;
//       }

//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
//       const snapshot = await storageRef.put(blob);

//       const downloadURL = await snapshot.ref.getDownloadURL();

//       setUploading(false);
//       Alert.alert('Success', 'Ảnh đã được tải lên thành công!');
//       setImageUri(null);
//       console.log('Image URL:', downloadURL); // Sử dụng URL này để lưu vào cơ sở dữ liệu hoặc hiển thị trong ứng dụng
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       setUploading(false);
//       Alert.alert('Error', 'Tải ảnh lên thất bại.');
//     }
//   };

//   const closeListPhotosScreen = () => {
//     setModalVisible(false);
//     navigation.navigate('Home');
//   };

//   return (
//     <Modal
//       animationType="slide"
//       visible={modalVisible}
//       onRequestClose={closeListPhotosScreen}
//     >
//       <View style={styles.container}>
//         <Button title="Close List Photos" onPress={closeListPhotosScreen} />
//         {uploading ? (
//           <ActivityIndicator size="large" color="#0000ff" />
//         ) : (
//           <>
//             <FlatList
//               data={selectedImages}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <Image source={{ uri: item }} style={styles.image} />
//               )}
//             />
//             {imageUri && (
//               <Image source={{ uri: imageUri }} style={styles.image} />
//             )}
//           </>
//         )}
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   image: {
//     width: 300,
//     height: 300,
//     resizeMode: 'cover',
//     marginVertical: 10,
//   },
// });
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList, Modal, Button, Alert, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebaseConfig'; // Đảm bảo Firebase được cấu hình đúng

export default function ListPhotosScreen() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access media library is required!');
        closeListPhotosScreen();
      } else {
        await pickImage();
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [6, 9],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.assets[0].uri); // Cập nhật trạng thái với URI của ảnh đã chọn
      setSelectedImages(prevImages => [...prevImages, result.assets[0].uri]);
      await uploadImage(result.assets[0].uri); // Gọi hàm tải lên Firebase
    } else {
      closeListPhotosScreen();
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      if (!uri) {
        Alert.alert('Error', 'Vui lòng chọn ảnh trước.');
        setUploading(false);
        return;
      }
  
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const storageRef = firebase.storage().ref().child(`images/${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const snapshot = await storageRef.put(blob);
  
      const downloadURL = await snapshot.ref.getDownloadURL();
  
      // Gọi hàm gửi URL đến API
      await sendUrlToApi(downloadURL);
  
      setUploading(false);
      Alert.alert('Success', 'Ảnh đã được tải lên thành công!');
      setImageUri(null);
      console.log('Image URL:', downloadURL); // Sử dụng URL này để lưu vào cơ sở dữ liệu hoặc hiển thị trong ứng dụng
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      Alert.alert('Error', 'Tải ảnh lên thất bại.');
    }
  };
  
  const sendUrlToApi = async (url) => {
    try {
      const response = await fetch('http://192.168.2.51:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
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
  

  const closeListPhotosScreen = () => {
    setModalVisible(false);
    navigation.navigate('Home');
  };

  return (
    <Modal
      animationType="slide"
      visible={modalVisible}
      onRequestClose={closeListPhotosScreen}
    >
      <View style={styles.container}>
        <Button title="Close List Photos" onPress={closeListPhotosScreen} />
        {uploading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <FlatList
              data={selectedImages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.image} />
              )}
            />
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    marginVertical: 10,
  },
});
