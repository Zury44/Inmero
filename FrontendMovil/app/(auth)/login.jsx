import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import BotonSubmit from "../../components/BotonSubmit";
import Input from "../../components/Input";
import { useSession } from "../../context/SessionContext"; // ✅ contexto

const { API_URL, API_URL_LOGIN, eas } = Constants.expoConfig.extra;
const projectId = eas?.projectId;

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const {
    setEmpresasDisponibles,
    setEmpresaSeleccionada,
    setUsername, // ✅ nuevo
    cerrarSesion, // opcional si quieres limpiar antes
  } = useSession();
  // ✅ usar contexto

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

      const { rolesPorEmpresa, usuarioEstado } = response.data;

      if (!rolesPorEmpresa || rolesPorEmpresa.length === 0) {
        setError("No tienes empresas asociadas.");
        return;
      }

      setUsername(correo); // ✅ guarda el correo como username en contexto

      // Redirección por estado
      if (usuarioEstado === 2) {
        router.replace("/registro-persona");
        return;
      } else if (usuarioEstado === 3) {
        router.replace("/registro-empresa");
        return;
      }

      // ✅ Guardar lista de empresas en contexto
      setEmpresasDisponibles(rolesPorEmpresa);

      if (rolesPorEmpresa.length === 1) {
        const empresa = rolesPorEmpresa[0];
        setEmpresaSeleccionada(empresa);
        router.replace("/home");
        return;
      }

      // ✅ Tiene varias empresas
      router.replace("/company/company");

      // ✅ Obtener Expo Push Token
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

          console.log("Expo Push Token:", pushToken);

          await fetch("http://192.168.193.85:3000/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: correo, token: pushToken }),
          });
        } else {
          console.warn("Permiso de notificaciones no concedido.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error de conexión.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <Input
        placeholder="Correo electrónico"
        iconName="mail-outline"
        value={correo}
        onChangeText={setCorreo}
      />

      <View style={styles.passwordContainer}>
        <Input
          placeholder="Contraseña"
          iconName="lock-closed-outline"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <BotonSubmit texto="Iniciar sesión" onPress={handleLogin} />

      <TouchableOpacity>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>O</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleButton}>
        <Ionicons name="logo-google" size={20} color="#EA4335" />
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.signupLink}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  link: {
    marginTop: 8,
    textAlign: "center",
    color: "#2196F3",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#666",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  googleText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#222",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "bold",
  },
});
