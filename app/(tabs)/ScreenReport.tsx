import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MonthPicker from './MonthPicker';
import { StyleSheet } from 'react-native';
import UpdatedChart from './UpdatedChart';


const ScreenReport = () => {
  const [monthlyExpenseData, setMonthlyExpenseData] = useState({
    labels: [],
    datasets: [{ data: [], formattedData: [] }]
  });
  const [monthlyIncomeData, setMonthlyIncomeData] = useState({
    labels: [],
    datasets: [{ data: [], formattedData: [] }]
  });
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  // navagation
  const navigation = useNavigation();
  // activeTrendTab
  const [activeTrendTab, setActiveTrendTab] = useState('expense');
  // useEffect

  useEffect(() => {
    loadUserData();
  }, [selectedMonth, selectedYear]);

  const formatNumberValue = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  const formatNumber = (num) => {
    if (typeof num !== 'string') {
      num = num.toString();
    }
    num = num.replace(/[^\d.]/g, '');
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts[0]; // Chỉ trả về phần nguyên
  };
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.transactions) {
          const transactions = JSON.parse(parsedData.transactions);
          const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear;
          });

          const totalIncomeFiltered = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          const totalExpenseFiltered = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          setTotalIncome(totalIncomeFiltered);
          setTotalExpense(totalExpenseFiltered);

          processTransactions(filteredTransactions);
        } else {
          setTotalIncome(0);
          setTotalExpense(0);
          setMonthlyExpenseData({ labels: [], datasets: [{ data: [] }] });
          setMonthlyIncomeData({ labels: [], datasets: [{ data: [] }] });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error);
    }
  };
  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => activeTrendTab === 'expense' ? `rgba(255, 0, 0, ${opacity})` : `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeWidth: 0
    },
    propsForLabels: {
      fontSize: 10,
    },
    formatYLabel: (value) => formatNumberValue(value)
  };
  const processTransactions = (transactions) => {
    if (!transactions || transactions.length === 0) {
      // Nếu không có giao dịch, đặt dữ liệu mặc định
      setMonthlyExpenseData({
        labels: [],
        datasets: [{ data: [], formattedData: [] }]
      });
      setMonthlyIncomeData({
        labels: [],
        datasets: [{ data: [], formattedData: [] }]
      });
      return;
    }



    const expenseData = {};
    const incomeData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const day = date.getDate();
      const amount = parseFloat(transaction.amount);

      if (transaction.type === 'expense') {
        expenseData[day] = (expenseData[day] || 0) + amount;
      } else if (transaction.type === 'income') {
        incomeData[day] = (incomeData[day] || 0) + amount;
      }
    });

    const expenseDays = Object.keys(expenseData).sort((a, b) => a - b);
    const incomeDays = Object.keys(incomeData).sort((a, b) => a - b);

    setMonthlyExpenseData({
      labels: expenseDays,
      datasets: [{
        data: expenseDays.map(day => expenseData[day]),
        formattedData: expenseDays.map(day => formatNumberValue(expenseData[day]))
      }]
    });

    setMonthlyIncomeData({
      labels: incomeDays,
      datasets: [{
        data: incomeDays.map(day => incomeData[day]),
        formattedData: incomeDays.map(day => formatNumberValue(incomeData[day]))
      }]
    });
  };

  const handleMonthSelect = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowMonthPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo</Text>
      </View>

      {/* ini */}

      {/* Copy */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, activeTrendTab === 'expense' && styles.activeSubTab]}
            onPress={() => setActiveTrendTab('expense')}
          >
            <Text style={[styles.subTabText, activeTrendTab === 'expense' && styles.activeSubTabText]}>Tổng đã chi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, activeTrendTab === 'income' && styles.activeSubTab]}
            onPress={() => setActiveTrendTab('income')}
          >
            <Text style={[styles.subTabText, activeTrendTab === 'income' && styles.activeSubTabText]}>Tổng thu</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={styles.monthPickerButton}>
          <Text style={styles.monthPickerButtonText}>
            {`${selectedMonth + 1}/${selectedYear}`}
          </Text>
        </TouchableOpacity>

        <MonthPicker
          visible={showMonthPicker}
          onClose={() => setShowMonthPicker(false)}
          onSelect={handleMonthSelect}
          selectedDate={new Date(selectedYear, selectedMonth)}
        />
        <Text style={styles.subtitle}> {activeTrendTab === 'expense' ? 'Tổng đã chi' : 'Tổng thu'} </Text>
        {activeTrendTab === 'expense' && monthlyExpenseData.datasets[0].data.length > 0 ? (
          <UpdatedChart
            data={{
              labels: monthlyExpenseData.labels,
              datasets: [{
                data: monthlyExpenseData.datasets[0].data,
              }]
            }}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
            fromZero={true}
          />
        ) : activeTrendTab === 'income' && monthlyIncomeData.datasets[0].data.length > 0 ? (
          <UpdatedChart
            data={{
              labels: activeTrendTab === 'expense' ? monthlyExpenseData.labels : monthlyIncomeData.labels,
              datasets: [{
                data: activeTrendTab === 'expense' ? monthlyExpenseData.datasets[0].data : monthlyIncomeData.datasets[0].data,
              }]
            }}
            chartConfig={chartConfig}
            activeTrendTab={activeTrendTab}
            style={styles.chart}
            fromZero={true}
          />
        ) : (
          <Text>Không có dữ liệu để hiển thị</Text>
        )}
        <Text style={[
          styles.amount,
          {
            color: activeTrendTab === 'expense' ? '#FF0000' : '#4CAF50'
          }
        ]}>
          {activeTrendTab === 'expense' ? '- ' : ''}
          {formatNumber(activeTrendTab === 'expense' ? totalExpense : totalIncome)} đ
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#000',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4CAF50',
  },
  expense: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#FF0000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },

  increase: {
    color: '#FF0000',
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
    alignSelf: 'center',
  },
  totalSection: {
    marginTop: 30,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  income: {
    color: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 16,
    color: '#000',
  },
  subTabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSubTab: {
    backgroundColor: '#4CAF50',
  },
  subTabText: {
    color: '#333',
    fontWeight: '600',
  },
  activeSubTabText: {
    color: '#fff',
  },
  monthPickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  monthPickerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default ScreenReport;