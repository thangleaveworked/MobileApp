import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ScreenAccountManagement = ({ route, navigation }) => {
    const { userData, onLogout } = route.params;
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem(`profileImage_${userData.user_id}`);
            if (savedImage) {
                setProfileImage(savedImage);
            }
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    };

    const handleChangeProfilePicture = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert("Permission required", "Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const newImageUri = result.assets[0].uri;
            setProfileImage(newImageUri);
            try {
                await AsyncStorage.setItem(`profileImage_${userData.user_id}`, newImageUri);
            } catch (error) {
                console.error('Error saving profile image:', error);
            }
        }
    };

    const handleAccountInfoPress = () => {
        console.log('Account info pressed');
    };

    const handleChangePassword = () => {
        console.log('Change password pressed');
    };

    const handleDeleteAccount = () => {
        console.log('Delete account pressed');
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('AuthScreen');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleOverviewPress = () => {
        navigation.navigate('ScreenOverView');
    };

    const handleAddTransaction = () => {
        navigation.navigate('ScreenAddTransaction');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={scaledSize(20)} color="#000" />
                <Text style={styles.title}>Quản lý tài khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountInfo} onPress={handleAccountInfoPress}>
                <View style={styles.avatarContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userData.user_name ? userData.user_name[0].toUpperCase() : 'U'}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.cameraIcon} onPress={handleChangeProfilePicture}>
                        <Icon name="camera" size={scaledSize(18)} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{userData.user_name}</Text>
                    <Text style={styles.accountEmail}>{userData.user_email}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleChangePassword}>
                <Icon name="lock-reset" size={scaledSize(20)} color="#000" />
                <Text style={styles.optionText}>Thay đổi mật khẩu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleDeleteAccount}>
                <Icon name="delete" size={scaledSize(20)} color="#000" />
                <Text style={styles.optionText}>Xóa tài khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={handleOverviewPress}>
                    <Icon name="home" size={24} color="#757575" />
                    <Text style={styles.tabText}>Tổng quan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handleAddTransaction}>
                    <View style={styles.addButton}>
                        <Icon name="plus" size={30} color="#fff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Icon name="account" size={24} color="#4CAF50" />
                    <Text style={[styles.tabText, styles.activeTabText]}>Tài khoản</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const scaledSize = (size) => {
    const scale = Math.min(width, height) / 375;
    return Math.round(size * scale);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: scaledSize(16),
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scaledSize(16),
    },
    title: {
        fontSize: scaledSize(20),
        fontWeight: 'bold',
        marginLeft: scaledSize(8),
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: scaledSize(12),
        borderRadius: scaledSize(8),
        marginBottom: scaledSize(16),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: scaledSize(50),
        height: scaledSize(50),
        borderRadius: scaledSize(25),
        backgroundColor: '#FFA500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scaledSize(12),
    },
    avatarText: {
        fontSize: scaledSize(20),
        color: 'white',
        fontWeight: 'bold',
    },
    cameraIcon: {
        position: 'absolute',
        right: scaledSize(8),
        bottom: 0,
        backgroundColor: '#4CAF50',
        borderRadius: scaledSize(12),
        width: scaledSize(24),
        height: scaledSize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountDetails: {
        flex: 1,
    },
    accountName: {
        fontSize: scaledSize(16),
        fontWeight: 'bold',
    },
    accountEmail: {
        fontSize: scaledSize(12),
        color: '#888',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: scaledSize(12),
        borderRadius: scaledSize(8),
        marginBottom: scaledSize(8),
    },
    optionText: {
        flex: 1,
        marginLeft: scaledSize(8),
        fontSize: scaledSize(14),
    },
    logoutButton: {
        backgroundColor: 'white',
        padding: scaledSize(12),
        borderRadius: scaledSize(20),
        alignItems: 'center',
        marginTop: scaledSize(16),
    },
    logoutButtonText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: scaledSize(14),
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
        color: '#757575',
    },
    activeTabText: {
        color: '#4CAF50',
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
});

export default ScreenAccountManagement;