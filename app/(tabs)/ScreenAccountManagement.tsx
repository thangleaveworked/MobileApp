import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { firebase } from '../../firebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    AuthScreen: undefined;
    ScreenOverView: undefined;
    ScreenAddTransaction: undefined;
    ScreenAccountManagement: { userData: UserData; onLogout: () => void };
};

type UserData = {
    user_id: string;
    user_name: string;
    user_email: string;
    amount: number;  // Tổng tiền của ví
    wallet: number;  // Số dư hiện tại
    password: string;
};

type ScreenAccountManagementProps = {
    route: RouteProp<RootStackParamList, 'ScreenAccountManagement'>;
    navigation: StackNavigationProp<RootStackParamList, 'ScreenAccountManagement'>;
};

const ScreenAccountManagement: React.FC<ScreenAccountManagementProps> = ({ route, navigation }) => {
    const [userData, setUserData] = useState<UserData>(route.params.userData);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [walletBalance, setWalletBalance] = useState('');
    const [showWalletInput, setShowWalletInput] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadProfileImage();
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handleBiometricAuth = async () => {
        try {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Xác thực vân tay',
            });

            if (biometricAuth.success) {
                await AsyncStorage.setItem('sign_in', JSON.stringify({
                    email: userData.user_email,
                    password: userData.password
                }));
                Alert.alert('Xác thực thành công', 'Thông tin đăng nhập đã được lưu.');
                const signInData = await AsyncStorage.getItem('sign_in');
                console.log(signInData);
            } else {
                Alert.alert('Xác thực thất bại', 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi xác thực vân tay:', error);
            Alert.alert('Lỗi', 'Không thể xác thực vân tay. Vui lòng thử lại sau.');
        }
    };

    const formatNumber = (num: string): string => {
        num = num.replace(/[^\d.]/g, '');
        const parts = num.split('.');
        if (parts.length > 2) {
            num = parts[0] + '.' + parts.slice(1).join('');
        }
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const loadProfileImage = async (): Promise<void> => {
        try {
            const imageRef = firebase.storage().ref().child(`profileImages/${userData.user_id}`);
            const url = await imageRef.getDownloadURL();
            console.log('Firebase Storage URL:', url); // Log URL
            setProfileImage(url);
        } catch (error) {
            console.log('Error loading profile image:', error);
            setProfileImage(null);
        }
    };
    const compressImage = async (uri: string) => {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 500 } }], // Resize to width of 500, height will adjust automatically
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
        );
        return result.uri;
    };

    const handleChangeProfilePicture = async (): Promise<void> => {
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

        if (!result.canceled && result.assets[0].uri) {
            try {
                const compressedUri = await compressImage(result.assets[0].uri);
                const response = await fetch(compressedUri);
                const blob = await response.blob();

                const storageRef = firebase.storage().ref().child(`profileImages/${userData.user_id}`);
                const snapshot = await storageRef.put(blob);

                const downloadURL = await snapshot.ref.getDownloadURL();
                setProfileImage(downloadURL);

                // Update the profile image URL in your database here
                // For example:
                // await updateProfileImageInDatabase(userData.user_id, downloadURL);

                Alert.alert('Success', 'Profile picture has been updated!');
            } catch (error) {
                console.error('Error uploading image:', error);
                Alert.alert('Error', 'Failed to upload image. Please try again later.');
            }
        }
    };

    const handleAccountInfoPress = (): void => {
        console.log('Account info pressed');
    };

    const validatePassword = (password: string): string => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!regex.test(password)) {
            return 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt';
        }
        return '';
    };

    const handleChangePassword = async (): Promise<void> => {
        if (showPasswordInput) {
            const error = validatePassword(newPassword);
            if (error) {
                setPasswordError(error);
                return;
            }

            try {
                const response = await fetch('http://192.168.2.23:5000/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: "update_password",
                        email: userData.user_email,
                        password: newPassword
                    })
                });
                if (response.ok) {
                    Alert.alert(
                        "Thành công",
                        "Mật khẩu đã được cập nhật thành công.",
                        [{
                            text: "OK", onPress: () => {
                                setShowPasswordInput(false);
                                setPasswordError('');
                            }
                        }]
                    );
                    setNewPassword('');
                } else {
                    throw new Error('Lỗi khi cập nhật mật khẩu');
                }
            } catch (error) {
                console.log('Lỗi:', error);
                Alert.alert("Lỗi", "Không thể cập nhật mật khẩu. Vui lòng thử lại sau.");
            }
        } else {
            setShowPasswordInput(true);
            setPasswordError('');
        }
    };

    const handleUpdateWallet = async (): Promise<void> => {
        if (showWalletInput) {
            const unformattedBalance = walletBalance.replace(/,/g, '');
            if (isNaN(Number(unformattedBalance)) || Number(unformattedBalance) < 0) {
                Alert.alert("Lỗi", "Vui lòng nhập số dư hợp lệ.");
                return;
            }

            try {
                const newWalletBalance = Number(unformattedBalance);
                const newAmount = userData.amount + (newWalletBalance - userData.wallet);

                const response = await fetch('http://192.168.2.23:5000/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: "update_wallet",
                        user_id: userData.user_id,
                        wallet: newWalletBalance
                    })
                });

                if (response.ok) {
                    const updatedUserData = {
                        ...userData,
                        wallet: newWalletBalance,
                        amount: newAmount
                    };
                    setUserData(updatedUserData);
                    await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
                    Alert.alert(
                        "Thành công",
                        "Số dư ví tiền mặt đã được cập nhật thành công.",
                        [{ text: "OK", onPress: () => setShowWalletInput(false) }]
                    );
                    setWalletBalance('');
                } else {
                    throw new Error('Lỗi khi cập nhật ví tiền mặt');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                Alert.alert("Lỗi", "Không thể cập nhật ví tiền mặt. Vui lòng thử lại sau.");
            }
        } else {
            setShowWalletInput(true);
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('AuthScreen');
        } catch (error) {
            console.log('Error during logout:', error);
        }
    };

    const handleOverviewPress = (): void => {
        navigation.navigate('ScreenOverView');
    };

    const handleAddTransaction = (): void => {
        navigation.navigate('ScreenAddTransaction');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
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

                <View style={styles.walletInfo}>
                    <Icon name="wallet" size={scaledSize(24)} color="#4CAF50" />
                    <Text style={styles.walletBalanceText}>
                        Số dư ví hiện tại: {userData.wallet !== undefined ? formatNumber(userData.wallet.toString()) : '0'} VNĐ
                    </Text>
                </View>

                {showPasswordInput && (
                    <View style={styles.inputContainer}>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu mới"
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    setPasswordError(validatePassword(text));
                                }}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={togglePasswordVisibility}
                            >
                                <Icon 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#aaa"
                                />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                    </View>
                )}

                <TouchableOpacity style={styles.optionButton} onPress={handleChangePassword}>
                    <Icon name="lock-reset" size={scaledSize(20)} color="#000" />
                    <Text style={styles.optionText}>
                        {showPasswordInput ? "Xác nhận đổi mật khẩu" : "Thay đổi mật khẩu"}
                    </Text>
                </TouchableOpacity>

                {isBiometricSupported && (
                    <TouchableOpacity style={styles.optionButton} onPress={handleBiometricAuth}>
                        <Icon name="fingerprint" size={scaledSize(20)} color="#000" />
                        <Text style={styles.optionText}>Xác thực vân tay</Text>
                    </TouchableOpacity>
                )}

                {showWalletInput && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số dư ví tiền mặt"
                            keyboardType="numeric"
                            value={walletBalance}
                            onChangeText={(text) => setWalletBalance(formatNumber(text))}
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.optionButton} onPress={handleUpdateWallet}>
                    <Icon name="wallet" size={scaledSize(20)} color="#000" />
                    <Text style={styles.optionText}>
                        {showWalletInput ? "Xác nhận cập nhật ví" : "Cập nhật ví tiền mặt"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>

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

const scaledSize = (size: number) => {
    const scale = Math.min(width, height) / 375;
    return Math.round(size * scale);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollViewContent: {
        padding: scaledSize(16),
        paddingBottom: scaledSize(80), // Add extra padding at the bottom to account for the tab bar
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
    inputContainer: {
        backgroundColor: 'white',
        padding: scaledSize(12),
        borderRadius: scaledSize(8),
        marginBottom: scaledSize(8),
    },
    input: {
        height: scaledSize(40),
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: scaledSize(4),
        paddingHorizontal: scaledSize(8),
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
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: scaledSize(12),
        borderRadius: scaledSize(8),
        marginBottom: scaledSize(16),
    },
    walletBalanceText: {
        fontSize: scaledSize(16),
        marginLeft: scaledSize(8),
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: scaledSize(12),
        marginTop: scaledSize(4),
    },passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: scaledSize(4),
    },
    passwordInput: {
        flex: 1,
        height: scaledSize(40),
        paddingHorizontal: scaledSize(8),
    },
    eyeIcon: {
        padding: scaledSize(10),
    },
});

export default ScreenAccountManagement;