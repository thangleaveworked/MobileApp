import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

type RouteParams = {
  ScreenAddTransaction: {
    description?: string;
  };
};
type RootStackParamList = {
  ScreenAddTransaction: { description: string };
  // Add other routes here as needed
};
const AddDescription = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, 'ScreenAddTransaction'>>();
  const [description, setDescription] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (route.params?.description) {
      setDescription(route.params.description);
    }
  }, [route.params?.description]);

  const handleSaveDescription = () => {
    if (isValid) {
      navigation.navigate('ScreenAddTransaction', { description: description });
    } else {
      Alert.alert('Lỗi', 'Không thể lưu. Vui lòng không sử dụng emoji.');
    }
  };

  const containsEmoji = (text:any) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(text);
  };

  const handleDescriptionChange = (text:any) => {
    setDescription(text);
    setIsValid(!containsEmoji(text));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm mô tả</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.descriptionInput, !isValid && styles.invalidInput]}
          placeholder="Nhập mô tả"
          multiline
          value={description}
          onChangeText={handleDescriptionChange}
        />
      </View>
      {!isValid && <Text style={styles.errorText}>Không được phép sử dụng emoji</Text>}

      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: description.trim() && isValid ? '#4CAF50' : '#e0e0e0' }
        ]}
        onPress={handleSaveDescription}
        disabled={!description.trim() || !isValid}
      >
        <Text style={styles.saveButtonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  descriptionInput: {
    flex: 1,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  invalidInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddDescription;