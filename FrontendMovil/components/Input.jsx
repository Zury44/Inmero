import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

export default function Input({
  placeholder,
  iconName,
  secureTextEntry,
  value,
  onChangeText,
}) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={iconName} size={20} color="#888" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
