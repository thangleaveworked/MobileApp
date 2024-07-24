import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  NewGroupScreen: { 
    selectedIcon?: string; 
    isExpense?: boolean;
    currentCategories: Category[];
  };
  IconSelectionScreen: { currentIcon: string };
  ExpenseCategoriesScreen: { newCategory: any };
};

type NewGroupScreenRouteProp = RouteProp<RootStackParamList, 'NewGroupScreen'>;


type Category = {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_type: 'expense' | 'income';
};

const NewGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<NewGroupScreenRouteProp>();
  const [selectedIcon, setSelectedIcon] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (route.params?.selectedIcon) {
      setSelectedIcon(route.params.selectedIcon);
    }
    if (route.params?.isExpense !== undefined) {
      setIsExpense(route.params.isExpense);
    }
    if (route.params?.currentCategories) {
      setCurrentCategories(route.params.currentCategories);
    }

    fetchUserData();
  }, [route.params]);

  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.user_id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  const validateGroupName = (name: string) => {
    const isDuplicate = currentCategories.some(
      category => category.category_name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage('Trùng tên danh mục');
    } else {
      setErrorMessage('');
    }
  };
  const handleGroupNameChange = (text: string) => {
    setGroupName(text);
    validateGroupName(text);
  };
  const handleIconPress = () => {
    navigation.navigate('IconSelectionScreen' as never, { currentIcon: selectedIcon } as never);
  };

  const handleSave = async () => {
    if (!selectedIcon || !groupName.trim() || !userId) {
      Alert.alert('Lỗi', 'Vui lòng chọn biểu tượng, nhập tên nhóm và đảm bảo đã đăng nhập');
      return;
    }
    if (errorMessage) {
      Alert.alert('Lỗi', errorMessage);
      return;
    }
    setIsSaving(true);
  
    try {
      const response = await fetch('http://192.168.2.23:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "insert_categories",
          user_id: userId.toString(),
          category_name: groupName.trim(),
          category_icon: selectedIcon,
          category_type: isExpense ? 'expense' : 'income'
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
  
      const savedSuccessfully = await saveUserData(responseData);
  
      if (savedSuccessfully) {
        const userDataJson = await AsyncStorage.getItem('userData');
        console.log("Saved userData:", userDataJson);
        if (userDataJson) {
          navigation.navigate('ExpenseCategoriesScreen' as never, { newCategory: JSON.parse(userDataJson) } as never);
        } else {
          throw new Error('Failed to retrieve saved data');
        }
      } else {
        throw new Error('Failed to save user data');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Lỗi', `Không thể lưu nhóm mới: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveUserData = async (data: any) => {
    try {
      const cleanData = {
        user_id: data.user_id,
        user_name: data.user_name,
        user_email: data.user_email,
        amount: data.amount,
        categories: data.categories,
        transactions: data.transactions,
        wallet: data.wallet
      };
      
      const jsonString = JSON.stringify(cleanData);
      console.log('Attempting to save data:', jsonString);
      await AsyncStorage.setItem('userData', jsonString);
      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  };


  const isSaveDisabled = !selectedIcon || !groupName.trim() || !!errorMessage;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhóm mới</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleIconPress}
            >
              <View style={[styles.iconCircle, { backgroundColor: isExpense ? '#FF0000' : '#4CAF50' }]}>
                <Icon name={selectedIcon || 'help-circle-outline'} size={24} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Tên nhóm"
              placeholderTextColor="#757575"
              value={groupName}
              onChangeText={handleGroupNameChange}
            />
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: isExpense ? '#FF0000' : '#4CAF50' }]}>
                <Icon name={isExpense ? "minus-circle-outline" : "plus-circle-outline"} size={24} color="#FFF" />
              </View>
            </View>
            <Text style={styles.pickerText}>{isExpense ? 'Khoản chi' : 'Khoản thu'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled, { backgroundColor: '#4CAF50' }]}
          onPress={handleSave}
          disabled={isSaveDisabled || isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  iconContainer: {
    width: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 66, // Để căn chỉnh với ô input
  },
});

export default NewGroupScreen;