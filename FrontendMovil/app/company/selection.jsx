import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSession } from "../../context/SessionContext";
import Constants from "expo-constants";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoInmero from "../../components/LogoInmero";
import DropdownEmpresas from "../../components/DropdownEmpresas";

const { API_URL, API_URL_SELECTION } = Constants.expoConfig.extra;

export default function SeleccionEmpresa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { empresasDisponibles, username, guardarSesionSeleccion } =
    useSession();

  const [seleccion, setSeleccion] = useState(null);
  const [agrupado, setAgrupado] = useState([]);

  useEffect(() => {
    if (empresasDisponibles) {
      const agrupado = empresasDisponibles.reduce((acc, item) => {
        const existente = acc.find((e) => e.empresaId === item.empresaId);
        const rol = { rolId: item.rolId, rolNombre: item.rolNombre };
        if (existente) {
          existente.roles.push(rol);
        } else {
          acc.push({
            empresaId: item.empresaId,
            empresaNombre: item.empresaNombre,
            roles: [rol],
          });
        }
        return acc;
      }, []);
      setAgrupado(agrupado);
    }
  }, [empresasDisponibles]);

  const handleSelectEmpresa = (empresaId, roles) => {
    setSeleccion({ empresaId, rolId: null });
  };

  const handleSelectRol = (empresaId, rolId) => {
    setSeleccion({ empresaId, rolId });
  };

  const handleContinuar = async () => {
    if (!seleccion || !seleccion.rolId) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}${API_URL_SELECTION}`, {
        username,
        ...seleccion,
      });

      const { token, rolId, empresaId } = response.data;

      // Buscar nombre de empresa y rol para pasar completo
      const empresa = agrupado.find((e) => e.empresaId === empresaId);
      const rol = empresa?.roles.find((r) => r.rolId === rolId);

      await guardarSesionSeleccion({
        token,
        empresaId,
        rolId,
        empresaNombre: empresa?.empresaNombre,
        rolNombre: rol?.rolNombre,
      });

      router.replace("/home");
    } catch (error) {
      console.error("❌ Error al continuar:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.logoContainer, { marginTop: insets.top }]}>
        <LogoInmero width={150} height={120} />
      </View>
      <Text style={styles.titulo}>Selecciona una empresa</Text>
      <Text style={styles.subtitulo}>
        Por favor, selecciona una empresa para hacer uso de las funcionalidades.
      </Text>

      <FlatList
        data={agrupado}
        keyExtractor={(item) => item.empresaId.toString()}
        renderItem={({ item }) => null}
        ListEmptyComponent={null}
        ListHeaderComponent={
          <DropdownEmpresas
            data={agrupado}
            seleccion={seleccion}
            onSelectEmpresa={handleSelectEmpresa}
            onSelectRol={handleSelectRol}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity
        style={[
          styles.botonContinuar,
          !seleccion || !seleccion.rolId ? { opacity: 0.4 } : undefined,
          {
            position: "absolute",
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
            marginBottom: 0,
          },
        ]}
        disabled={!seleccion || !seleccion.rolId}
        onPress={handleContinuar}
      >
        <Text style={styles.textoContinuar}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 0,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  botonContinuar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f80e0",
    padding: 14,
    borderRadius: 12,
  },
  textoContinuar: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 6,
  },
});
