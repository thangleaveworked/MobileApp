import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

type IconItem = {
  name: string;
  label: string;
};

const iconData: IconItem[] = [
  'heart', 'food-fork-drink', 'basket', 'calculator', 'airplane',
  'home', 'cart', 'store', 'cellphone', 'ring',
  'church', 'bus-side', 'motorbike', 'medical-bag', 'coffee',
  'trending-up', 'tshirt-crew', 'account-group', 'desktop-mac', 'pine-tree',
  'tree-outline', 'package-variant-closed', 'hamburger', 'image', 'image-area',
  'camera', 'poker-chip', 'dice-multiple', 'home-city',
  'bank', 'rocket', 'mushroom', 'car', 'book-open-page-variant',
  'ice-cream', 'baby-carriage', 'email', 'wheelchair-accessibility', 'music',
].map(name => ({ name, label: name.replace(/-/g, ' ') }));

const IconSelectionScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleIconSelect = (iconName: string) => {
    navigation.navigate('NewGroupScreen' as never, { selectedIcon: iconName } as never);
  };

  const renderIcon = ({ item }: { item: IconItem }) => (
    <TouchableOpacity 
      style={styles.iconContainer}
      onPress={() => handleIconSelect(item.name)}
    >
      <View style={styles.iconCircle}>
        <Icon name={item.name} size={24} color="#FFF" />
      </View>
      {/* <Text style={styles.iconLabel}>{item.label}</Text> */}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn biểu tượng</Text>
        </View>

        <FlatList
          data={iconData}
          renderItem={renderIcon}
          keyExtractor={(item) => item.name}
          numColumns={4}
          contentContainerStyle={styles.iconGrid}
        />
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
  iconGrid: {
    padding: 16,
  },
  iconContainer: {
    width: '25%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#4CAF50',
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
});

export default IconSelectionScreen;