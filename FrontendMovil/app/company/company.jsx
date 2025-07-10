import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AccentCard from "../../components/Card";
import Header from "../../components/Header";
import { useSession } from "../../context/SessionContext"; // ✅ contexto
import axios from "axios";
import Constants from "expo-constants";

const { API_URL, API_URL_SELECTION } = Constants.expoConfig.extra;

export default function Company() {
  const router = useRouter();
  const {
    empresasDisponibles,
    setEmpresaSeleccionada,
    setToken,
    username, // ✅ Usamos el username desde el contexto
  } = useSession();

  const [search, setSearch] = useState("");

  const filtered =
    empresasDisponibles?.filter((item) =>
      item.empresaNombre.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const handleNotificationPress = () => {
    // lógica futura para notificaciones
  };

  const handleSelectCompany = async (empresa) => {
    try {
      const response = await axios.post(`${API_URL}${API_URL_SELECTION}`, {
        username: username,
        empresaId: empresa.empresaId,
        rolId: empresa.rolId,
      });

      const { token } = response.data;

      console.log("🔐 Token recibido:", token); // 👈 Aquí

      await setToken(token);
      setEmpresaSeleccionada(empresa);
      router.replace("/home");
    } catch (error) {
      console.error("Error al seleccionar empresa:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="¡Bienvenido!"
        onNotificationPress={handleNotificationPress}
      />
      <Text style={styles.subtitle}>
        Conoce las empresas asociadas a tu cuenta.
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.empresaId.toString()}
        renderItem={({ item }) => (
          <AccentCard
            name={item.empresaNombre}
            id={item.empresaId.toString()}
            contactInfo={item.rolNombre}
            onPress={() => handleSelectCompany(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron empresas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FA",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
