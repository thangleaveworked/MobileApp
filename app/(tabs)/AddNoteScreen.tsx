import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

type AddNoteScreenRouteParams = {
  note?: string;
};
type RootStackParamList = {
  ScreenAddTransaction: { note: string };
  // Define other screen params here
};
const AddNoteScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: AddNoteScreenRouteParams }, 'params'>>();
  const [note, setNote] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (route.params?.note) {
      setNote(route.params.note);
    }
  }, [route.params?.note]);

  const handleSaveNote = () => {
    if (isValid) {
      navigation.navigate('ScreenAddTransaction', { note: note });
    } else {
      Alert.alert('Lỗi', 'Không thể lưu. Vui lòng không sử dụng emoji.');
    }
  };

  const containsEmoji = (text:any) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(text);
  };

  const handleNoteChange = (text:any) => {
    setNote(text);
    setIsValid(!containsEmoji(text));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm ghi chú</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.noteInput, !isValid && styles.invalidInput]}
          placeholder="Nhập ghi chú"
          multiline
          value={note}
          onChangeText={handleNoteChange}
        />
      </View>
      {!isValid && <Text style={styles.errorText}>Không được phép sử dụng emoji</Text>}

      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: note.trim() && isValid ? '#4CAF50' : '#e0e0e0' }
        ]}
        onPress={handleSaveNote}
        disabled={!note.trim() || !isValid}
      >
        <Text style={styles.saveButtonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  invalidInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddNoteScreen;