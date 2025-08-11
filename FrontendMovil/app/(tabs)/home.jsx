import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSession } from "../../context/SessionContext";
import LogoInmero from "../../components/LogoInmero";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const modules = [
  {
    id: "1",
    title: "Modulo\nInventario",
    icon: "clipboard-check",
    route: "modules/inventories",
    backgroundColor: "#E3F2FD",
  },
  {
    id: "2",
    title: "Modulo\nde IoT",
    icon: "access-point",
    route: "modules/IoT/iotScreen",
    backgroundColor: "#E8F5E8",
  },
  {
    id: "3",
    title: "Modulo\nSeguridad",
    icon: "shield-lock-outline",
    route: "modules/security",
    backgroundColor: "#FFF3E0",
  },
  {
    id: "4",
    title: "Modulo\nReportes",
    icon: "chart-line",
    route: "modules/Reportes/ReportesIndex",
    backgroundColor: "#FFEBEE",
  },
  {
    id: "5",
    title: "Modulo\nCanvas",
    icon: "vector-square",
    route: "modules/Mapa/canvasScreen",
    backgroundColor: "#E0F7FA",
  },
];

export default function Home() {
  const router = useRouter();
  const { empresaSeleccionada, empresasDisponibles, token } = useSession();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log("Token recibido en Home:", token);
  }, [token]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LogoInmero width={140} height={150} />
        </View>
        <View style={styles.headerRight}>
          <Ionicons
            name="share-outline"
            size={20}
            color="#666"
            style={styles.shareIcon}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>¡Bienvenido!</Text>
        </View>

        {/* Empresa actual */}
        <View style={styles.empresaContainer}>
          <Text style={styles.empresaText}>
            Empresa actual: {empresaSeleccionada?.empresaNombre}
          </Text>
          {empresasDisponibles?.length > 1 && (
            <TouchableOpacity
              onPress={() => router.replace("/company/selection")}
            >
              <Text style={styles.cambiarLink}>Cambiar empresa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Módulos */}
        <View style={styles.grid}>
          {modules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.moduleCard,
                { backgroundColor: item.backgroundColor },
              ]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.85}
            >
              <View style={styles.moduleContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color="#666"
                  />
                </View>
                <Text style={styles.moduleTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8, // Reducido de 2 a 8 para dar espacio mínimo
    height: 60, // Altura fija más compacta
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ffffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareIcon: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "600",
    color: "#666",
    fontSize: 12,
  },

  // Contenido
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },

  // Empresa
  empresaContainer: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  empresaText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  cambiarLink: {
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "600",
  },

  // Módulos
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moduleCard: {
    width: "48%",
    height: 140,
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    justifyContent: "center",
  },
  moduleContent: {
    alignItems: "flex-start",
  },
  iconContainer: {
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
});
