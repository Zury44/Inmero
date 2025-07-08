import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AccentCard from "../../components/Card"; // Asegúrate de que el archivo se llame así
import Header from "../../components/Header";

export default function Company() {
  const { empresas } = useLocalSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [empresaList, setEmpresaList] = useState([]);

  useEffect(() => {
    if (empresas) {
      try {
        const parsed = JSON.parse(empresas);
        setEmpresaList(parsed);
      } catch (error) {
        console.error("Error al parsear empresas:", error);
      }
    }
  }, [empresas]);

  const filtered = empresaList.filter((item) =>
    item.empresaNombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleNotificationPress = () => {
    // lógica de notificaciones
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
            onPress={() => {
              // Aquí podrías guardar la empresa seleccionada en un contexto
              router.push("/home");
            }}
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
