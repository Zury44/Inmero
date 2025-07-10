import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
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
  if (score === 3) return `Falta: ${feedback.join(", ")}`;
  if (score === 2) return `Falta: ${feedback.join(", ")}`;
  if (score === 1) return `Falta: ${feedback.join(", ")}`;
  return `Falta: ${feedback.join(", ")}`;
};

export default function Register() {
  const router = useRouter();
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

    // Validación de contraseña mejorada
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
            "Te enviamos un correo de confirmación. Debes verificar tu cuenta antes de poder iniciar sesión.",
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

  const handleGoBack = () => {
    router.back();
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />

      {/* Header con gradiente */}
      <LinearGradient
        colors={["#10b981", "#059669", "#047857"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>Registrarse</Text>
          <Text style={styles.headerSubtitle}>
            Únete a nosotros y disfruta de todas las funcionalidades
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {!isRegistered ? (
              <>
                <Text style={styles.title}>Información de la cuenta</Text>
                <Text style={styles.subtitle}>
                  Completa los siguientes campos para crear tu cuenta
                </Text>

                {error !== "" && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Campo de correo */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="mail" size={20} color="#10b981" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electronico"
                    value={username}
                    onChangeText={setUsername}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Campo de contraseña */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="lock-closed" size={20} color="#10b981" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>

                {/* Indicador de seguridad de contraseña */}
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthIndicator}>
                    <View
                      style={[
                        styles.strengthBar,
                        password.length >= 8 ? styles.strengthBarActive : null,
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        /[A-Z]/.test(password)
                          ? styles.strengthBarActive
                          : null,
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        /[0-9]/.test(password)
                          ? styles.strengthBarActive
                          : null,
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        /[!@#$%^&*(),.?":{}|<>]/.test(password)
                          ? styles.strengthBarActive
                          : null,
                      ]}
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {password.length === 0
                      ? "Debe incluir: 8+ caracteres, mayúscula, número, carácter especial"
                      : getPasswordStrength(password)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="white"
                        />
                        <Text style={styles.buttonText}>Registrarse</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={60} color="#10b981" />
                </View>
                <Text style={styles.successTitle}>¡Cuenta creada!</Text>
                <Text style={styles.successSubtitle}>
                  Te hemos enviado un correo de verificación. Revisa tu bandeja
                  de entrada para activar tu cuenta.
                </Text>
              </View>
            )}
          </View>

          {/* Enlaces adicionales */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: height * 0.32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -30,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
    marginTop: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 16,
    paddingRight: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  passwordStrength: {
    marginBottom: 24,
  },
  strengthIndicator: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: "#10b981",
  },
  strengthText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  linksContainer: {
    alignItems: "center",
    gap: 16,
  },
  linkText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "500",
  },
});
