import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

type DateSortCriteria = 'none' | 'asc' | 'desc';
type AmountSortCriteria = 'none' | 'asc' | 'desc';

type RootStackParamList = {
    DetailTransaction: { transactionData: any };
    ScreenAccountManagement: { userData: UserData };
    ScreenAddTransaction: undefined;
    NotificationScreen: { notifications: { message: string; time: string }[] };
};

type ScreenOverViewProps = {
    navigation: NavigationProp<RootStackParamList>;
};

type UserData = {
    notification?: string;
    transactions: string;
    categories: string;
    amount?: number;
    wallet?: number;
};

type Transaction = {
    type: 'income' | 'expense';
    amount: number;
    date: string;
    category_id: string;
    note: string;
};

type Category = {
    category_id: string;
    category_name: string;
    category_icon: string;
};

const ScreenOverView: React.FC<ScreenOverViewProps> = ({ navigation }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [hasNotification, setHasNotification] = useState(false);
    const [dateSortCriteria, setDateSortCriteria] = useState<DateSortCriteria>('none');
    const [amountSortCriteria, setAmountSortCriteria] = useState<AmountSortCriteria>('none');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString !== null) {
                    const userDataObject: UserData = JSON.parse(userDataString);
                    setUserData(userDataObject);
                    setHasNotification(!!userDataObject.notification);
                }
            } catch (error) {
                console.error("Error retrieving user data:", error);
            }
        };

        fetchUserData();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserData();
        });

        return unsubscribe;
    }, [navigation]);

    const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
            const currentDate = new Date(selectedDate);
            currentDate.setDate(1); // Set to first day of the month
            setShowDatePicker(Platform.OS === 'ios');
            setSelectedDate(currentDate);
            setFilterType('month');
        }
    };

    const handleTransactionPress = (transaction: Transaction, category: Category | undefined) => {
        navigation.navigate('DetailTransaction', {
            transactionData: {
                ...transaction,
                category: category
            }
        });
    };

    const sortTransactions = (transactions: Transaction[]) => {
        return [...transactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            const amountA = a.type === 'income' ? a.amount : -a.amount;
            const amountB = b.type === 'income' ? b.amount : -b.amount;
    
            if (dateSortCriteria !== 'none' && amountSortCriteria !== 'none') {
                // Kết hợp sắp xếp theo cả ngày và giá
                if (dateA !== dateB) {
                    return dateSortCriteria === 'asc' ? dateA - dateB : dateB - dateA;
                } else {
                    return amountSortCriteria === 'asc' ? amountA - amountB : amountB - amountA;
                }
            } else if (dateSortCriteria !== 'none') {
                // Chỉ sắp xếp theo ngày
                return dateSortCriteria === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (amountSortCriteria !== 'none') {
                // Chỉ sắp xếp theo giá
                return amountSortCriteria === 'asc' ? amountA - amountB : amountB - amountA;
            }
    
            // Nếu không có tiêu chí sắp xếp nào được chọn, giữ nguyên thứ tự
            return 0;
        });
    };
    const filterTransactions = (transactions: Transaction[]) => {
        let filtered = transactions;
        if (filterType === 'current') {
            const currentDate = new Date();
            filtered = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() === currentDate.getMonth() &&
                    transactionDate.getFullYear() === currentDate.getFullYear();
            });
        } else if (filterType === 'month') {
            filtered = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() === selectedDate.getMonth() &&
                    transactionDate.getFullYear() === selectedDate.getFullYear();
            });
        }
        return sortTransactions(filtered);
    };

    const handleDateSortToggle = () => {
        setDateSortCriteria(prev => {
            switch (prev) {
                case 'none': return 'desc';
                case 'desc': return 'asc';
                case 'asc': return 'none';
            }
        });
    };

    const handleAmountSortToggle = () => {
        setAmountSortCriteria(prev => {
            switch (prev) {
                case 'none': return 'desc';
                case 'desc': return 'asc';
                case 'asc': return 'none';
            }
        });
    };

    const getDateSortButtonText = () => {
        switch (dateSortCriteria) {
            case 'desc': return 'Ngày ↓';
            case 'asc': return 'Ngày ↑';
            default: return 'Ngày';
        }
    };

    const getAmountSortButtonText = () => {
        switch (amountSortCriteria) {
            case 'desc': return 'Giá ↓';
            case 'asc': return 'Giá ↑';
            default: return 'Giá';
        }
    };

    const handleAccountPress = () => {
        if (userData) {
            navigation.navigate('ScreenAccountManagement', { userData: userData });
        }
    };

    const handleAddTransaction = () => {
        navigation.navigate('ScreenAddTransaction');
    };

    const handleNotificationPress = () => {
        if (userData?.notification) {
            navigation.navigate('NotificationScreen', {
                notifications: [{ message: userData.notification, time: '5 ngày trước' }]
            });
            setHasNotification(false);
        }
    };

    if (!userData) {
        return <Text>Loading...</Text>;
    }

    const transactions: Transaction[] = JSON.parse(userData.transactions);
    const categories: Category[] = JSON.parse(userData.categories);

    const filteredTransactions = filterTransactions(transactions);

    // Tính toán tổng thu nhập và chi phí cố định (không filter)
    const totalIncomeFixed = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenseFixed = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balanceFixed = totalIncomeFixed - totalExpenseFixed;

    // Tính toán tổng số dư bao gồm cả số dư trong ví
    const totalBalance = (userData.wallet || 0) + balanceFixed;

    // Giữ lại phần tính toán đã filter theo tháng
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const groupedTransactions = filteredTransactions.reduce((groups: { [key: string]: Transaction[] }, transaction: Transaction) => {
        const date = new Date(transaction.date).toISOString().split('T')[0]; // Use ISO date string for consistent grouping
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        return dateSortCriteria === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Image source={require('../../assets/images/logodomdomnenxanh.png')} style={styles.logo} />
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balance}>
                            {totalBalance < 0 ? '-' : ''}
                            {Math.abs(totalBalance).toLocaleString()} đ
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationContainer}>
                        <Icon name="bell" size={width * 0.08} color="#fff" />
                        {hasNotification && <View style={styles.notificationBadge} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.headerBottom}>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'all' ? styles.selectedChip : null]}
                        onPress={() => setFilterType('all')}
                    >
                        <Text style={styles.chipText}>TẤT CẢ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'current' ? styles.selectedChip : null]}
                        onPress={() => {
                            setFilterType('current');
                            setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
                        }}
                    >
                        <Text style={styles.chipText}>{`${currentMonth}/${currentYear}`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'month' ? styles.selectedChip : null]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.chipText}>CHỌN THÁNG</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}
                </View>

            </View>
            <ScrollView>
                <View style={styles.overview}>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Tiền vào</Text>
                        <Text style={styles.overviewLabelIncome}>{totalIncome.toLocaleString()} đ</Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Tiền ra</Text>
                        <Text style={styles.overviewLabelExpense}>{totalExpense !== 0 ? '-' + totalExpense.toLocaleString() : '0'} đ</Text>
                    </View>
                    <Text style={styles.overviewTotal}>{balance.toLocaleString()} đ</Text>
                </View>
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sắp xếp theo:</Text>
                    <TouchableOpacity
                        style={[styles.sortButton, dateSortCriteria !== 'none' && styles.activeSortButton]}
                        onPress={handleDateSortToggle}
                    >
                        <Text style={[styles.sortButtonText, dateSortCriteria !== 'none' && styles.activeSortButtonText]}>
                            {getDateSortButtonText()}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, amountSortCriteria !== 'none' && styles.activeSortButton]}
                        onPress={handleAmountSortToggle}
                    >
                        <Text style={[styles.sortButtonText, amountSortCriteria !== 'none' && styles.activeSortButtonText]}>
                            {getAmountSortButtonText()}
                        </Text>
                    </TouchableOpacity>
                </View>
                {sortedDates.map(date => {
                    const dayTransactions = groupedTransactions[date];
                    const dayTotal = dayTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
                    const formattedDate = new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

                    return (
                        <View key={date}>
                            <View style={styles.transactionsHeader}>
                                <Text style={styles.date}>{formattedDate}</Text>
                                <Text style={[styles.balanceDay, { color: dayTotal >= 0 ? '#4CAF50' : '#FF0000' }]}>
                                    {dayTotal.toLocaleString()} đ
                                </Text>
                            </View>
                            {dayTransactions.map((transaction, index) => {
                                const category = categories.find(c => c.category_id === transaction.category_id);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.transactionItem}
                                        onPress={() => handleTransactionPress(transaction, category)}
                                    >
                                        <View style={[
                                            styles.transactionIcon,
                                            { backgroundColor: transaction.type === 'income' ? '#4CAF50' : '#FF0000' }
                                        ]}>
                                            <Icon name={category?.category_icon || 'help-circle'} size={24} color="#fff" />
                                        </View>
                                        <View style={styles.transactionDetails}>
                                            <Text style={styles.transactionName}>{category?.category_name || 'Unknown'}</Text>
                                            <Text style={styles.transactionDescription}>{transaction.note}</Text>
                                        </View>
                                        <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? '#4CAF50' : '#FF0000' }]}>
                                            {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} đ
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Icon name="home" size={24} color="#4CAF50" />
                    <Text style={styles.tabText}>Tổng quan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handleAddTransaction}>
                    <View style={styles.addButton}>
                        <Icon name="plus" size={30} color="#fff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handleAccountPress}>
                    <Icon name="account" size={24} color="#757575" />
                    <Text style={styles.tabText}>Tài khoản</Text>
                </TouchableOpacity>
            </View>
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
        padding: width * 0.05,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceContainer: {
        flex: 1,  // This will make the container take up all available space
        alignItems: 'center',  // This will center the balance text horizontally
        justifyContent: 'center',  // This will center the balance text vertically
    },
    balance: {
        color: '#fff',
        fontSize: width * 0.06,
        fontWeight: 'bold',
        textAlign: 'center',  // This ensures the text itself is centered
    },
    logo: {
        width: width * 0.15,
        height: width * 0.15,
        resizeMode: 'contain',
    },
    notificationContainer: {
        position: 'relative',
        width: width * 0.15,  // Match the width of the logo for symmetry
        alignItems: 'flex-end',  // Align the icon to the right
    },
    notificationBadge: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'red',
        borderRadius: width * 0.01,
        width: width * 0.025,
        height: width * 0.025,
    },
    headerBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: height * 0.02,
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: width * 0.05,
        paddingVertical: height * 0.006,
        paddingHorizontal: width * 0.04,
        marginRight: width * 0.02,
    },
    chipText: {
        color: '#fff',
        fontSize: width * 0.035,
    },
    overview: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
    },
    overviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    overviewLabel: {
        fontSize: 16,
    },
    overviewLabelExpense: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF0000',
    },
    overviewLabelIncome: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    overviewTotal: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 10,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 1,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    balanceDay: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionDescription: {
        fontSize: 14,
        color: '#888',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 60,
    },
    tabItem: {
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerImage: {
        width: width * 0.08,  // Adjust size as needed
        height: width * 0.08,  // Adjust size as needed
        resizeMode: 'contain',
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
    },
    sortLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        width: '30%', // Điều chỉnh chiều rộng của nhãn
    },
    sortButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 5,
        width: '30%', // Tăng chiều rộng của nút
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSortButton: {
        backgroundColor: '#4CAF50',
    },
    sortButtonText: {
        fontSize: 14,
        color: '#333',
    },
    activeSortButtonText: {
        color: '#fff',
    },
});

export default ScreenOverView;