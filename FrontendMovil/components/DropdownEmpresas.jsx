import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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

  const handleEmpresaPress = (empresaId, roles) => {
    // Siempre expandir al hacer clic, sin importar si hay un solo rol
    setEmpresaExpandida((prev) => (prev === empresaId ? null : empresaId));
    onSelectEmpresa && onSelectEmpresa(empresaId, roles);
  };

  return (
    <>
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
            >
              <Text style={styles.empresaNombre}>{item.empresaNombre}</Text>
              <Ionicons
                name={isExpandida ? "chevron-up" : "chevron-down"}
                size={20}
                color="#777"
              />
            </TouchableOpacity>

            {isExpandida &&
              item.roles.map((rol) => (
                <TouchableOpacity
                  key={rol.rolId}
                  style={styles.rolItem}
                  onPress={() => onSelectRol(item.empresaId, rol.rolId)}
                >
                  <Text style={styles.rolNombre}>
                    {capitalizeFirstLetter(rol.rolNombre)}
                  </Text>
                  {seleccion?.empresaId === item.empresaId &&
                    seleccion?.rolId === rol.rolId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#1f80e0"
                      />
                    )}
                </TouchableOpacity>
              ))}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  empresaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  empresaActiva: {
    borderColor: "#1f80e0",
    borderWidth: 1,
  },
  empresaNombre: {
    fontWeight: "600",
    fontSize: 16,
  },
  rolItem: {
    padding: 12,
    paddingLeft: 25,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rolNombre: {
    fontSize: 15,
    color: "#333",
  },
});
