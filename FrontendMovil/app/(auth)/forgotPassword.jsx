import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import LogoInmero from "../../components/LogoInmero";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const { API_URL } = Constants.expoConfig.extra;

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });

      setEmail(""); // Limpiar campo
      router.replace("/EmailVerificationSent"); // Navegar a la vista de confirmación
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.logoContainer, { marginTop: insets.top }]}>
        <LogoInmero width={150} height={140} />
      </View>

      <Text style={styles.title}>Recuperar contraseña</Text>

      <Text style={styles.subtitle}>
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSendResetEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.loginButtonText}>
              Enviar enlace de recuperación
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>
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
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    marginTop: 20,
    gap: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
