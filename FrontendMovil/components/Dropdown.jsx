import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const Dropdown = ({
  label,
  data = [],
  selectedValue,
  onValueChange,
  placeholder = "Selecciona una opción...",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label={placeholder} value={null} />
          {data.map((item) => (
            <Picker.Item key={item.id} label={item.nombre} value={item.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },
});

export default Dropdown;
