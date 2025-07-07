import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Card from "../../components/Card";
import Header from "../../components/Header";

const data = [
  {
    id: "1",
    name: "Empresa Pedro",
    contactInfo: "Contacto",
  },
  {
    id: "2",
    name: "Empresa Juan",
    contactInfo: "Contacto",
  },
];

export default function Company() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNotificationPress = () => {
    // lógica de notificaciones
  };

  return (
    <View style={styles.container}>
      <Header
        title="Bienvenido!"
        onNotificationPress={handleNotificationPress}
      />
      <Text style={styles.subtitle}>Conoce las empresas asociadas a tu .</Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            name={item.name}
            id={item.id}
            contactInfo={item.contactInfo}
            onPress={() => {
              // navega al tab modules
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
