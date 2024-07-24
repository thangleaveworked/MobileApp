import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const [passwordError, setPasswordError] = useState('');
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState(true);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        checkBiometricSupport();
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            setEmail('');
            setPassword('');
            setName('');
            setPasswordError('');
            if (!isLogin) {
                setIsRegisterButtonDisabled(true);
            }
        }, [isLogin])
    );
    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);
    };

    const handleBiometricAuth = async () => {
        try {
            const savedSignInData = await AsyncStorage.getItem('sign_in');
            if (!savedSignInData) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập đã lưu");
                return;
            }

            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Xác thực vân tay để đăng nhập',
            });

            if (biometricAuth.success) {
                const { email, password } = JSON.parse(savedSignInData);
                console.log("Dữ liệu đăng nhập:", { email, password });
                await handleSignIn(email, password);
            } else {
                Alert.alert("Xác thực thất bại", "Vui lòng thử lại.");
            }
        } catch (error) {
            console.error('Lỗi xác thực vân tay:', error);
            Alert.alert("Lỗi", "Không thể xác thực vân tay. Vui lòng thử lại sau.");
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://192.168.2.23:5000/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: "signin", email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                await handleSuccessResponse(data);
            } else {
                handleErrorResponse(data);
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setIsLoading(false);
        }
    };
    const handleForgotPassword = () => {
        navigation.navigate('ForgotPasswordScreen' as never);
    };

    const validatePassword = (password: string) => {
        if (!isLogin) {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
            if (!regex.test(password)) {
                setPasswordError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt');
                return false;
            }
        }
        setPasswordError('');
        return true;
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (!isLogin) {
            const isValid = validatePassword(text);
            setIsRegisterButtonDisabled(!isValid);
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert("Lỗi", "Vui lòng nhập một địa chỉ email hợp lệ");
            return;
        }
        if (!isLogin) {
            if (!validatePassword(password)) {
                return;
            }
        }

        setIsLoading(true);

        const body = isLogin
            ? { "type": "signin", email, password }
            : { "type": "signup", email, name, password };
        try {
            const response = await fetch(`http://192.168.2.23:5000/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                await handleSuccessResponse(data);
            } else {
                handleErrorResponse(data);
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessResponse = async (data: any) => {
        switch (data.message) {
            case "User signed in successfully!":
            case "User logged in successfully!":
                const savedSuccessfully = await saveUserData(data);
                if (savedSuccessfully) {
                    const savedData = await AsyncStorage.getItem('userData');
                    console.log("Dữ liệu người dùng đã lưu:", savedData);
                    if (savedData) {
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
                Alert.alert("Thành công", "Đăng ký thành công", [
                    { text: "OK", onPress: () => setIsLogin(true) }
                ]);
                break;
            default:
                Alert.alert("Thông báo", data.message || "Có lỗi xảy ra");
        }
    };

    const saveUserData = async (data: any) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify({
                user_id: data.user_id,
                user_name: data.user_name,
                user_email: data.user_email,
                amount: data.amount,
                categories: data.categories,
                transactions: data.transactions,
                note: data.note,
                wallet: data.wallet,
                password: password
            }));
            return true;
        } catch (error) {
            console.error("Error saving user data:", error);
            return false;
        }
    };

    const handleErrorResponse = (data: any) => {
        if (data.message === "Email đã được sử dụng") {
            Alert.alert("Lỗi", data.message);
        } else if (data.message === "Missing required fields") {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
        } else {
            Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
        }
    };

    const toggleLoginMode = () => {
        setIsLogin(!isLogin);
        setPasswordError('');
        setPassword('');
        setIsRegisterButtonDisabled(!isLogin);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
            >

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
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#aaa"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Icon
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color="#aaa"
                            />
                        </TouchableOpacity>
                    </View>
                    {!isLogin && passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                    <View style={styles.buttonContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#4CAF50" />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.button, (!isLogin && isRegisterButtonDisabled) ? styles.disabledButton : null]}
                                    onPress={handleSubmit}
                                    disabled={!isLogin && isRegisterButtonDisabled}
                                >
                                    <Text style={styles.buttonText}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
                                </TouchableOpacity>
                                {isLogin && isBiometricSupported && (
                                    <TouchableOpacity
                                        style={styles.fingerprintButton}
                                        onPress={handleBiometricAuth}
                                    >
                                        <Icon name="fingerprint" size={24} color="#4CAF50" />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                    <TouchableOpacity onPress={toggleLoginMode}>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
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
    // button: {
    //     backgroundColor: '#4CAF50',
    //     paddingVertical: 12,
    //     paddingHorizontal: 30,
    //     borderRadius: 25,
    //     alignItems: 'center',
    //     marginTop: 10,
    //     width: '100%',
    // },
    disabledButton: {
        backgroundColor: '#ccc',
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
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: -10,
        marginBottom: 10,
        alignSelf: 'flex-start',
    }, buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        flex: 1,
    },
    fingerprintButton: {
        padding: 10,
        marginLeft: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#4CAF50',
    }, passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
});

export default AuthScreen;