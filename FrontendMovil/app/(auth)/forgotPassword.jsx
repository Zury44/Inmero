import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const { API_URL } = Constants.expoConfig.extra;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });

      setIsEmailSent(true);

      setTimeout(() => {
        Alert.alert(
          "Correo enviado",
          "Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.",
          [{ text: "Aceptar", onPress: () => router.replace("/") }]
        );
      }, 1000);

      setEmail("");
    } catch (error) {
      console.error(error?.response?.data || error.message);
      Alert.alert(
        "Error",
        "No se pudo enviar el correo. Verifica el correo ingresado."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header con gradiente */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
          <Text style={styles.headerSubtitle}>
            No te preocupes, te ayudamos a recuperar tu cuenta
          </Text>
        </View>
      </LinearGradient>

      {/* Contenido principal */}
      <View style={styles.content}>
        <View style={styles.card}>
          {!isEmailSent ? (
            <>
              <Text style={styles.title}>Ingresa tu correo electrónico</Text>
              <Text style={styles.subtitle}>
                Te enviaremos un enlace seguro para restablecer tu contraseña
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail" size={20} color="#6366f1" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electronico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendResetEmail}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="white" />
                      <Text style={styles.buttonText}>Enviar enlace</Text>
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
              <Text style={styles.successTitle}>¡Correo enviado!</Text>
              <Text style={styles.successSubtitle}>
                Revisa tu bandeja de entrada y sigue las instrucciones para
                restablecer tu contraseña
              </Text>
            </View>
          )}
        </View>

        {/* Enlaces adicionales */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: height * 0.35,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -30,
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  stepActive: {
    backgroundColor: "#6366f1",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 16,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 16,
    paddingRight: 16,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#6366f1",
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
    backgroundColor: "rgba(99, 102, 241, 0.1)",
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
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "500",
  },
});
