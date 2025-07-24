// app/(auth)/register.jsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import LogoInmero from "../../components/LogoInmero";
import Constants from "expo-constants";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const { API_URL } = Constants.expoConfig.extra;

// Función para evaluar la fortaleza de la contraseña
const getPasswordStrength = (password) => {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("8+ caracteres");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("mayúscula");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("número");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push("carácter especial");
  }

  if (score === 4) return "¡Contraseña segura!";
  return `Falta: ${feedback.join(", ")}`;
};

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("La contraseña debe incluir al menos una mayúscula.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("La contraseña debe incluir al menos un número.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("La contraseña debe incluir al menos un carácter especial.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
      });

      const data = response.data;

      if (data.success) {
        setIsRegistered(true);
        setTimeout(() => {
          Alert.alert(
            "¡Registro exitoso!",
            "Te enviamos un correo de confirmación. Verifica tu cuenta antes de iniciar sesión.",
            [{ text: "Entendido", onPress: () => router.push("/login") }]
          );
        }, 1000);
      } else {
        setError(data.message || "Error desconocido.");
      }
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "No se pudo conectar con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={[styles.logoContainer, { marginTop: insets.top + 0 }]}>
        <LogoInmero width={150} height={140} />
      </View>

      <Text style={styles.title}>Crear cuenta</Text>

      <Text style={styles.label}>Correo</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Evaluación visual */}
      {password !== "" && (
        <Text style={styles.passwordStrength}>
          {getPasswordStrength(password)}
        </Text>
      )}

      {/* Error */}
      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {/* Botón de registro */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.loginButtonText}>Registrarse</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      {/* Ir al login */}
      <View style={styles.footer}>
        <Text style={{ color: "#555" }}>¿Ya tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.registerLink}>Inicia sesión</Text>
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
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
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
  passwordStrength: {
    color: "#3686F7",
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "500",
  },
  error: {
    color: "#ff3b30",
    marginBottom: 10,
    fontSize: 13,
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
});
