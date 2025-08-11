import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSession } from "../../../context/SessionContext";

const reportes = [
  {
    id: "1",
    title: "Reporte de\nPedido",
    description: "Pedidos realizados y pendientes",
    icon: "clipboard-list-outline",
    route: "/modules/Reportes/reportePedido",
    backgroundColor: "#E3F2FD",
  },
  {
    id: "2",
    title: "Reporte de\nKardex",
    description: "Control de movimientos de inventario",
    icon: "chart-line",
    route: "/modules/Reportes/reporteKardex",
    backgroundColor: "#E8F5E8",
  },
  {
    id: "3",
    title: "Reporte de\nProductos Vencidos",
    description: "Productos próximos a vencer y vencidos",
    icon: "alert-circle-outline",
    route: "/modules/Reportes/reporteProductosVencidos",
    backgroundColor: "#FFF3E0",
  },
  {
    id: "4",
    title: "Reporte de\nFactura",
    description: "Facturas emitidas y por cobrar",
    icon: "receipt",
    route: "/modules/Reportes/reporteFactura",
    backgroundColor: "#FFEBEE",
  },
  {
    id: "5",
    title: "Reporte de\nOrden Compra",
    description: "Órdenes de compra y proveedores",
    icon: "cart-outline",
    route: "/modules/Reportes/reporteOrdencompra",
    backgroundColor: "#F3E5F5",
  },
];

export default function ReportesIndex() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/(tabs)/home");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Grid de Reportes */}
        <View style={styles.grid}>
          {reportes.map((reporte) => (
            <TouchableOpacity
              key={reporte.id}
              style={[
                styles.reporteCard,
                { backgroundColor: reporte.backgroundColor },
              ]}
              onPress={() => router.push(reporte.route)}
              activeOpacity={0.85}
            >
              <View style={styles.reporteContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={reporte.icon}
                    size={32}
                    color="#666"
                  />
                </View>
                <Text style={styles.reporteTitle}>{reporte.title}</Text>
                <Text style={styles.reporteDescription}>
                  {reporte.description}
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Contenido
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Grid de Reportes
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reporteCard: {
    width: "48%",
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    minHeight: 160,
    position: "relative",
  },
  reporteContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  iconContainer: {
    marginBottom: 12,
  },
  reporteTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  reporteDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  arrowContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
