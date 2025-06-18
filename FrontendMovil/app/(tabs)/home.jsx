import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const modules = [
  {
    id: "1",
    title: "Modulo Inventario",
    icon: "clipboard-check",
    route: "modules/inventories",
  },
  {
    id: "2",
    title: "Modulo IoT",
    icon: "access-point",
    route: "modules/iotScreen",
  },
  {
    id: "3",
    title: "Modulo Seguridad",
    icon: "shield-lock-outline",
    route: "modules/security",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Explora las categorías</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>US</Text>
        </View>
      </View>

      {/* Primera fila: Inventario + IoT */}
      <View style={styles.row}>
        {modules.slice(0, 2).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.iconLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color="#777"
                />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Segunda fila: Seguridad alineado a la izquierda */}
      <View style={styles.rowLeft}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(modules[2].route)}
        >
          <View style={styles.iconLeft}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={modules[2].icon}
                size={22}
                color="#777"
              />
            </View>
            <Text style={styles.cardTitle}>{modules[2].title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "bold", color: "#777" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    width: 160,
    height: 120,
    marginBottom: 12,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
});
