import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface MonthPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (month: number, year: number) => void;
  selectedDate: Date;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ visible, onClose, onSelect, selectedDate }) => {
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [year, setYear] = useState(selectedDate.getFullYear());

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleSelect = () => {
    onSelect(month, year);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <Picker
              style={styles.picker}
              selectedValue={month}
              onValueChange={(itemValue) => setMonth(itemValue)}
            >
              {months.map((monthName, index) => (
                <Picker.Item key={monthName} label={monthName} value={index} />
              ))}
            </Picker>
            <Picker
              style={styles.picker}
              selectedValue={year}
              onValueChange={(itemValue) => setYear(itemValue)}
            >
              {years.map((yearValue) => (
                <Picker.Item key={yearValue.toString()} label={yearValue.toString()} value={yearValue} />
              ))}
            </Picker>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>HỦY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSelect}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  picker: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default MonthPicker;
