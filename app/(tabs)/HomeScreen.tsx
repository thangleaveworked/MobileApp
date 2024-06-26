// screens/HomeScreen.tsx
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Chip from '../../components/Chip';
import { useNavigation } from '@react-navigation/native';

const transactions = [
  { icon: 'sports-soccer', name: 'Thể thao', description: 'Thuê sân bóng', amount: '200,000 đ', color: '#FF0000' },
  { icon: 'local-cafe', name: 'Cà phê', description: '', amount: '100,000 đ', color: '#FF0000' },
  { icon: 'fastfood', name: 'Ăn uống', description: '', amount: '920,000 đ', color: '#FF0000' },
  { icon: 'hotel', name: 'Nghỉ Mát', description: '', amount: '3,000,000 đ', color: '#FF0000' },
  { icon: 'shopping-cart', name: 'Mua sắm', description: 'Mua quần áo', amount: '1,500,000 đ', color: '#FF0000' },
  { icon: 'flight', name: 'Du lịch', description: 'Vé máy bay', amount: '5,000,000 đ', color: '#FF0000' },
  { icon: 'school', name: 'Học phí', description: 'Học kỳ mới', amount: '2,500,000 đ', color: '#FF0000' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    alert(`Bạn đã chọn ${item.name}: ${item.amount}`);
  };

  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };
  const navigateToPhoto = () => {
    navigation.navigate('ListPhotos');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Icon name="menu" size={30} color="#fff" />
          <Text style={styles.balance}>27,025,000 đ</Text>
          <Icon name="notifications" size={30} color="#fff" />
        </View>
        <View style={styles.headerBottom}>
          <Chip title="06/2024" />
          <Chip title="THÁNG TRƯỚC" />
          <Chip title="THÁNG NÀY" />
        </View>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.overview}>
          <Text style={styles.overviewTitle}>Tổng quan</Text>
          <View style={styles.overviewContent}>
            <View style={styles.overviewItem}>
              <Text>Tiền vào</Text>
              <Text style={styles.income}>31,245,000 đ</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text>Tiền ra</Text>
              <Text style={styles.expense}>4,220,000 đ</Text>
            </View>
          </View>
          <Text style={styles.total}>27,025,000 đ</Text>
        </View>
        <View style={styles.transactionsHeader}>
          <Text style={styles.date}>23</Text>
          <Text style={styles.balanceDay}>27,025,000 đ</Text>
        </View>
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={index}
            style={styles.transactionItem}
            onPress={() => handleItemPress(transaction)}
          >
            <Icon name={transaction.icon} size={30} color={transaction.color} />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: transaction.color }]}>{transaction.amount}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.cameraButton} onPress={navigateToCamera}>
        <Icon name="camera-alt" size={30} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.PhotoButton} onPress={navigateToPhoto}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    color: '#fff',
    fontSize: 20,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  overview: {
    paddingTop: 100, // Để dành không gian cho phần header khi cuộn
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
  },
  income: {
    color: '#4CAF50',
  },
  expense: {
    color: '#FF0000',
  },
  total: {
    fontSize: 18,
    textAlign: 'right',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  date: {
    fontSize: 30,
  },
  balanceDay: {
    fontSize: 20,
    color: '#4CAF50',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionName: {
    fontSize: 16,
  },
  transactionDescription: {
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 15,
  },
  PhotoButton: {
    position: 'absolute',
    bottom: 30,
    left: 30, // Thay đổi từ 'right' thành 'left'
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 15,
  },
  
});

export default HomeScreen;
