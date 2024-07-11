import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScreenAddTransaction = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [amount, setAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isValidDate, setIsValidDate] = useState(true);
  const [category, setCategory] = useState({ name: 'Chọn nhóm', icon: 'help-circle-outline', isExpense: null });
  const [note, setNote] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (route.params?.invoiceData) {
      const { total_amount, date, description, ghichu } = route.params.invoiceData;
      if (total_amount) setAmount(formatNumber(total_amount.toString()));
      if (date && date !== "không đủ thông tin" && isValidDateFormat(date)) {
        setSelectedDate(parseDate(date));
        setIsValidDate(true);
      } else {
        setSelectedDate(new Date());
        setIsValidDate(false);
      }
      if (description) setDescription(description);
      if (ghichu) setNote(ghichu);
    }
  }, [route.params?.invoiceData]);

  useEffect(() => {
    if (route.params?.note) {
      setNote(route.params.note);
    }
  }, [route.params?.note]);

  useEffect(() => {
    if (route.params?.description) {
      setDescription(route.params.description);
    }
  }, [route.params?.description]);

  useEffect(() => {
    if (route.params?.category) {
      setCategory({
        ...route.params.category,
        isExpense: route.params.isExpense,
      });
    }
  }, [route.params?.category]);

  const isValidDateFormat = (dateString) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(dateString);
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const sendDataToServer = async (data) => {
    try {
      console.log('Sending data to server:', data);
      const response = await fetch('http://192.168.2.24:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Server response:', result);
      return result;
    } catch (error) {
      console.error('Error sending data to server:', error);
      throw error;
    }
  };

  const formatNumber = (num: any) => {
    num = num.replace(/[^\d.]/g, '');
    const parts = num.split('.');
    if (parts.length > 2) {
      num = parts[0] + '.' + parts.slice(1).join('');
    }
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleClearPress = () => {
    setAmount('0');
  };

  const handleAmountChange = (text) => {
    const formattedValue = formatNumber(text);
    setAmount(formattedValue);
  };

  const navigateToCamera = () => {
    navigation.navigate('CameraScreen');
  };

  const navigateToAddDescriptionScreen = () => {
    navigation.navigate('AddDescription', { description });
  };

  const navigateToPhoto = () => {
    navigation.navigate('ListPhotosScreen' as never);
  };
  const hasInvalidCharacters = (text : any) => {
    const invalidChars = /[^0-9,]/;
    return invalidChars.test(text);
  };
  const navigateExpenseCategoriesScreen = () => {
    navigation.navigate('ExpenseCategoriesScreen');
  };

  const navigateToAddNoteScreen = () => {
    navigation.navigate('AddNoteScreen', { note });
  };

  const isFormValid = () => {
    const amountValue = parseFloat(amount.replace(/,/g, ''));
    return amountValue > 0 && category.id !== undefined;
  };

  const handleSave = async () => {
    if (isFormValid()) {
      if (hasInvalidCharacters(amount)) {
        Alert.alert('Lỗi', 'Số tiền chứa ký tự không hợp lệ. Vui lòng chỉ sử dụng số và dấu phẩy.');
        return;
      }
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) {
          throw new Error('User data not found. Please log in again.');
        }
        let userData = JSON.parse(userDataString);
  
        const data = {
          type: "insert_transactions",
          user_id: userData.user_id.toString(),
          amount: amount.replace(/,/g, ''),
          category_id: category.id,
          date: isValidDate ? selectedDate.toLocaleDateString('en-GB') : "",
          note: note || "", // Gửi chuỗi rỗng nếu không có ghi chú
          description: description || "", // Gửi chuỗi rỗng nếu không có mô tả
          transaction_type: category.isExpense ? "expense" : "income"
        };
  
        const result = await sendDataToServer(data);
        console.log('Transaction saved:', result);
  
        userData = {
          ...userData,
          amount: result.amount,
          categories: result.categories,
          transactions: result.transactions,
          wallet: result.wallet,
          notification: result.notification
        };
  
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
  
        navigation.navigate('ScreenOverView' as never);
      } catch (error : any) {
        console.error('Error saving transaction:', error);
        Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi lưu giao dịch.');
      }
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền và chọn nhóm trước khi lưu.');
    }
  };

  const getCategoryIconColor = () => {
    if (category.isExpense === null) {
      return '#888888';
    }
    return category.isExpense ? '#FF0000' : '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ScreenOverView' as never)}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm giao dịch</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={navigateToCamera} style={styles.headerIcon}>
            <Icon name="camera" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToPhoto} style={styles.headerIcon}>
            <Icon name="image" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>VND</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          placeholder="0"
        />
        <TouchableOpacity onPress={handleClearPress}>
          <Icon name="close-circle" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.groupSelector} onPress={navigateExpenseCategoriesScreen}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryIconColor() }]}>
          <Icon name={category.icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.groupSelectorText}>{category.name}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.noteInput} onPress={navigateToAddNoteScreen}>
        <Icon name="note" size={24} color="#888" />
        <Text style={styles.noteInputText}>{note || 'Thêm ghi chú'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.noteInput} onPress={navigateToAddDescriptionScreen}>
        <Icon name="note-text-outline" size={24} color="#888" />
        <Text style={styles.noteInputText}>{description || 'Thêm mô tả'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="calendar" size={24} color="#888" />
        <Text style={styles.dateSelectorText}>
          {isValidDate ? selectedDate.toLocaleDateString() : 'Không có ngày tương ứng'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
              setIsValidDate(true);
            }
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: isFormValid() ? '#4CAF50' : '#e0e0e0' }]}
        onPress={handleSave}
        disabled={!isFormValid()}
      >
        <Text style={[styles.saveButtonText, { color: isFormValid() ? '#FFF' : '#888' }]}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: Dimensions.get('window').height / 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currency: {
    fontSize: 16,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupSelectorText: {
    marginLeft: 16,
    color: '#888',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  noteInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  noteInputText: {
    marginLeft: 16,
    color: '#888',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateSelectorText: {
    marginLeft: 16,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScreenAddTransaction;