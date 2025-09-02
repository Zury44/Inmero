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
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
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
};

export default function KardexReporte() {
  const { token, empresaSeleccionada } = useSession();

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
  });

  // Estados para fechas mejorados
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);

  // Estados para loading
  const [loadingData, setLoadingData] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // DEBUG: Verifica la configuración al cargar
  useEffect(() => {
    console.log("=== CONFIGURACIÓN INICIAL ===");
    console.log("API_URL:", API_URL);
    console.log("Token existe:", !!token);
    console.log("Empresa seleccionada:", empresaSeleccionada);
    console.log("================================");
  }, [token, empresaSeleccionada]);

  // Función para formatear fecha
  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Función mejorada para fetch de datos con mejor manejo de errores
  // 4. Modificar la función fetchData para soportar filtros client-side
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
          console.log(` Datos paginados recibidos para ${stateKey}:`, {
            total: data.page?.totalElements || data.content.length,
            pagina: data.page?.number || 0,
            elementos: data.content.length,
          });
        } else {
          // Formato no reconocido
          console.warn(` Formato de datos no válido para ${stateKey}:`, data);
          console.warn(`   Esperado: Array o { content: Array, page: Object }`);
          console.warn(`   Recibido:`, typeof data, data);
          return;
        }
        // Aplicar filtro client-side si se proporciona
        const finalData = filterFn
          ? processedData.filter(filterFn)
          : processedData;

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
          // NO cargar estos inicialmente, solo cuando se seleccione el nivel anterior
          // fetchData(endpoints.almacen, "almacenes"),
          // fetchData(endpoints.espacio, "espacios"),
          // fetchData(endpoints.bloque, "bloques"),
          // fetchData(endpoints.sede, "sedes"),
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

      if (municipioId && empresaSeleccionada?.empresaId) {
        // Filtrar sedes por empresa Y municipio usando filtro client-side
        await fetchData(
          `${endpoints.sede}?empresaId=${empresaSeleccionada.empresaId}`,
          "sedes",
          (s) => s.municipioId === parseInt(municipioId)
        );
      } else {
        setSedes([]);
      }
    },
    [fetchData, empresaSeleccionada?.empresaId]
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
  useEffect(() => {
    if (empresaSeleccionada?.empresaId) {
      // Limpiar todas las selecciones que dependen de la empresa
      setSelected((prev) => ({
        ...prev,
        sedeId: null,
        bloqueId: null,
        espacioId: null,
        almacenId: null,
      }));

      // Limpiar arrays
      setSedes([]);
      setBloques([]);
      setEspacios([]);
      setAlmacenes([]);
    }
  }, [empresaSeleccionada?.empresaId]);
  // Manejo de cambios de fecha mejorado
  const handleFechaInicioChange = (event, selectedDate) => {
    setShowDatePickerInicio(Platform.OS === "ios");
    if (selectedDate) {
      setFechaInicio(selectedDate);
      // Validar que fecha inicio no sea mayor que fecha fin
      if (selectedDate > fechaFin) {
        setFechaFin(selectedDate);
      }
    }
  };

  const handleFechaFinChange = (event, selectedDate) => {
    setShowDatePickerFin(Platform.OS === "ios");
    if (selectedDate) {
      // Validar que fecha fin no sea menor que fecha inicio
      if (selectedDate < fechaInicio) {
        Alert.alert(
          "Error",
          "La fecha fin no puede ser menor que la fecha de inicio"
        );
        return;
      }
      setFechaFin(selectedDate);
    }
  };

  // Funciones para establecer fechas predefinidas
  const setFechaPredefida = (dias) => {
    const hoy = new Date();
    const fechaAnterior = new Date();
    fechaAnterior.setDate(hoy.getDate() - dias);

    setFechaInicio(fechaAnterior);
    setFechaFin(hoy);
  };

  // Validación mejorada
  const validarFiltros = () => {
    if (fechaInicio > fechaFin) {
      Alert.alert(
        "Error",
        "La fecha de inicio no puede ser mayor a la fecha fin"
      );
      return false;
    }

    const diffTime = Math.abs(fechaFin - fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      Alert.alert(
        "Advertencia",
        "El rango de fechas es muy amplio. Esto puede generar un reporte muy grande."
      );
    }

    return true;
  };

  // Función mejorada para generar reporte con mapeo correcto de campos
  const generarReporte = async () => {
    console.log("=== INICIANDO GENERACIÓN DE REPORTE ===");

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

    if (!API_URL) {
      console.error("API_URL no está configurada");
      Alert.alert("Error", "Configuración de API no encontrada.");
      return;
    }

    console.log("Token:", token.substring(0, 20) + "...");
    console.log("Empresa ID:", empresaSeleccionada.empresaId);
    console.log("API URL:", API_URL);

    if (!validarFiltros()) return;

    setGeneratingReport(true);

    // MAPEO CORRECTO: Transformar nombres de campos para el backend
    const formatearFechaConHora = (fecha, esInicio = true) => {
      const fechaStr = fecha.toISOString().split("T")[0]; // YYYY-MM-DD
      return esInicio ? `${fechaStr} 00:00` : `${fechaStr} 23:59`;
    };

    // Crear el objeto para el backend con los nombres correctos (snake_case)
    const filtrosParaBackend = {};

    // Solo agregar campos que tienen valor seleccionado
    if (selected.municipioId) {
      filtrosParaBackend.municipio_id = selected.municipioId;
    }

    if (selected.sedeId) {
      filtrosParaBackend.sede_id = selected.sedeId;
    }

    if (selected.bloqueId) {
      filtrosParaBackend.bloque_id = selected.bloqueId;
    }

    if (selected.espacioId) {
      filtrosParaBackend.espacio_id = selected.espacioId;
    }

    if (selected.almacenId) {
      filtrosParaBackend.almacen_id = selected.almacenId;
    }

    if (selected.productoId) {
      filtrosParaBackend.producto_id = selected.productoId;
    }

    if (selected.categoriaId) {
      filtrosParaBackend.producto_categoria_id = selected.categoriaId;
    }

    // Las fechas siempre van (son obligatorias)
    filtrosParaBackend.fecha_inicio = formatearFechaConHora(fechaInicio, true);
    filtrosParaBackend.fecha_fin = formatearFechaConHora(fechaFin, false);

    const urlCompleta = `${API_URL}/api/v2/report/kardex`;

    console.log("Enviando petición:");
    console.log("URL:", urlCompleta);
    console.log("Filtros para backend:", filtrosParaBackend);
    console.log("Headers:", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.substring(0, 20)}...`,
    });

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
        body: JSON.stringify(filtrosParaBackend), // Usar el objeto mapeado
      });

      console.log("Respuesta recibida:");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("OK:", response.ok);

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

      const filename = `reporte_kardex_${Date.now()}.pdf`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Archivo guardado en:", uri);

      if (await Sharing.isAvailableAsync()) {
        console.log("Compartiendo archivo...");
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte Kardex",
        });
      } else {
        Alert.alert("Éxito", "Reporte generado correctamente");
      }

      console.log("Proceso completado exitosamente");
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Stack trace:", error.stack);
      Alert.alert("Error", `No se pudo generar el reporte: ${error.message}`);
    } finally {
      setGeneratingReport(false);
      console.log("=== FIN GENERACIÓN DE REPORTE ===");
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
              label={item.nombre || item.name}
              value={item.id}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.statusBarSpacer} />
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.statusBarSpacer} />
      <HeaderHome />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reporte Kardex</Text>

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

        {renderPicker("Categoría", categorias, selected.categoriaId, (v) =>
          setSelected({ ...selected, categoriaId: v })
        )}

        {renderPicker("Producto", productos, selected.productoId, (v) =>
          setSelected({ ...selected, productoId: v })
        )}

        {/* Sección de fechas mejorada */}
        <View style={styles.dateSection}>
          {/* Fecha Inicio */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Fecha Inicio:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerInicio(true)}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(fechaInicio)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fecha Fin */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Fecha Fin:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerFin(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(fechaFin)}</Text>
            </TouchableOpacity>
          </View>

          {/* DatePickers */}
          {showDatePickerInicio && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display="default"
              onChange={handleFechaInicioChange}
              maximumDate={new Date()}
            />
          )}

          {showDatePickerFin && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display="default"
              onChange={handleFechaFinChange}
              minimumDate={fechaInicio}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={generatingReport ? "Generando..." : "Generar Reporte"}
            onPress={generarReporte}
            disabled={generatingReport || !empresaSeleccionada?.empresaId}
          />
        </View>

        {generatingReport && (
          <View style={styles.loadingReport}>
            <ActivityIndicator size="small" color="#388f4bff" />
            <Text style={styles.loadingReportText}>Generando reporte...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  statusBarSpacer: {
    height: Constants.statusBarHeight || 44, // 44px es la altura típica del notch/status bar en iOS
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  predefinedDateButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  predefinedButton: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  predefinedButtonText: {
    color: "#388f4bff",
    fontSize: 12,
    fontWeight: "500",
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

  buttonContainer: {
    marginTop: 30,
    marginHorizontal: 20,
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
});
