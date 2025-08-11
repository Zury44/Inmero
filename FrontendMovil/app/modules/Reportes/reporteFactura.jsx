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
  reporteFactura: "/api/v2/report/factura",
};

export default function ReporteFactura() {
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
    loadingReportText: {
      marginLeft: 10,
      fontSize: 14,
      color: "#666",
    },
  });

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
    console.log("=== CONFIGURACIÓN INICIAL REPORTE FACTURA ===");
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

  // Carga inicial de datos
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
        ]);
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

    // Combinar la fecha actual con la nueva hora
    const newDateTime = new Date(fechaInicio);
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    newDateTime.setSeconds(0);

    setFechaInicio(newDateTime);
  };

  const onChangeTimeFin = (event, selectedTime) => {
    const currentTime = selectedTime || fechaFin;
    setShowTimePickerFin(Platform.OS === "ios");

    // Combinar la fecha actual con la nueva hora
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
    // Validar que al menos se haya seleccionado una sede o un producto/categoría
    const tieneUbicacion =
      selected.sedeId ||
      selected.bloqueId ||
      selected.espacioId ||
      selected.almacenId;
    const tieneProducto = selected.productoId || selected.categoriaId;

    if (!tieneUbicacion && !tieneProducto) {
      Alert.alert(
        "Filtros requeridos",
        "Debes seleccionar al menos una ubicación (Sede, Bloque, Espacio o Almacén) o un filtro de producto (Producto o Categoría) para generar el reporte."
      );
      return false;
    }

    return true;
  };

  // Función para verificar si los filtros están completos para habilitar el botón
  const sonFiltrosValidos = () => {
    const tieneUbicacion =
      selected.sedeId ||
      selected.bloqueId ||
      selected.espacioId ||
      selected.almacenId;
    const tieneProducto = selected.productoId || selected.categoriaId;
    return tieneUbicacion || tieneProducto;
  };

  // Función para generar reporte
  const generarReporte = async () => {
    console.log("=== INICIANDO GENERACIÓN DE REPORTE FACTURA ===");

    // Verificaciones básicas
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

    if (!validarFechas()) {
      return;
    }

    if (!validarFiltros()) {
      return;
    }

    setGeneratingReport(true);

    // Crear el objeto para el backend según el formato esperado
    const filtrosParaBackend = {
      sede_id: selected.sedeId ? parseInt(selected.sedeId) : null,
      bloque_id: selected.bloqueId ? parseInt(selected.bloqueId) : null,
      espacio_id: selected.espacioId ? parseInt(selected.espacioId) : null,
      almacen_id: selected.almacenId ? parseInt(selected.almacenId) : null,
      municipio_id: selected.municipioId
        ? parseInt(selected.municipioId)
        : null,
      producto_id: selected.productoId ? parseInt(selected.productoId) : null,
      producto_categoria_id: selected.categoriaId
        ? parseInt(selected.categoriaId)
        : null,
      fecha_inicio: fechaInicio.toISOString().slice(0, 19).replace("T", " "),
      fecha_fin: fechaFin.toISOString().slice(0, 19).replace("T", " "),
    };

    // Remover campos null para enviar solo los necesarios
    Object.keys(filtrosParaBackend).forEach((key) => {
      if (filtrosParaBackend[key] === null) {
        delete filtrosParaBackend[key];
      }
    });

    const urlCompleta = `${API_URL}${endpoints.reporteFactura}`;

    console.log("📤 Enviando petición:");
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

      console.log("📥 Respuesta recibida:");
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

      console.log("✅ Respuesta exitosa, procesando archivo...");

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

      const filename = `reporte_factura_${Date.now()}.pdf`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("💾 Archivo guardado en:", uri);

      if (await Sharing.isAvailableAsync()) {
        console.log("📤 Compartiendo archivo...");
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte de Factura",
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
      console.log("=== FIN GENERACIÓN DE REPORTE FACTURA ===");
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
      <Text style={styles.title}>Reporte de Factura</Text>

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

      {/* Campos de fecha */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Rango de Fechas</Text>

        {renderDateTimePicker(
          "Fecha de Inicio",
          fechaInicio,
          onChangeFechaInicio,
          onChangeTimeInicio,
          showDatePickerInicio,
          setShowDatePickerInicio,
          showTimePickerInicio,
          setShowTimePickerInicio
        )}

        {renderDateTimePicker(
          "Fecha de Fin",
          fechaFin,
          onChangeFechaFin,
          onChangeTimeFin,
          showDatePickerFin,
          setShowDatePickerFin,
          showTimePickerFin,
          setShowTimePickerFin
        )}
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
  dateTimeContainer: {
    marginVertical: 12,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  dateTimeButton: {
    flex: 0.48,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dateTimeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  dateTimeDisplay: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
  infoContainer: {
    marginVertical: 15,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1976d2",
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 10,
    marginBottom: 2,
  },
});
