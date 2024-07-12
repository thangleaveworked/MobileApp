import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditDetailTransaction = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionData } = route.params;
  const [formattedAmount, setFormattedAmount] = useState('');
  const [amount, setAmount] = useState(transactionData.amount.toString());
  const [category, setCategory] = useState(transactionData.category);
  const [note, setNote] = useState(transactionData.note || '');
  const [date, setDate] = useState(new Date(transactionData.date));
  const [description, setDescription] = useState(transactionData.description || '');
  const [showDatePicker, setShowDatePicker] = useState(false);


  useEffect(() => {
    setFormattedAmount(formatNumber(transactionData.amount.toString()));
  }, []);

  const formatNumber = (num:any) => {
    num = num.replace(/[^\d.]/g, '');
    const parts = num.split('.');
    if (parts.length > 2) {
      num = parts[0] + '.' + parts.slice(1).join('');
    }
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };
  const handleAmountChange = (text:any) => {
    const formatted = formatNumber(text);
    setFormattedAmount(formatted);
    setAmount(text.replace(/[^\d.]/g, '')); // Store the raw numeric value
  };
  const handleSave = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const transactions = JSON.parse(userData.transactions);

        // Tìm giao dịch cần cập nhật
        const transactionToUpdate = transactions.find(t => t.transaction_id === transactionData.transaction_id);

        if (!transactionToUpdate) {
          throw new Error('Không tìm thấy giao dịch');
        }

        // Chuẩn bị dữ liệu để gửi đến server
        const updateData = {
          type: "update_transaction",
          user_id: userData.user_id,
          transaction_id: transactionData.transaction_id,
          amount: amount,
          date: date.toLocaleDateString('en-GB'), // Định dạng DD/MM/YYYY
          description: description,
          note: note
        };

        // Gửi yêu cầu POST đến server
        const response = await fetch('http://192.168.2.23:5000/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // Cập nhật AsyncStorage
        const updatedTransactions = transactions.map(t =>
          t.transaction_id === transactionData.transaction_id
            ? {
              ...t,
              amount: parseFloat(amount),
              category_id: category.category_id,
              note,
              date: date.toISOString(),
              description
            }
            : t
        );

        userData.transactions = JSON.stringify(updatedTransactions);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        navigation.navigate('ScreenOverView' as never);

      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      Alert.alert("Lỗi", "Không thể cập nhật giao dịch. Vui lòng thử lại.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  const formatDate = (date:any) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa giao dịch</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>VND</Text>
        <TextInput
          style={styles.amountInput}
          value={formattedAmount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
        />
      </View>


      <TouchableOpacity style={styles.categoryButton}>
        <Icon name={category.category_icon || "help-circle"} size={24} color="#4A90E2" />
        <Text style={styles.categoryText}>{category.category_name}</Text>
      </TouchableOpacity>

      <View style={styles.rowItem}>
        <Icon name="text" size={24} color="#000" />
        <TextInput
          style={styles.itemText}
          value={note}
          onChangeText={setNote}
          placeholder="Thêm ghi chú"
        />
      </View>

      <View style={styles.rowItem}>
        <Icon name="information" size={24} color="#000" />
        <TextInput
          style={styles.itemText}
          value={description}
          onChangeText={setDescription}
          placeholder="Thêm mô tả"
          multiline={true}
        />
      </View>

      <TouchableOpacity style={styles.rowItem} onPress={() => setShowDatePicker(true)}>
        <Icon name="calendar" size={24} color="#000" />
        <Text style={styles.itemText}>{formatDate(date)}</Text>
      </TouchableOpacity>

      {(showDatePicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#000',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryText: {
    marginLeft: 16,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditDetailTransaction;