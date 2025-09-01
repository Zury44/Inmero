// app/(auth)/login.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import axios from "axios";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoInmero from "../../components/LogoInmero";
import { useSession } from "../../context/SessionContext";

const { API_URL, API_URL_LOGIN, eas } = Constants.expoConfig.extra;
const projectId = eas?.projectId;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setUsername, guardarSesionCompleta } = useSession();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    if (!correo.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      setIsLoading(false);
      return;
    }

    if (!contrasena.trim()) {
      setError("Por favor ingresa tu contraseña");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(correo)) {
      setError("Correo electrónico inválido");
      setIsLoading(false);
      return;
    }

    try {
      //console.log("Iniciando login...");
      //console.log("API_URL:", API_URL);
      //console.log("API_URL_LOGIN:", API_URL_LOGIN);
      //console.log("URL completa:", `${API_URL}${API_URL_LOGIN}`);

      // NUEVO FLUJO: Login devuelve token inmediatamente
      const response = await axios.post(`${API_URL}${API_URL_LOGIN}`, {
        username: correo.trim(),
        password: contrasena,
      });

      // console.log("Respuesta del login:", response.data);

      const { token, empresaId, rolId, rolesByCompany, usuarioEstado } =
        response.data;

      // Validar datos críticos del login
      if (!token) {
        setError("Error: No se recibió token del servidor");
        setIsLoading(false);
        return;
      }

      // Validaciones de estado del usuario
      if (usuarioEstado === 2) {
        router.replace("/registro-persona");
        setIsLoading(false);
        return;
      } else if (usuarioEstado === 3) {
        router.replace("/registro-empresa");
        setIsLoading(false);
        return;
      }

      if (!rolesByCompany || rolesByCompany.length === 0) {
        setError("No tienes empresas asociadas.");
        setIsLoading(false);
        return;
      }

      await setUsername(correo.trim());

      const empresaActual = rolesByCompany.find(
        (empresa) => empresa.empresaId === empresaId && empresa.rolId === rolId
      );

      if (!empresaActual) {
        console.warn(
          "No se encontró empresa actual, usando primera disponible"
        );
        const primeraEmpresa = rolesByCompany[0];
        await guardarSesionCompleta({
          token,
          empresaId: primeraEmpresa.empresaId,
          rolId: primeraEmpresa.rolId,
          empresaNombre: primeraEmpresa.empresaNombre,
          rolNombre: primeraEmpresa.rolNombre,
          rolesByCompany,
        });
      } else {
        await guardarSesionCompleta({
          token,
          empresaId,
          rolId,
          empresaNombre: empresaActual.empresaNombre,
          rolNombre: empresaActual.rolNombre,
          rolesByCompany,
        });
      }

      await configurarNotificacionesPush(correo.trim());

      router.replace("/home");
    } catch (err) {
      console.error("Error en login:", err);
      console.error("Detalles del error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Manejo de errores
      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (err.response?.status === 404) {
        setError("Cuenta no encontrada. Verifica tus datos.");
      } else if (err.response?.status === 400) {
        setError("Datos inválidos. Revisa la información ingresada.");
      } else if (
        err.message?.includes("Network Error") ||
        err.code === "NETWORK_ERROR"
      ) {
        setError("Error de conexión. Verifica tu conexión a internet.");
      } else if (err.message?.includes("timeout")) {
        setError("La conexión tardó demasiado. Intenta nuevamente.");
      } else {
        setError("Error inesperado. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  //Notificaciones Push
  const configurarNotificacionesPush = async (userEmail) => {
    try {
      if (!Device.isDevice) {
        console.log(
          "No es un dispositivo físico, saltando notificaciones push"
        );
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === "granted") {
        const pushToken = (
          await Notifications.getExpoPushTokenAsync({
            projectId: projectId || "local/FrontendMovil",
          })
        ).data;

        console.log("Token de notificaciones obtenido:", pushToken);

        const notificationEndpoint = `${API_URL}/notifications/token`;

        await fetch(notificationEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userEmail,
            token: pushToken,
          }),
        });

        //console.log("Token de notificaciones registrado correctamente");
      } else {
        // console.log("Permisos de notificaciones denegados");
      }
    } catch (error) {
      //console.error("Error configurando notificaciones push:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.logoContainer, { marginTop: insets.top + 0 }]}>
        <LogoInmero width={150} height={140} />
      </View>

      <Text style={styles.title}>Iniciar Sesión</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Correo Electrónico</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" />
        <TextInput
          placeholder="Ingresa tu correo electrónico"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={correo}
          onChangeText={setCorreo}
          editable={!isLoading}
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" />
        <TextInput
          placeholder="Ingresa tu contraseña"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={contrasena}
          onChangeText={setContrasena}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          disabled={isLoading}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Text>
        {!isLoading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/forgotPassword")}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: "#555" }}>¿No tienes una cuenta? </Text>
        <TouchableOpacity
          onPress={() => router.push("/register")}
          disabled={isLoading}
        >
          <Text style={styles.registerLink}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 0,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 16,
    color: "#000",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#3686F7",
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 12,
    color: "#3686F7",
    textAlign: "center",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#3686F7",
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
});
