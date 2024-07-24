import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
type RootStackParamList = {
  ExpenseCategoriesScreen: { newCategory?: any };
  NewGroupScreen: { isExpense: boolean };
  ScreenAddTransaction: {
    category: {
      name: string;
      icon: string;
      id: string
    };
    isExpense: boolean;
  };
};

type ExpenseCategoriesScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseCategoriesScreen'>;

type Category = {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_type: 'expense' | 'income';
};

const ExpenseCategoriesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spend' | 'collect'>('spend');
  const [spendCategories, setSpendCategories] = useState<Category[]>([]);
  const [collectCategories, setCollectCategories] = useState<Category[]>([]);
  const navigation = useNavigation();
  const route = useRoute<ExpenseCategoriesScreenRouteProp>();

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );
  const loadCategories = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson != null) {
        const userData = JSON.parse(userDataJson);
        // console.log("=============================================");
        // console.log('UserData:', userData);
        
        let allCategories: Category[];
        if (typeof userData.categories === 'string') {
          allCategories = JSON.parse(userData.categories);
        } else if (Array.isArray(userData.categories)) {
          allCategories = userData.categories;
        } else {
          console.error('Unexpected categories format:', userData.categories);
          return;
        }
        if (Array.isArray(allCategories)) {
          // console.log('Loaded categories:', allCategories);
          const spend = allCategories.filter(cat => cat.category_type === 'expense');
          const collect = allCategories.filter(cat => cat.category_type === 'income');
          // console.log('Spend categories:', spend);
          // console.log('Collect categories:', collect);
          setSpendCategories(spend);
          setCollectCategories(collect);
        } else {
          console.error('Loaded categories are not an array:', allCategories);
        }
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const renderCategories = () => {
    const categories = activeTab === 'spend' ? spendCategories : collectCategories;
    return categories.map((category) => (
      <TouchableOpacity key={category.category_id} style={styles.categoryItem} onPress={() => handleCategorySelect(category)}>
        <View style={[styles.categoryIcon, { backgroundColor: activeTab === 'spend' ? '#FF0000' : '#4CAF50' }]}>
          <Icon name={category.category_icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.categoryName}>{category.category_name}</Text>
      </TouchableOpacity>
    ));
  };
  const handleNewGroup = () => {
    navigation.navigate('NewGroupScreen', {
      isExpense: activeTab === 'spend',
      currentCategories: activeTab === 'spend' ? spendCategories : collectCategories
    });
  };
  const handleCategorySelect = (category: Category) => {
    navigation.navigate('ScreenAddTransaction', {
      category: {
        name: category.category_name,
        icon: category.category_icon,
        id: category.category_id
      },
      isExpense: category.category_type === 'expense'
    });
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn nhóm</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'spend' && styles.activeTab]}
            onPress={() => setActiveTab('spend')}
          >
            <Text style={[styles.tabText, activeTab === 'spend' && styles.activeTabText]}>KHOẢN CHI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'collect' && styles.activeTab]}
            onPress={() => setActiveTab('collect')}
          >
            <Text style={[styles.tabText, activeTab === 'collect' && styles.activeTabText]}>KHOẢN THU</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.newGroupButton}
          onPress={handleNewGroup}
        >
          <Icon name="plus-circle-outline" size={24} color={activeTab === 'spend' ? '#4CAF50' : '#4CAF50'} />
          <Text style={[styles.newGroupText, { color: activeTab === 'spend' ? '#4CAF50' : '#4CAF50' }]}>NHÓM MỚI</Text>
        </TouchableOpacity>

        <ScrollView style={styles.categoriesList}>
          {renderCategories()}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    height: 56,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    color: '#757575',
    fontWeight: 'bold',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  newGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  newGroupText: {
    marginLeft: 16,
    fontWeight: 'bold',
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
  },
});

export default ExpenseCategoriesScreen;