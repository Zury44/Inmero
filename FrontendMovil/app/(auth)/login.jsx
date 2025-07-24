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

const { API_URL, API_URL_LOGIN, API_URL_SELECTION, eas } =
  Constants.expoConfig.extra;
const projectId = eas?.projectId;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    setEmpresasDisponibles,
    setEmpresaSeleccionada,
    setUsername,
    setToken,
  } = useSession();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError("");

    if (!validateEmail(correo)) {
      setError("Correo electrónico inválido");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}${API_URL_LOGIN}`, {
        username: correo,
        password: contrasena,
      });

      const { rolesByCompany, usuarioEstado } = response.data;

      if (!rolesByCompany || rolesByCompany.length === 0) {
        setError("No tienes empresas asociadas.");
        return;
      }

      setUsername(correo);

      if (usuarioEstado === 2) {
        router.replace("/registro-persona");
        return;
      } else if (usuarioEstado === 3) {
        router.replace("/registro-empresa");
        return;
      }

      setEmpresasDisponibles(rolesByCompany);

      if (rolesByCompany.length === 1) {
        const empresa = rolesByCompany[0];
        setEmpresaSeleccionada(empresa);

        const seleccionResp = await axios.post(
          `${API_URL}${API_URL_SELECTION}`,
          {
            username: correo,
            empresaId: empresa.empresaId,
            rolId: empresa.rolId,
          }
        );

        const token = seleccionResp.data.token;
        await setToken(token);

        router.replace("/home");
        return;
      }

      router.replace("/company/company");

      if (Device.isDevice) {
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

          await fetch("http://192.168.193.85:3000/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: correo, token: pushToken }),
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error de conexión.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={[styles.logoContainer, { marginTop: insets.top + 0 }]}>
        <LogoInmero width={150} height={140} />
      </View>

      <Text style={styles.title}>Iniciar Sesión</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {/* Correo */}
      <Text style={styles.label}>Correo Electrónico</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" />
        <TextInput
          placeholder="Ingresa tu correo electrónico"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />
      </View>

      {/* Contraseña */}
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" />
        <TextInput
          placeholder="Ingresa tu contraseña"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={contrasena}
          onChangeText={setContrasena}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Botón Iniciar sesión */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      {/* ¿Olvidaste tu contraseña? */}
      <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Separador */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.divider} />
      </View>

      {/* Registro */}
      <View style={styles.footer}>
        <Text style={{ color: "#555" }}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
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
