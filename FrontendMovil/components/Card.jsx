import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AccentCard({ name, id, contactInfo, onPress }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} {...(onPress && { onPress })}>
      {/* Acento lateral */}
      <View style={styles.accent} />

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
        <Text style={styles.idText}>#{id}</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="call-outline"
            size={16}
            color="#666"
            style={styles.icon}
          />
          <Text style={styles.value}>{contactInfo}</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    // sombra ligera
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accent: {
    width: 6,
    backgroundColor: "#2196F3",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  idText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
});
