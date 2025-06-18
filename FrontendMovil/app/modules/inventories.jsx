import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import InventoryCard from "../../components/InventoryCard";
import SearchFilterBar from "../../components/SearchFilterBar";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

const sampleData = [
  {
    id: "1",
    name: "Nombre Inventario",
    status: "Completado",
    section: "[Sección]",
    subsection: "[Subsección]",
  },
  {
    id: "2",
    name: "Nombre Inventario",
    status: "Pendiente",
    section: "[Sección]",
    subsection: "[Subsección]",
  },
  {
    id: "3",
    name: "Nombre Inventario",
    status: "Sin completar",
    section: "[Sección]",
    subsection: "[Subsección]",
  },
];

export default function inventories() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = sampleData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const closeModal = () => setSelectedItem(null);

  return (
    <View style={styles.container}>
      <CustomHeader title="Inventario" backRoute="/(tabs)/home" />

      <Text style={styles.subtitle}>
        En esta sección podrás visualizar los inventarios asociados a la empresa
        <Text style={{ fontWeight: "bold" }}> [Nombre]</Text>.
      </Text>

      <SearchFilterBar
        value={search}
        onChangeText={setSearch}
        onFilterPress={() => {}}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InventoryCard
            name={item.name}
            id={item.id}
            status={item.status}
            section={item.section}
            subsection={item.subsection}
            onPress={() => setSelectedItem(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron inventarios.</Text>
        }
      />

      {/* Modal deslizable */}
      <Modal
        isVisible={!!selectedItem}
        onBackdropPress={closeModal}
        onSwipeComplete={closeModal}
        swipeDirection="down"
        style={styles.modal}
        backdropOpacity={0.3}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>#{selectedItem?.id}</Text>
          <Text style={styles.label}>
            Estado: <Text style={styles.value}>[Matricula Inmobiliaria]</Text>
          </Text>
          <Text style={styles.label}>
            Sección: <Text style={styles.value}>{selectedItem?.section}</Text>
          </Text>
          <Text style={styles.label}>
            Subsección:{" "}
            <Text style={styles.value}>{selectedItem?.subsection}</Text>
          </Text>
          <Text style={styles.label}>
            Fecha y hora: <Text style={styles.value}>[dd/mm/aa]</Text>
          </Text>

          {/* Botones */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnOutline}>
              <Ionicons name="eye-outline" size={18} color="#333" />
              <Text style={styles.btnOutlineText}>Detalles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FA" },
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
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  value: {
    fontWeight: "bold",
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  btnOutlineText: {
    marginLeft: 8,
    fontWeight: "500",
    color: "#333",
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  btnPrimaryText: {
    marginLeft: 8,
    fontWeight: "500",
    color: "#fff",
  },
});
