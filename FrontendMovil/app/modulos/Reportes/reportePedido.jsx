import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "../../../context/SessionContext";
import HeaderHome from "../../../components/HeaderHome";
const { API_URL } = Constants.expoConfig.extra;

const endpoints = {
  pais: "/api/v1/pais",
  departamento: "/api/v1/departamento",
  municipio: "/api/v1/municipio",
  sede: "/api/v1/sede",
  bloque: "/api/v1/bloque",
  espacio: "/api/v1/espacio",
  almacen: "/api/v1/almacen",
  producto: "/api/v1/producto",
  categoria: "/api/v1/producto_categoria",
  pedido: "/api/v1/pedido",
};

export default function PedidoReporte() {
  // Fechas de filtro
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  // Mostrar u ocultar DatePicker nativo
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);

  const { token, empresaSeleccionada } = useSession();

  // Estados para datos de los endpoints
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Estados para selecciones
  const [selected, setSelected] = useState({
    paisId: null,
    departamentoId: null,
    municipioId: null,
    sedeId: null,
    bloqueId: null,
    espacioId: null,
    almacenId: null,
    productoId: null,
    categoriaId: null,
    pedidoId: null,
  });

  // Estados específicos para pedidos
  const [categoriaEstadoId, setCategoriaEstadoId] = useState("");
  const [pedidoData, setPedidoData] = useState(null);
  const [articulos, setArticulos] = useState([]);

  // Estados para loading
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // DEBUG: Verifica la configuración al cargar
  useEffect(() => {
    console.log("=== CONFIGURACIÓN INICIAL ===");
    console.log("API_URL:", API_URL);
    console.log("Token existe:", !!token);
    console.log("Token:", token?.substring(0, 20) + "...");
    console.log("Empresa seleccionada:", empresaSeleccionada);
    console.log("================================");
  }, [token, empresaSeleccionada]);

  const formatearFecha = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-ES");
  };

  // Función mejorada para fetch de datos con manejo de respuestas paginadas
  const fetchData = useCallback(
    async (endpoint, stateKey, filterFn = null) => {
      try {
        const res = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "FrontendMovil/1.0.0 (React Native)",
            Accept: "application/json, */*",
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        let processedData;

        if (Array.isArray(data)) {
          // Respuesta directa como array
          processedData = data;
        } else if (data && Array.isArray(data.content)) {
          // Respuesta paginada con estructura { content: [...], page: {...} }
          processedData = data.content;
          console.log(`Datos paginados recibidos para ${stateKey}:`, {
            total: data.page?.totalElements || data.content.length,
            pagina: data.page?.number || 0,
            elementos: data.content.length,
          });
        } else {
          // Formato no reconocido
          console.warn(`Formato de datos no válido para ${stateKey}:`, data);
          console.warn(`   Esperado: Array o { content: Array, page: Object }`);
          console.warn(`   Recibido:`, typeof data, data);
          return;
        }

        // Aplicar filtro si se proporciona
        const finalData = filterFn
          ? processedData.filter(filterFn)
          : processedData;

        // Actualizar el estado correspondiente
        const setters = {
          paises: setPaises,
          departamentos: setDepartamentos,
          municipios: setMunicipios,
          sedes: setSedes,
          bloques: setBloques,
          espacios: setEspacios,
          almacenes: setAlmacenes,
          productos: setProductos,
          categorias: setCategorias,
          pedidos: setPedidos,
        };

        const setter = setters[stateKey];
        if (setter) {
          setter(finalData);
          console.log(` ${stateKey} cargados:`, finalData.length, "elementos");
        } else {
          console.warn(`No se encontró setter para ${stateKey}`);
        }
      } catch (error) {
        console.error(`Error cargando ${stateKey}:`, error);
        Alert.alert(
          "Error",
          `No se pudieron cargar los datos de ${stateKey}: ${error.message}`
        );
      }
    },
    [token, API_URL]
  );
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) return;

      setLoadingData(true);
      try {
        await Promise.all([
          fetchData(endpoints.pais, "paises"),
          fetchData(endpoints.categoria, "categorias"),
          fetchData(endpoints.producto, "productos"),
          fetchData(endpoints.almacen, "almacenes"),
          fetchData(endpoints.espacio, "espacios"),
          fetchData(endpoints.bloque, "bloques"),
          fetchData(endpoints.sede, "sedes"),
          fetchData(endpoints.departamento, "departamentos"),
          fetchData(endpoints.pedido, "pedidos"), // Agregar carga de pedidos
        ]);
      } catch (error) {
        Alert.alert("Error", "Error cargando datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [token, fetchData]);

  // Funciones para manejar filtros dependientes
  const handlePaisChange = useCallback(
    async (paisId) => {
      setSelected((prev) => ({
        ...prev,
        paisId,
        departamentoId: null,
        municipioId: null,
        sedeId: null,
        bloqueId: null,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar datos dependientes
      setMunicipios([]);
      setSedes([]);
      setBloques([]);
      setEspacios([]);
      setAlmacenes([]);

      if (paisId) {
        await fetchData(
          `${endpoints.departamento}?paisId=${paisId}`,
          "departamentos"
        );
      } else {
        setDepartamentos([]);
      }
    },
    [fetchData]
  );

  const handleDepartamentoChange = useCallback(
    async (departamentoId) => {
      setSelected((prev) => ({
        ...prev,
        departamentoId,
        municipioId: null,
        sedeId: null,
        bloqueId: null,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar datos dependientes
      setSedes([]);
      setBloques([]);
      setEspacios([]);
      setAlmacenes([]);

      if (departamentoId) {
        await fetchData(
          `${endpoints.municipio}?departamentoId=${departamentoId}`,
          "municipios"
        );
      } else {
        setMunicipios([]);
      }
    },
    [fetchData]
  );

  const handleMunicipioChange = useCallback(
    async (municipioId) => {
      setSelected((prev) => ({
        ...prev,
        municipioId,
        sedeId: null,
        bloqueId: null,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar datos dependientes
      setBloques([]);
      setEspacios([]);
      setAlmacenes([]);

      if (municipioId) {
        await fetchData(
          endpoints.sede,
          "sedes",
          (s) => s.municipioId === parseInt(municipioId)
        );
      } else {
        setSedes([]);
      }
    },
    [fetchData]
  );

  const handleSedeChange = useCallback(
    async (sedeId) => {
      setSelected((prev) => ({
        ...prev,
        sedeId,
        bloqueId: null,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar datos dependientes
      setEspacios([]);
      setAlmacenes([]);

      if (sedeId) {
        await fetchData(
          endpoints.bloque,
          "bloques",
          (b) => b.sedeId === parseInt(sedeId)
        );
      } else {
        setBloques([]);
      }
    },
    [fetchData]
  );

  const handleBloqueChange = useCallback(
    async (bloqueId) => {
      setSelected((prev) => ({
        ...prev,
        bloqueId,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar datos dependientes
      setAlmacenes([]);

      if (bloqueId) {
        await fetchData(
          endpoints.espacio,
          "espacios",
          (e) => e.bloqueId === parseInt(bloqueId)
        );
      } else {
        setEspacios([]);
      }
    },
    [fetchData]
  );

  const handleEspacioChange = useCallback(
    async (espacioId) => {
      setSelected((prev) => ({
        ...prev,
        espacioId,
        almacenId: null,
      }));

      if (espacioId) {
        await fetchData(
          endpoints.almacen,
          "almacenes",
          (a) => a.espacioId === parseInt(espacioId)
        );
      } else {
        setAlmacenes([]);
      }
    },
    [fetchData]
  );

  // 🔧 CORRECCIÓN: Función para buscar datos del pedido con endpoints correctos
  const buscarPedido = async () => {
    if (!selected.pedidoId) {
      Alert.alert("Error", "Debes seleccionar un pedido.");
      return;
    }

    setLoadingPedido(true);
    try {
      const [pedidoRes, articulosRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/pedido/${selected.pedidoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "FrontendMovil/1.0.0 (React Native)",
            Accept: "application/json, */*",
            "X-Requested-With": "XMLHttpRequest",
          },
        }),
        fetch(`${API_URL}/api/v1/pedido/${selected.pedidoId}/articulos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "FrontendMovil/1.0.0 (React Native)",
            Accept: "application/json, */*",
            "X-Requested-With": "XMLHttpRequest",
          },
        }),
      ]);

      if (!pedidoRes.ok || !articulosRes.ok) {
        throw new Error("Error al obtener datos del pedido");
      }

      const pedidoData = await pedidoRes.json();
      const articulosData = await articulosRes.json();

      setPedidoData(pedidoData);
      setArticulos(Array.isArray(articulosData) ? articulosData : []);

      Alert.alert("Éxito", "Datos del pedido cargados correctamente.");
    } catch (error) {
      console.error("Error al buscar pedido:", error);
      Alert.alert(
        "Error",
        "No se encontró el pedido o no se pudieron cargar los datos."
      );
    } finally {
      setLoadingPedido(false);
    }
  };

  // 🔧 CORRECCIÓN: Función para generar reporte mejorada
  const generarReporte = async () => {
    console.log("=== INICIANDO GENERACIÓN DE REPORTE PEDIDO ===");

    // Verificaciones básicas
    if (!token) {
      console.error("No hay token disponible");
      Alert.alert(
        "Error",
        "No hay sesión activa. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    if (!empresaSeleccionada?.empresaId) {
      console.error("No hay empresa seleccionada");
      Alert.alert(
        "Error",
        "No hay empresa seleccionada. Por favor, selecciona una empresa."
      );
      return;
    }

    if (!selected.pedidoId) {
      Alert.alert("Error", "Debes seleccionar un pedido.");
      return;
    }

    if (!categoriaEstadoId) {
      Alert.alert("Error", "Debes ingresar un ID de categoría estado.");
      return;
    }

    setGeneratingReport(true);

    // Crear el objeto para el backend
    const filtrosParaBackend = {
      categoria_estado_id: parseInt(categoriaEstadoId),
      ped_id: parseInt(selected.pedidoId),
    };

    const urlCompleta = `${API_URL}/api/v2/report/pedido`;

    console.log("Enviando petición:");
    console.log("   URL:", urlCompleta);
    console.log("   Filtros para backend:", filtrosParaBackend);

    try {
      const response = await fetch(urlCompleta, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "FrontendMovil/1.0.0 (React Native)",
          Accept: "application/pdf, application/json, */*",
          "Cache-Control": "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(filtrosParaBackend),
      });

      console.log("Respuesta recibida:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const contentType = response.headers.get("content-type");
          console.log("   Content-Type:", contentType);

          if (contentType && contentType.includes("application/json")) {
            const errorBody = await response.json();
            console.log("   Error JSON:", errorBody);
            errorMessage += ` - ${JSON.stringify(errorBody)}`;
          } else {
            const errorText = await response.text();
            console.log("   Error Text:", errorText);
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (e) {
          console.log("   No se pudo leer el cuerpo del error:", e.message);
        }

        throw new Error(errorMessage);
      }

      console.log("Respuesta exitosa, procesando archivo...");

      const arrayBuffer = await response.arrayBuffer();
      console.log("Archivo recibido:", arrayBuffer.byteLength, "bytes");

      if (arrayBuffer.byteLength === 0) {
        throw new Error("El archivo recibido está vacío");
      }

      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const filename = `reporte_pedido_${selected.pedidoId}_${Date.now()}.pdf`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Archivo guardado en:", uri);

      if (await Sharing.isAvailableAsync()) {
        console.log("Compartiendo archivo...");
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte de Pedido",
        });
      } else {
        Alert.alert("Éxito", "Reporte generado correctamente");
      }

      console.log("Proceso completado exitosamente");
    } catch (error) {
      console.error("Error completo:", error);
      Alert.alert("Error", `No se pudo generar el reporte: ${error.message}`);
    } finally {
      setGeneratingReport(false);
      console.log("=== FIN GENERACIÓN DE REPORTE PEDIDO ===");
    }
  };

  // Función auxiliar para renderizar pickers
  const renderPicker = (
    label,
    items,
    selectedValue,
    onValueChange,
    enabled = true
  ) => (
    <View style={styles.pickerContainer}>
      <Text style={[styles.label, !enabled && styles.labelDisabled]}>
        {label}
      </Text>
      <View style={[styles.pickerWrapper, !enabled && styles.pickerDisabled]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={enabled}
          style={styles.picker}
        >
          <Picker.Item label={`Seleccione ${label}`} value={null} />
          {items.map((item) => (
            <Picker.Item
              key={item.id}
              label={item.nombre || item.name || `${label} ${item.id}`}
              value={item.id}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  if (loadingData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.statusBarSpacer} />
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.statusBarSpacer} />
      <HeaderHome />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reporte de Pedido</Text>

        {/* Filtros de ubicación */}
        {renderPicker("País", paises, selected.paisId, handlePaisChange)}

        {renderPicker(
          "Departamento",
          departamentos,
          selected.departamentoId,
          handleDepartamentoChange,
          selected.paisId !== null
        )}

        {renderPicker(
          "Municipio",
          municipios,
          selected.municipioId,
          handleMunicipioChange,
          selected.departamentoId !== null
        )}

        {renderPicker(
          "Sede",
          sedes,
          selected.sedeId,
          handleSedeChange,
          selected.municipioId !== null
        )}

        {renderPicker(
          "Bloque",
          bloques,
          selected.bloqueId,
          handleBloqueChange,
          selected.sedeId !== null
        )}

        {renderPicker(
          "Espacio",
          espacios,
          selected.espacioId,
          handleEspacioChange,
          selected.bloqueId !== null
        )}

        {renderPicker(
          "Almacén",
          almacenes,
          selected.almacenId,
          (v) => setSelected({ ...selected, almacenId: v }),
          selected.espacioId !== null
        )}

        {/* Filtros de producto */}
        {renderPicker("Producto", productos, selected.productoId, (v) =>
          setSelected({ ...selected, productoId: v })
        )}

        {renderPicker(
          "Categoría Producto",
          categorias,
          selected.categoriaId,
          (v) => setSelected({ ...selected, categoriaId: v })
        )}

        {/* Selección de pedido */}
        {renderPicker("Pedido", pedidos, selected.pedidoId, (v) =>
          setSelected({ ...selected, pedidoId: v })
        )}

        {/* Campo de categoría estado */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoría Estado *</Text>
          <TextInput
            style={styles.textInput}
            value={categoriaEstadoId}
            onChangeText={setCategoriaEstadoId}
            placeholder="Ingrese ID de categoría estado"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dateSection}>
          {/* Fecha Inicio */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Fecha Inicio:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerInicio(true)}
            >
              <Text style={styles.dateButtonText}>
                {formatearFecha(fechaInicio)}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePickerInicio && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePickerInicio(false);
                if (selectedDate) setFechaInicio(selectedDate);
              }}
            />
          )}

          {/* Fecha Fin */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Fecha Fin:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerFin(true)}
            >
              <Text style={styles.dateButtonText}>
                {formatearFecha(fechaFin)}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePickerFin && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePickerFin(false);
                if (selectedDate) setFechaFin(selectedDate);
              }}
            />
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={buscarPedido}
              disabled={loadingPedido || !selected.pedidoId}
            >
              <Text style={styles.buttonText}>
                {loadingPedido ? "Buscando..." : "Buscar Pedido"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.reportButton,
                (!selected.pedidoId ||
                  !categoriaEstadoId ||
                  generatingReport) &&
                  styles.buttonDisabled,
              ]}
              onPress={generarReporte}
              disabled={
                !selected.pedidoId || !categoriaEstadoId || generatingReport
              }
            >
              <Text style={styles.buttonText}>
                {generatingReport ? "Generando..." : "Generar Reporte"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información del pedido */}
        {pedidoData && (
          <View style={styles.pedidoInfo}>
            <Text style={styles.sectionTitle}>Información del Pedido</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>ID: {pedidoData.id}</Text>
              {pedidoData.fecha && (
                <Text style={styles.infoText}>
                  Fecha:{" "}
                  {new Date(pedidoData.fecha).toLocaleDateString("es-ES")}
                </Text>
              )}
              {pedidoData.estado && (
                <Text style={styles.infoText}>Estado: {pedidoData.estado}</Text>
              )}
              <Text style={styles.infoText}>
                Artículos: {articulos.length} elementos
              </Text>
            </View>
          </View>
        )}

        {/* Loading indicators */}
        {(loadingPedido || generatingReport) && (
          <View style={styles.loadingReport}>
            <ActivityIndicator size="small" color="#0066cc" />
            <Text style={styles.loadingReportText}>
              {loadingPedido
                ? "Cargando datos del pedido..."
                : "Generando reporte..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  statusBarSpacer: {
    height: Constants.statusBarHeight || 44, // 44px es el altura típica del notch/status bar en iOS
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 16,
    backgroundColor: "#ffffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  pickerContainer: {
    marginVertical: 8,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  labelDisabled: {
    color: "#999",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  pickerDisabled: {
    backgroundColor: "#f9f9f9",
    borderColor: "#e9e9e9",
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    marginVertical: 8,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    backgroundColor: "#388f4bff",
  },
  reportButton: {
    backgroundColor: "#388f4bff",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pedidoInfo: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  loadingReport: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  loadingReportText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  dateSection: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingVertical: 5,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  dateButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flex: 2,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  dateInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    alignItems: "center",
  },
  dateInfoText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
  },
});
