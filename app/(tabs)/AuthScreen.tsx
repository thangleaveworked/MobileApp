import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsLoading(true);

        const body = isLogin ? { "type": "signin", email, password } : { "type": "signup", email, name, password };

        try {
            const response = await fetch(`http://192.168.2.24:5000/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (response.ok) {
                    await handleSuccessResponse(data);
                } else {
                    handleErrorResponse(data);
                }
            } else {
                console.error("Unexpected response:", await response.text());
                Alert.alert("Lỗi", "Kết nối đến máy chủ thất bại !");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessResponse = async (data:any) => {
        console.log(data);
        switch (data.message) {
            case "User signed in successfully!":
            case "User logged in successfully!":
                const savedSuccessfully = await saveUserData(data);
                if (savedSuccessfully) {
                    // Kiểm tra dữ liệu đã lưu
                    const savedData = await AsyncStorage.getItem('userData');
                    if (savedData) {
                        console.log("Dữ liệu đã được lưu:", JSON.parse(savedData));
                        navigation.navigate('ScreenOverView' as never);
                    } else {
                        console.log("Không tìm thấy dữ liệu đã lưu");
                        Alert.alert("Lỗi", "Không thể lưu dữ liệu người dùng");
                    }
                } else {
                    Alert.alert("Lỗi", "Không thể lưu dữ liệu người dùng");
                }
                break;
            case "User registered successfully!":
                Alert.alert("Thành công", "Đăng ký thành công");
                break;
            case "Invalid username or password":
                Alert.alert("Lỗi", "Sai tên đăng nhập hoặc mật khẩu");
                break;
            default:
                console.log(data);
        }
    };

    const saveUserData = async (data:any) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify({
                user_id: data.user_id,
                user_name: data.user_name,
                user_email: data.user_email,
                amount: data.amount,
                categories: data.categories,
                transactions: data.transactions,
                note: data.note
            }));
            return true; // Trả về true nếu lưu thành công
        } catch (error) {
            console.error("Error saving user data:", error);
            return false; // Trả về false nếu có lỗi
        }
    };

    const handleErrorResponse = (data:any) => {
        if (data.message === "Tài khoản đã tồn tại") {
            Alert.alert("Lỗi", data.message);
        } else {
            Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
        }
    };

    const handleForgotPassword = () => {
        // Implement forgot password logic here
        Alert.alert("Quên mật khẩu", "Chức năng đang được phát triển");
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logodomdom.png')}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholderTextColor="#aaa"
                    />
                    {!isLogin && (
                        <TextInput
                            style={styles.input}
                            placeholder="Tên"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#aaa"
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#aaa"
                    />
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text style={styles.switchText}>
                            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                        </Text>
                    </TouchableOpacity>
                    {isLogin && (
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start', // Thay đổi từ 'center' thành 'flex-start'
        alignItems: 'center',
        paddingVertical: 50,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: width * 0.4, // Giảm kích thước logo
        height: width * 0.4, // Giảm kích thước logo
        resizeMode: 'contain',
    },
    formContainer: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#4CAF50',
    },
    input: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 20,
        color: '#4CAF50',
        fontSize: 16,
    },
    forgotPasswordText: {
        marginTop: 15,
        color: '#4CAF50',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default AuthScreen;