// components/CompanyRoleSwitcher.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../context/SessionContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import LogoInmero from "../../components/LogoInmero";
import DropdownEmpresas from "../../components/DropdownEmpresas";

export default function CompanyRoleSwitcher({
  visible = true,
  onClose = null,
  onSwitch = null,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    rolesByCompany,
    empresaSeleccionada,
    cambiarContexto,
    tieneMultiplesOpciones,
  } = useSession();

  const [seleccion, setSeleccion] = useState({
    empresaId: empresaSeleccionada?.empresaId,
    rolId: empresaSeleccionada?.rolId,
  });
  const [agrupado, setAgrupado] = useState([]);
  const [cambiando, setCambiando] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log(visible);
    //console.log("rolesByCompany:", rolesByCompany);
    //console.log("empresaSeleccionada:", empresaSeleccionada);
    //console.log("tieneMultiplesOpciones():", tieneMultiplesOpciones?.());

    setDebugInfo({
      rolesByCompany: rolesByCompany,
      empresaSeleccionada: empresaSeleccionada,
      tieneMultiples: tieneMultiplesOpciones?.(),
      visible: visible,
    });

    if (rolesByCompany && rolesByCompany.length > 0) {
      //console.log("Procesando rolesByCompany...");
      const agrupado = rolesByCompany.reduce((acc, item) => {
        //console.log("Procesando item:", item);
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

      //console.log("Resultado agrupado:", agrupado);
      setAgrupado(agrupado);
    } else {
      //console.log("rolesByCompany está vacío o es null");
      setAgrupado([]);
    }
  }, [rolesByCompany, empresaSeleccionada, visible]);

  useEffect(() => {
    if (visible && empresaSeleccionada) {
      //console.log("Modal abierto, reseteando selección");
      setSeleccion({
        empresaId: empresaSeleccionada.empresaId,
        rolId: empresaSeleccionada.rolId,
      });

      if (rolesByCompany && rolesByCompany.length > 0) {
        //console.log("Reprocesando datos al abrir modal");
        const agrupado = rolesByCompany.reduce((acc, item) => {
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

        //console.log("Datos reprocesados al abrir modal:", agrupado);
        setAgrupado(agrupado);
      }
    }
  }, [visible, empresaSeleccionada, rolesByCompany]);

  const handleSelectEmpresa = (empresaId, roles) => {
    //console.log("Empresa seleccionada:", empresaId, roles);
    setSeleccion({ empresaId, rolId: null });
  };

  const handleSelectRol = (empresaId, rolId) => {
    //console.log("Rol seleccionado:", empresaId, rolId);
    setSeleccion({ empresaId, rolId });
  };

  const handleConfirmar = async () => {
    if (!seleccion?.empresaId || !seleccion?.rolId) {
      Alert.alert("Error", "Debes seleccionar una empresa y un rol");
      return;
    }

    if (
      seleccion.empresaId === empresaSeleccionada?.empresaId &&
      seleccion.rolId === empresaSeleccionada?.rolId
    ) {
      if (onClose) {
        onClose();
      }
      return;
    }

    setCambiando(true);

    try {
      console.log("Cambiando contexto...", {
        empresaId: seleccion.empresaId,
        rolId: seleccion.rolId,
      });

      await cambiarContexto(seleccion.empresaId, seleccion.rolId, true);

      //console.log("Contexto cambiado exitosamente");

      if (onClose) {
        onClose();
      }

      if (onSwitch) {
        onSwitch();
      }
      //console.log("Navegando al Home...");

      router.push("/home");
      Alert.alert(
        "Éxito",
        "Empresa y rol cambiados correctamente. Redirigiendo al inicio..."
      );
    } catch (error) {
      //console.error("Error cambiando contexto:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar el contexto. Intenta nuevamente."
      );
    } finally {
      setCambiando(false);
    }
  };

  if (!tieneMultiplesOpciones?.()) {
    //console.log("No hay múltiples opciones disponibles");
    return null;
  }

  if (!visible) {
    //console.log("Modal no visible, no renderizando");
    return null;
  }

  //console.log("Renderizando modal, visible:", visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => onClose && onClose()}
    >
      <SafeAreaView style={styles.container}>
        {/* Header con logo */}
        <View style={[styles.logoContainer, { marginTop: insets.top }]}>
          <LogoInmero width={150} height={120} />
        </View>

        {/* Botón de cerrar */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onClose && onClose()}
          disabled={cambiando}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <Text style={styles.titulo}>Cambiar empresa</Text>
        <Text style={styles.subtitulo}>
          Selecciona la empresa y rol que deseas usar.
        </Text>

        {/* Dropdown de empresas - con fallback */}
        <View style={styles.dropdownContainer}>
          {agrupado && agrupado.length > 0 ? (
            <DropdownEmpresas
              data={agrupado}
              seleccion={seleccion}
              onSelectEmpresa={handleSelectEmpresa}
              onSelectRol={handleSelectRol}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="business-outline" size={48} color="#ccc" />
              <Text style={styles.noDataText}>
                No se pudieron cargar las empresas
              </Text>
              <Text style={styles.noDataSubtext}>
                rolesByCompany: {rolesByCompany ? "existe" : "null"}
              </Text>
              <Text style={styles.noDataSubtext}>
                length: {rolesByCompany?.length || 0}
              </Text>
            </View>
          )}
        </View>

        {/* Información actual */}
        <View style={styles.currentInfo}>
          <Text style={styles.currentLabel}>Empresa actual:</Text>
          <Text style={styles.currentValue}>
            {empresaSeleccionada?.empresaNombre || "No seleccionada"}
          </Text>
          <Text style={styles.currentLabel}>Rol actual:</Text>
          <Text style={styles.currentValue}>
            {empresaSeleccionada?.rolNombre || "No seleccionado"}
          </Text>
        </View>

        {/* Botón continuar */}
        <TouchableOpacity
          style={[
            styles.botonContinuar,
            (!seleccion?.rolId || cambiando) && styles.botonDeshabilitado,
            {
              position: "absolute",
              bottom: insets.bottom + 20,
              left: 20,
              right: 20,
            },
          ]}
          disabled={!seleccion?.rolId || cambiando}
          onPress={handleConfirmar}
        >
          {cambiando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.textoContinuar}>Cambiando...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.textoContinuar}>Confirmar cambio</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
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
  debugContainer: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  debugTitle: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: "#856404",
    marginBottom: 2,
  },
  dropdownContainer: {
    flex: 1,
    paddingTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  currentInfo: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  currentValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  botonContinuar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f80e0",
    padding: 14,
    borderRadius: 12,
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
  textoContinuar: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
