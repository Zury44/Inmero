import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSession } from "../../context/SessionContext";
import axios from "axios";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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

export default function ChangePassword() {
  const { token } = useSession();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Completa ambos campos");
      return;
    }

    // Validación de nueva contraseña
    if (newPassword.length < 8) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe incluir al menos una mayúscula."
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe incluir al menos un número."
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe incluir al menos un carácter especial."
      );
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe ser diferente a la actual."
      );
      return;
    }

    setLoading(true);
    try {
      console.log("TOKEN:", token);

      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsPasswordChanged(true);

      setTimeout(() => {
        Alert.alert(
          "¡Éxito!",
          "Tu contraseña ha sido actualizada correctamente. Por seguridad, se recomienda cerrar sesión en otros dispositivos.",
          [
            {
              text: "Entendido",
              onPress: () => router.back(),
            },
          ]
        );
      }, 1000);

      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "No se pudo cambiar la contraseña";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.replace("/profile");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#f59e0b" />

      {/* Header con gradiente */}
      <LinearGradient
        colors={["#f59e0b", "#d97706", "#b45309"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
          <Text style={styles.headerSubtitle}>
            Actualiza tu contraseña para mantener tu cuenta segura
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {!isPasswordChanged ? (
              <>
                <Text style={styles.title}>Actualizar credenciales</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu contraseña actual y la nueva contraseña que deseas
                  usar
                </Text>

                {/* Campo de contraseña actual */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Contraseña actual</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed" size={20} color="#f59e0b" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Contraseña actual"
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry={!showOldPassword}
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowOldPassword(!showOldPassword)}
                    >
                      <Ionicons
                        name={showOldPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Campo de nueva contraseña */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Nueva contraseña</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed" size={20} color="#f59e0b" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={showNewPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Indicador de seguridad de contraseña */}
                {newPassword.length > 0 && (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthIndicator}>
                      <View
                        style={[
                          styles.strengthBar,
                          newPassword.length >= 8
                            ? styles.strengthBarActive
                            : null,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          /[A-Z]/.test(newPassword)
                            ? styles.strengthBarActive
                            : null,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          /[0-9]/.test(newPassword)
                            ? styles.strengthBarActive
                            : null,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                            ? styles.strengthBarActive
                            : null,
                        ]}
                      />
                    </View>
                    <Text style={styles.strengthText}>
                      {getPasswordStrength(newPassword)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#f59e0b", "#d97706"]}
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
                        <Text style={styles.buttonText}>
                          Actualizar contraseña
                        </Text>
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
                <Text style={styles.successTitle}>
                  ¡Contraseña actualizada!
                </Text>
                <Text style={styles.successSubtitle}>
                  Tu contraseña ha sido cambiada exitosamente. Tu cuenta está
                  ahora más segura.
                </Text>
              </View>
            )}
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
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  stepActive: {
    backgroundColor: "#f59e0b",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
    lineHeight: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
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
    backgroundColor: "#f59e0b",
  },
  strengthText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#f59e0b",
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
  securityTips: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  tipsList: {
    gap: 12,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipText: {
    fontSize: 14,
    color: "#475569",
    marginLeft: 8,
    flex: 1,
  },
});
