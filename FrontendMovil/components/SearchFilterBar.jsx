import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchFilterBar({
  value,
  onChangeText,
  onFilterPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Búsqueda"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
        <Ionicons name="options-outline" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 5,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    // sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevación Android
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    // sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevación Android
    elevation: 2,
  },
});
