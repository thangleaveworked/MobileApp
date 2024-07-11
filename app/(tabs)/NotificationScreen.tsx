import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  NotificationScreen: { notifications: Notification[] };
};

type NotificationScreenRouteProp = RouteProp<RootStackParamList, 'NotificationScreen'>;

type Notification = {
  message: string;
  time: string;
};

type NotificationScreenProps = {
  route: NotificationScreenRouteProp;
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { notifications } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>
      <ScrollView>
        {notifications.map((notification, index) => (
          <View key={index} style={styles.notificationItem}>
            <Icon name="bell-outline" size={24} color="#fff" style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  notificationIcon: {
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    color: '#fff',
    marginBottom: 4,
  },
  notificationTime: {
    color: '#888',
    fontSize: 12,
  },
});

export default NotificationScreen;