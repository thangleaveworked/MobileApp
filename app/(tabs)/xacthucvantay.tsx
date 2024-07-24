import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function xacthucvantay() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      if (biometricEnabled === 'true') {
        handleBiometricAuth();
      }
    })();
  }, []);

  const handleBiometricAuth = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Xác thực vân tay',
    });

    if (biometricAuth.success) {
      setIsLoggedIn(true);
      Alert.alert('Xác thực thành công');
    } else {
      Alert.alert('Xác thực thất bại');
    }
  };

  if (isLoggedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chào mừng bạn quay lại!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Đang kiểm tra xác thực vân tay...</Text>
    </View>
  );
}