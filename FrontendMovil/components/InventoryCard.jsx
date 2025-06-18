import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const STATUS = {
  completado: {
    border: "#34D399",
    badgeBg: "#DCFCE7",
    badgeText: "#059669",
    label: "Completado",
  },
  pendiente: {
    border: "#FBBF24",
    badgeBg: "#FEF3C7",
    badgeText: "#D97706",
    label: "Pendiente",
  },
  "sin completar": {
    border: "#EF4444",
    badgeBg: "#FEE2E2",
    badgeText: "#DC2626",
    label: "Sin completar",
  },
};

export default function InventoryCard({
  name,
  id,
  status,
  section,
  subsection,
  onPress,
}) {
  const key = status.toLowerCase();
  const { border, badgeBg, badgeText, label } = STATUS[key] || STATUS.pendiente;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: border }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {/* Header: nombre y chevron */}
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      {/* ID */}
      <Text style={styles.idText}>#{id}</Text>

      {/* Estado */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Estado</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeText }]}>{label}</Text>
        </View>
      </View>

      {/* Sección */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Sección</Text>
        <Text style={styles.value}>{section}</Text>
      </View>

      {/* Subsección */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Subsección</Text>
        <Text style={styles.value}>{subsection}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  idText: {
    fontSize: 14,
    color: "#999",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
