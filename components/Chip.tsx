// components/Chip.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChipProps {
  title: string;
}

const Chip: React.FC<ChipProps> = ({ title }) => {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  text: {
    fontSize: 14,
    color: '#000',
  },
});

export default Chip;
