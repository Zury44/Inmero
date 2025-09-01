import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const capitalizeFirstLetter = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function DropdownEmpresas({
  data = [],
  seleccion,
  onSelectEmpresa, // (empresaId, roles) => void
  onSelectRol, // (empresaId, rolId) => void
}) {
  const [empresaExpandida, setEmpresaExpandida] = useState(null);

  // Debug: Mostrar datos en consola
  useEffect(() => {
    // console.log("ropdownEmpresas - Data recibida:", data);
    // console.log("DropdownEmpresas - Selección actual:", seleccion);
    // console.log("DropdownEmpresas - Cantidad de empresas:", data?.length);

    // Auto-expandir si solo hay una empresa
    if (data && data.length === 1 && !empresaExpandida) {
      console.log("Auto-expandiendo única empresa:", data[0].empresaId);
      setEmpresaExpandida(data[0].empresaId);
    }
  }, [data, seleccion]);

  const handleEmpresaPress = (empresaId, roles) => {
    // console.log("Empresa presionada:", empresaId, roles);

    // Expandir/contraer la empresa
    setEmpresaExpandida((prev) => (prev === empresaId ? null : empresaId));

    // Notificar al componente padre
    if (onSelectEmpresa) {
      onSelectEmpresa(empresaId, roles);
    }
  };

  const handleRolPress = (empresaId, rolId, rolNombre) => {
    //  console.log("Rol presionado:", { empresaId, rolId, rolNombre });

    // Notificar al componente padre
    if (onSelectRol) {
      onSelectRol(empresaId, rolId);
    }
  };

  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No hay empresas disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {data.map((item) => {
          const isExpandida = item.empresaId === empresaExpandida;
          const seleccionActual = seleccion?.empresaId === item.empresaId;

          return (
            <View key={item.empresaId} style={styles.card}>
              <TouchableOpacity
                style={[
                  styles.empresaHeader,
                  seleccionActual ? styles.empresaActiva : null,
                ]}
                onPress={() => handleEmpresaPress(item.empresaId, item.roles)}
                activeOpacity={0.7}
              >
                <View style={styles.empresaInfo}>
                  <Text style={styles.empresaNombre}>
                    {item.empresaNombre || "Empresa sin nombre"}
                  </Text>
                  <Text style={styles.rolesCount}>
                    {item.roles?.length || 0} rol
                    {(item.roles?.length || 0) !== 1 ? "es" : ""} disponible
                    {(item.roles?.length || 0) !== 1 ? "s" : ""}
                  </Text>
                </View>
                <Ionicons
                  name={isExpandida ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>

              {isExpandida && item.roles && item.roles.length > 0 && (
                <View style={styles.rolesContainer}>
                  {item.roles.map((rol, index) => {
                    const isSelected =
                      seleccion?.empresaId === item.empresaId &&
                      seleccion?.rolId === rol.rolId;

                    return (
                      <TouchableOpacity
                        key={rol.rolId || index}
                        style={[
                          styles.rolItem,
                          isSelected ? styles.rolSeleccionado : null,
                          index === item.roles.length - 1
                            ? styles.lastRolItem
                            : null,
                        ]}
                        onPress={() =>
                          handleRolPress(
                            item.empresaId,
                            rol.rolId,
                            rol.rolNombre
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.rolNombre,
                            isSelected ? styles.rolNombreSeleccionado : null,
                          ]}
                        >
                          {capitalizeFirstLetter(
                            rol.rolNombre || "Rol sin nombre"
                          )}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#1f80e0"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {isExpandida && (!item.roles || item.roles.length === 0) && (
                <View style={styles.noRolesContainer}>
                  <Text style={styles.noRolesText}>
                    No hay roles disponibles
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  empresaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  empresaActiva: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1f80e0",
    borderWidth: 2,
  },
  empresaInfo: {
    flex: 1,
    marginRight: 10,
  },
  empresaNombre: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  rolesCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
  },
  rolesContainer: {
    backgroundColor: "#fff",
  },
  rolItem: {
    padding: 14,
    paddingLeft: 24,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastRolItem: {
    borderBottomWidth: 0,
  },
  rolSeleccionado: {
    backgroundColor: "#f0f8ff",
  },
  rolNombre: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  rolNombreSeleccionado: {
    color: "#1f80e0",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  noRolesContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  noRolesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
