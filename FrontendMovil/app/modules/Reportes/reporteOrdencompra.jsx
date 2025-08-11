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
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "../../../context/SessionContext";

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
  reporteOrdenCompra: "/api/v2/report/orden_compra",
};

export default function ReporteOrdenCompra() {
  const { token, empresaSeleccionada } = useSession();

  // Estados para datos de los endpoints - ORDEN CORRECTO
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

  // Estados para selecciones - ORDEN CORRECTO
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

  // Estado específico para categoría estado como TextInput
  const [categoriaEstadoId, setCategoriaEstadoId] = useState("");

  // Estados para fechas
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  // Estados para controlar la visibilidad de los date pickers
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);
  const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
  const [showTimePickerFin, setShowTimePickerFin] = useState(false);

  // Estados para loading
  const [loadingData, setLoadingData] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // DEBUG: Verifica la configuración al cargar
  useEffect(() => {
    console.log("=== CONFIGURACIÓN INICIAL REPORTE ORDEN COMPRA ===");
    console.log("API_URL:", API_URL);
    console.log("Token existe:", !!token);
    console.log("Token:", token?.substring(0, 20) + "...");
    console.log("Empresa seleccionada:", empresaSeleccionada);
    console.log("===============================================");
  }, [token, empresaSeleccionada]);

  // Función mejorada para fetch de datos con mejor manejo de errores
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

        if (!Array.isArray(data)) {
          console.warn(`Datos no válidos recibidos para ${stateKey}:`, data);
          return;
        }

        const processedData = filterFn ? data.filter(filterFn) : data;

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
          setter(processedData);
        }
      } catch (error) {
        console.error(`Error cargando ${stateKey}:`, error);
        Alert.alert("Error", `No se pudieron cargar los datos de ${stateKey}`);
      }
    },
    [token, API_URL]
  );

  // Carga inicial SOLO de países - El resto se carga secuencialmente
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) return;

      setLoadingData(true);
      try {
        // Solo cargar países inicialmente
        await fetchData(endpoints.pais, "paises");
      } catch (error) {
        Alert.alert("Error", "Error cargando datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [token, fetchData]);

  // Inicializar fechas con valores por defecto
  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    setFechaInicio(startOfYear);
    setFechaFin(endOfYear);
  }, []);

  // Funciones para manejar los date pickers
  const onChangeFechaInicio = (event, selectedDate) => {
    const currentDate = selectedDate || fechaInicio;
    setShowDatePickerInicio(Platform.OS === "ios");
    setFechaInicio(currentDate);
  };

  const onChangeFechaFin = (event, selectedDate) => {
    const currentDate = selectedDate || fechaFin;
    setShowDatePickerFin(Platform.OS === "ios");
    setFechaFin(currentDate);
  };

  const onChangeTimeInicio = (event, selectedTime) => {
    const currentTime = selectedTime || fechaInicio;
    setShowTimePickerInicio(Platform.OS === "ios");

    const newDateTime = new Date(fechaInicio);
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    newDateTime.setSeconds(0);

    setFechaInicio(newDateTime);
  };

  const onChangeTimeFin = (event, selectedTime) => {
    const currentTime = selectedTime || fechaFin;
    setShowTimePickerFin(Platform.OS === "ios");

    const newDateTime = new Date(fechaFin);
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    newDateTime.setSeconds(0);

    setFechaFin(newDateTime);
  };

  // Funciones para formatear las fechas
  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  // Función para limpiar selecciones y datos dependientes
  const limpiarDependientes = (nivel) => {
    const niveles = [
      "paisId",
      "departamentoId",
      "municipioId",
      "sedeId",
      "bloqueId",
      "espacioId",
      "almacenId",
      "productoId",
      "categoriaId",
      "pedidoId",
    ];

    const arrays = [
      setDepartamentos,
      setMunicipios,
      setSedes,
      setBloques,
      setEspacios,
      setAlmacenes,
      setProductos,
      setCategorias,
      setPedidos,
    ];

    const startIndex = niveles.indexOf(nivel) + 1;

    // Limpiar selecciones
    setSelected((prev) => {
      const newSelected = { ...prev };
      for (let i = startIndex; i < niveles.length; i++) {
        newSelected[niveles[i]] = null;
      }
      return newSelected;
    });

    // Limpiar arrays de datos
    for (let i = startIndex - 1; i < arrays.length; i++) {
      arrays[i]([]);
    }

    // Si se limpia todo, también limpiar categoría estado
    if (nivel === "paisId") {
      setCategoriaEstadoId("");
    }
  };

  // ORDEN CORRECTO DE FILTROS: País -> Departamento -> Municipio -> Sede -> Bloque -> Espacio -> Almacén -> Producto -> Categoría Producto -> Pedido -> Categoría Estado

  const handlePaisChange = useCallback(
    async (paisId) => {
      console.log("🌍 País seleccionado:", paisId);

      setSelected((prev) => ({ ...prev, paisId }));
      limpiarDependientes("paisId");

      if (paisId) {
        await fetchData(
          `${endpoints.departamento}?paisId=${paisId}`,
          "departamentos"
        );
      }
    },
    [fetchData]
  );

  const handleDepartamentoChange = useCallback(
    async (departamentoId) => {
      console.log("🏛️ Departamento seleccionado:", departamentoId);

      setSelected((prev) => ({ ...prev, departamentoId }));
      limpiarDependientes("departamentoId");

      if (departamentoId) {
        await fetchData(
          `${endpoints.municipio}?departamentoId=${departamentoId}`,
          "municipios"
        );
      }
    },
    [fetchData]
  );

  const handleMunicipioChange = useCallback(
    async (municipioId) => {
      console.log("🏙️ Municipio seleccionado:", municipioId);

      setSelected((prev) => ({ ...prev, municipioId }));
      limpiarDependientes("municipioId");

      if (municipioId && empresaSeleccionada?.empresaId) {
        await fetchData(
          `${endpoints.sede}?empresaId=${empresaSeleccionada.empresaId}`,
          "sedes",
          (s) => s.municipioId === parseInt(municipioId)
        );
      }
    },
    [fetchData, empresaSeleccionada?.empresaId]
  );

  const handleSedeChange = useCallback(
    async (sedeId) => {
      console.log("🏢 Sede seleccionada:", sedeId);

      setSelected((prev) => ({ ...prev, sedeId }));
      limpiarDependientes("sedeId");

      if (sedeId) {
        await fetchData(
          endpoints.bloque,
          "bloques",
          (b) => b.sedeId === parseInt(sedeId)
        );
      }
    },
    [fetchData]
  );

  const handleBloqueChange = useCallback(
    async (bloqueId) => {
      console.log("🧱 Bloque seleccionado:", bloqueId);

      setSelected((prev) => ({ ...prev, bloqueId }));
      limpiarDependientes("bloqueId");

      if (bloqueId) {
        await fetchData(
          endpoints.espacio,
          "espacios",
          (e) => e.bloqueId === parseInt(bloqueId)
        );
      }
    },
    [fetchData]
  );

  const handleEspacioChange = useCallback(
    async (espacioId) => {
      console.log("🏪 Espacio seleccionado:", espacioId);

      setSelected((prev) => ({ ...prev, espacioId }));
      limpiarDependientes("espacioId");

      if (espacioId) {
        await fetchData(
          endpoints.almacen,
          "almacenes",
          (a) => a.espacioId === parseInt(espacioId)
        );
      }
    },
    [fetchData]
  );

  const handleAlmacenChange = useCallback(
    async (almacenId) => {
      console.log("📦 Almacén seleccionado:", almacenId);

      setSelected((prev) => ({ ...prev, almacenId }));
      limpiarDependientes("almacenId");

      if (almacenId) {
        // Cargar productos después de seleccionar almacén
        await fetchData(endpoints.producto, "productos");
      }
    },
    [fetchData]
  );

  const handleProductoChange = useCallback(
    async (productoId) => {
      console.log("📋 Producto seleccionado:", productoId);

      setSelected((prev) => ({ ...prev, productoId }));
      limpiarDependientes("productoId");

      if (productoId) {
        // Cargar categorías de producto
        await fetchData(endpoints.categoria, "categorias");
      }
    },
    [fetchData]
  );

  const handleCategoriaChange = useCallback(
    async (categoriaId) => {
      console.log("🏷️ Categoría seleccionada:", categoriaId);

      setSelected((prev) => ({ ...prev, categoriaId }));
      limpiarDependientes("categoriaId");

      if (categoriaId) {
        // Cargar pedidos después de seleccionar categoría
        await fetchData(endpoints.pedido, "pedidos");
      }
    },
    [fetchData]
  );

  const handlePedidoChange = useCallback((pedidoId) => {
    console.log("📝 Pedido seleccionado:", pedidoId);

    setSelected((prev) => ({ ...prev, pedidoId }));
    // No limpiar dependientes aquí porque el pedido es el penúltimo filtro
    // La categoría estado se maneja manualmente
  }, []);

  // Limpiar datos cuando cambia la empresa
  useEffect(() => {
    if (empresaSeleccionada?.empresaId) {
      limpiarDependientes("paisId");
    }
  }, [empresaSeleccionada?.empresaId]);

  // Función para validar las fechas
  const validarFechas = () => {
    if (fechaInicio >= fechaFin) {
      Alert.alert(
        "Error",
        "La fecha de inicio debe ser anterior a la fecha de fin."
      );
      return false;
    }
    return true;
  };

  // Función para validar que se hayan seleccionado los filtros mínimos necesarios
  const validarFiltros = () => {
    if (!selected.pedidoId) {
      Alert.alert(
        "Filtros requeridos",
        "Debes seleccionar un pedido para generar el reporte de orden de compra."
      );
      return false;
    }

    if (!categoriaEstadoId) {
      Alert.alert(
        "Filtros requeridos",
        "Debes ingresar un ID de categoría de estado para generar el reporte de orden de compra."
      );
      return false;
    }

    return true;
  };

  // Función para verificar si los filtros están completos para habilitar el botón
  const sonFiltrosValidos = () => {
    return selected.pedidoId && categoriaEstadoId;
  };

  // Función para generar reporte (sin cambios)
  const generarReporte = async () => {
    console.log("=== INICIANDO GENERACIÓN DE REPORTE ORDEN COMPRA ===");

    if (!token) {
      console.error("❌ No hay token disponible");
      Alert.alert(
        "Error",
        "No hay sesión activa. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    if (!empresaSeleccionada?.empresaId) {
      console.error("❌ No hay empresa seleccionada");
      Alert.alert(
        "Error",
        "No hay empresa seleccionada. Por favor, selecciona una empresa."
      );
      return;
    }

    if (!validarFechas()) return;
    if (!validarFiltros()) return;

    setGeneratingReport(true);

    const filtrosParaBackend = {
      empresa_id: parseInt(empresaSeleccionada.empresaId),
      pedido_id: parseInt(selected.pedidoId),
      categoria_estado_id: parseInt(categoriaEstadoId),
      ...(selected.sedeId && { sede_id: parseInt(selected.sedeId) }),
      ...(selected.bloqueId && { bloque_id: parseInt(selected.bloqueId) }),
      ...(selected.espacioId && { espacio_id: parseInt(selected.espacioId) }),
      ...(selected.almacenId && { almacen_id: parseInt(selected.almacenId) }),
      ...(selected.municipioId && {
        municipio_id: parseInt(selected.municipioId),
      }),
      ...(selected.productoId && {
        producto_id: parseInt(selected.productoId),
      }),
      ...(selected.categoriaId && {
        producto_categoria_id: parseInt(selected.categoriaId),
      }),
      fecha_inicio: fechaInicio.toISOString().slice(0, 19).replace("T", " "),
      fecha_fin: fechaFin.toISOString().slice(0, 19).replace("T", " "),
    };

    console.log("📤 Filtros enviados al backend:", filtrosParaBackend);
    const urlCompleta = `${API_URL}${endpoints.reporteOrdenCompra}`;

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

      console.log(
        "📥 Respuesta recibida:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorBody = await response.json();
            errorMessage += ` - ${JSON.stringify(errorBody)}`;
          } else {
            const errorText = await response.text();
            if (errorText) errorMessage += ` - ${errorText}`;
          }
        } catch (e) {
          console.log("No se pudo leer el cuerpo del error:", e.message);
        }
        throw new Error(errorMessage);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log("📄 Archivo recibido:", arrayBuffer.byteLength, "bytes");

      if (arrayBuffer.byteLength === 0) {
        throw new Error("El archivo recibido está vacío");
      }

      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const filename = `reporte_orden_compra_${Date.now()}.pdf`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte de Orden de Compra",
        });
      } else {
        Alert.alert("Éxito", "Reporte generado correctamente");
      }

      console.log("✅ Proceso completado exitosamente");
    } catch (error) {
      console.error("❌ Error completo:", error);
      Alert.alert("Error", `No se pudo generar el reporte: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Función auxiliar para renderizar pickers
  const renderPicker = (
    label,
    items,
    selectedValue,
    onValueChange,
    enabled = true,
    required = false
  ) => (
    <View style={styles.pickerContainer}>
      <Text style={[styles.label, !enabled && styles.labelDisabled]}>
        {label} {required && <Text style={styles.required}>*</Text>}
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
              label={
                item.nombre || item.name || item.id || `${label} ${item.id}`
              }
              value={item.id}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  // Función para renderizar selectores de fecha y hora
  const renderDateTimePicker = (
    label,
    date,
    onDateChange,
    onTimeChange,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker
  ) => (
    <View style={styles.dateTimeContainer}>
      <Text style={styles.label}>{label} *</Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>📅 {formatDate(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>🕐 {formatTime(date)}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.dateTimeDisplay}>{formatDateTime(date)}</Text>
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={date}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reporte de Orden de Compra</Text>

      {/* FILTROS EN ORDEN CORRECTO */}
      <View style={styles.sectionContainer}>
        {/* 1. País */}
        {renderPicker("País", paises, selected.paisId, handlePaisChange)}

        {/* 2. Departamento */}
        {renderPicker(
          "Departamento",
          departamentos,
          selected.departamentoId,
          handleDepartamentoChange,
          selected.paisId !== null
        )}

        {/* 3. Municipio */}
        {renderPicker(
          "Municipio",
          municipios,
          selected.municipioId,
          handleMunicipioChange,
          selected.departamentoId !== null
        )}

        {/* 4. Sede */}
        {renderPicker(
          "Sede",
          sedes,
          selected.sedeId,
          handleSedeChange,
          selected.municipioId !== null
        )}

        {/* 5. Bloque */}
        {renderPicker(
          "Bloque",
          bloques,
          selected.bloqueId,
          handleBloqueChange,
          selected.sedeId !== null
        )}

        {/* 6. Espacio */}
        {renderPicker(
          "Espacio",
          espacios,
          selected.espacioId,
          handleEspacioChange,
          selected.bloqueId !== null
        )}

        {/* 7. Almacén */}
        {renderPicker(
          "Almacén",
          almacenes,
          selected.almacenId,
          handleAlmacenChange,
          selected.espacioId !== null
        )}

        {/* 8. Producto */}
        {renderPicker(
          "Producto",
          productos,
          selected.productoId,
          handleProductoChange,
          selected.almacenId !== null
        )}

        {/* 9. Categoría Producto */}
        {renderPicker(
          "Categoría Producto",
          categorias,
          selected.categoriaId,
          handleCategoriaChange,
          selected.productoId !== null
        )}

        {/* 10. Pedido */}
        {renderPicker(
          "Pedido",
          pedidos,
          selected.pedidoId,
          handlePedidoChange,
          selected.categoriaId !== null,
          true
        )}

        {/* 11. Categoría Estado - Campo obligatorio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Categoría Estado <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              !selected.pedidoId && styles.textInputDisabled,
            ]}
            value={categoriaEstadoId}
            onChangeText={setCategoriaEstadoId}
            placeholder="Ingrese ID de categoría estado"
            keyboardType="numeric"
            editable={selected.pedidoId !== null}
          />
        </View>
      </View>

      {/* Botón de generar reporte */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.reportButton,
            (!sonFiltrosValidos() || generatingReport) && styles.buttonDisabled,
          ]}
          onPress={generarReporte}
          disabled={!sonFiltrosValidos() || generatingReport}
        >
          <Text style={styles.buttonText}>
            {generatingReport ? "Generando..." : "Generar Reporte"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {generatingReport && (
        <View style={styles.loadingReport}>
          <ActivityIndicator size="small" color="#0066cc" />
          <Text style={styles.loadingReportText}>Generando reporte...</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  sectionContainer: {
    marginVertical: 10,
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
  required: {
    color: "#dc3545",
    fontSize: 16,
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
    backgroundColor: "#17a2b8",
  },
  reportButton: {
    backgroundColor: "#007bff",
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
  // ESTILOS FALTANTES PARA FECHA Y HORA:
  dateTimeContainer: {
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
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  dateTimeButtonText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  dateTimeDisplay: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
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
});
