import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailTransaction = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { transactionData } = route.params;

  const handleEditDetailTransaction = () => {
    navigation.navigate('EditDetailTransaction', { transactionData });
  };

  const confirmDelete = async () => {
    try {
      // Xóa giao dịch khỏi AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const transactions = JSON.parse(userData.transactions);
        
        // Lọc ra giao dịch cần xóa
        const updatedTransactions = transactions.filter(
          t => t.transaction_id !== transactionData.transaction_id
        );
        
        // Cập nhật userData với danh sách giao dịch mới
        userData.transactions = JSON.stringify(updatedTransactions);
        
        // Lưu userData đã cập nhật vào AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
  
      // Gửi yêu cầu POST đến server
      const response = await fetch('http://192.168.2.23:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "update_status_transaction",
          transaction_id: transactionData.transaction_id,
          status: "0"
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
  
      // Đóng modal xác nhận xóa
      setShowDeleteConfirm(false);
      navigation.navigate('ScreenOverView' as never);
      // Hiển thị thông báo xóa thành công
    } catch (error) {
      console.error("Error deleting transaction and updating server:", error);
      Alert.alert("Lỗi", "Không thể xóa giao dịch hoặc cập nhật server. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEditDetailTransaction}>
            <Icon name="pencil" size={24} color="#000" style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
            <Icon name="delete" size={24} color="#000" style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={styles.expenseInfo}>
          <View style={[styles.iconContainer, { backgroundColor: transactionData.type === 'income' ? '#4CAF50' : '#FF0000' }]}>
            <Icon name={transactionData.category?.category_icon || 'help-circle'} size={48} color="#FFF" />
          </View>
          <Text style={styles.categoryName}>{transactionData.category?.category_name || 'Unknown'}</Text>
          <Text style={[styles.amount, { color: transactionData.type === 'income' ? '#4CAF50' : '#FF0000' }]}>
            {transactionData.type === 'income' ? '+' : '-'}{transactionData.amount.toLocaleString()} đ
          </Text>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={24} color="#757575" />
            <Text style={styles.detailText}>{new Date(transactionData.date).toLocaleDateString('vi-VN')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="text" size={24} color="#757575" />
            <Text style={styles.detailText}>{transactionData.note || 'Không có ghi chú'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="information" size={24} color="#757575" />
            <Text style={styles.detailText}>{transactionData.description || 'Không có mô tả'}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirm}>
            <Text style={styles.confirmText}>Bạn có chắc chắn muốn xóa giao dịch này?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.cancelButtonText}>KHÔNG</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.confirmButtonText}>ĐỒNG Ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 24,
  },
  expenseInfo: {
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  detailText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirm: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  cancelButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 24,
  },
  confirmButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DetailTransaction;