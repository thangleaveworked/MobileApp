import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const navigation = useNavigation();

    const handleSendOTP = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://192.168.2.23:5000/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: "Forgot_password",
                    email: email
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setOtpSent(true);
                Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
            } else {
                Alert.alert("Lỗi", data.message || "Có lỗi xảy ra khi gửi OTP");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = () => {
        // Implement OTP verification logic here
        // For now, we'll just set otpVerified to true
        setOtpVerified(true);
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 8) {
            Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`http://192.168.2.23:5000/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: "update_password",
                    email: email,
                    password: newPassword
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Thành công", "Mật khẩu đã được cập nhật");
                navigation.goBack();
            } else {
                Alert.alert("Lỗi", data.message || "Có lỗi xảy ra khi cập nhật mật khẩu");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!otpSent}
            />
            {otpSent && !otpVerified && (
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                />
            )}
            {otpVerified && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </>
            )}
            {isLoading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={otpSent ? (otpVerified ? handleUpdatePassword : handleVerifyOTP) : handleSendOTP}
                >
                    <Text style={styles.buttonText}>
                        {otpSent ? (otpVerified ? 'Cập nhật mật khẩu' : 'Xác nhận OTP') : 'Gửi mã OTP'}
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4CAF50',
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backText: {
        marginTop: 20,
        color: '#4CAF50',
        fontSize: 16,
    },
});

export default ForgotPasswordScreen;