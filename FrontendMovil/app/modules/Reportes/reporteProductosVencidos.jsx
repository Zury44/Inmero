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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "../../../context/SessionContext";

const { API_URL } = Constants.expoConfig.extra;

const endpoints = {
  producto: "/api/v1/producto",
  categoria: "/api/v1/producto_categoria",
  reporte: "/api/v2/report/producto_vencimiento",
};

export default function ReporteProductosVencidos() {
  const { token, empresaSeleccionada } = useSession();

  // Estados para datos de los endpoints
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados para selecciones
  const [productoId, setProductoId] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);

  // Estados para loading
  const [loadingData, setLoadingData] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // DEBUG: Verifica la configuración al cargar
  useEffect(() => {
    console.log("=== CONFIGURACIÓN INICIAL PRODUCTOS VENCIDOS ===");
    console.log("API_URL:", API_URL);
    console.log("Token existe:", !!token);
    console.log("Token:", token?.substring(0, 20) + "...");
    console.log("Empresa seleccionada:", empresaSeleccionada);
    console.log("================================================");
  }, [token, empresaSeleccionada]);

  // Función para fetch de datos con manejo de errores
  const fetchData = useCallback(
    async (endpoint, stateKey) => {
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

        const setters = {
          productos: setProductos,
          categorias: setCategorias,
        };

        const setter = setters[stateKey];
        if (setter) {
          setter(data);
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
          fetchData(endpoints.producto, "productos"),
          fetchData(endpoints.categoria, "categorias"),
        ]);
      } catch (error) {
        Alert.alert("Error", "Error cargando datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [token, fetchData]);

  // Función para formatear fecha a YYYY-MM-DD
  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Manejadores para los date pickers
  const onChangeFechaInicio = (event, selectedDate) => {
    setShowDatePickerInicio(false);
    if (selectedDate) {
      setFechaInicio(selectedDate);
    }
  };

  const onChangeFechaFin = (event, selectedDate) => {
    setShowDatePickerFin(false);
    if (selectedDate) {
      setFechaFin(selectedDate);
    }
  };

  // Función para generar reporte (CORREGIDA)
  const generarReporte = async () => {
    console.log("=== INICIANDO GENERACIÓN DE REPORTE PRODUCTOS VENCIDOS ===");

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

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      Alert.alert("Error", "Debes seleccionar fecha de inicio y fecha de fin.");
      return;
    }

    if (fechaInicio > fechaFin) {
      Alert.alert(
        "Error",
        "La fecha de inicio no puede ser mayor que la fecha de fin."
      );
      return;
    }

    setGeneratingReport(true);

    // Crear el objeto para el backend (CORREGIDO)
    const fechaInicioFormateada = formatearFecha(fechaInicio);
    const fechaFinFormateada = formatearFecha(fechaFin);

    const filtrosParaBackend = {
      empresa_id: empresaSeleccionada.empresaId, // ✅ Agregado: empresa_id requerido
      fecha_inicio: `${fechaInicioFormateada} 18:00`, // ✅ Corregido: formato con hora
      fecha_fin: `${fechaFinFormateada} 18:00`, // ✅ Corregido: formato con hora
    };

    // Agregar filtros opcionales solo si están seleccionados
    if (productoId) {
      filtrosParaBackend.producto_id = parseInt(productoId);
    }

    if (categoriaId) {
      // ✅ Corregido: campo correcto producto_categoria_id
      filtrosParaBackend.producto_categoria_id = parseInt(categoriaId);
    }

    const urlCompleta = `${API_URL}${endpoints.reporte}`;

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

      const filename = `reporte_productos_vencidos_${fechaInicioFormateada}_${fechaFinFormateada}_${Date.now()}.pdf`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("💾 Archivo guardado en:", uri);

      if (await Sharing.isAvailableAsync()) {
        console.log("📤 Compartiendo archivo...");
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte de Productos Vencidos",
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
      console.log("=== FIN GENERACIÓN DE REPORTE PRODUCTOS VENCIDOS ===");
    }
  };

  // Función auxiliar para renderizar pickers
  const renderPicker = (label, items, selectedValue, onValueChange) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reporte de Productos Vencidos</Text>

      {/* Filtro de producto */}
      {renderPicker("Producto", productos, productoId, setProductoId)}

      {/* Filtro de categoría de producto */}
      {renderPicker(
        "Categoría Producto",
        categorias,
        categoriaId,
        setCategoriaId
      )}

      {/* Campo de fecha inicio */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha Inicio *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePickerInicio(true)}
        >
          <Text style={styles.dateButtonText}>
            {formatearFecha(fechaInicio)}
          </Text>
        </TouchableOpacity>
        {showDatePickerInicio && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="default"
            onChange={onChangeFechaInicio}
          />
        )}
      </View>

      {/* Campo de fecha fin */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha Fin *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePickerFin(true)}
        >
          <Text style={styles.dateButtonText}>{formatearFecha(fechaFin)}</Text>
        </TouchableOpacity>
        {showDatePickerFin && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            display="default"
            onChange={onChangeFechaFin}
          />
        )}
      </View>

      {/* Botón para generar reporte */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.reportButton,
            generatingReport && styles.buttonDisabled,
          ]}
          onPress={generarReporte}
          disabled={generatingReport}
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
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
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  helpContainer: {
    marginVertical: 16,
    backgroundColor: "#e8f4fd",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0056b3",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButton: {
    backgroundColor: "#28a745",
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
  loadingReportText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
});
