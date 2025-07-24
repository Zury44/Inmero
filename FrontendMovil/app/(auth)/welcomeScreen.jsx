import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.topContent}>
        {/* Logo Inmero */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Imagen ilustración */}
        <Image
          source={require("../../assets/images/welcome.png")}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Texto bienvenida */}
        <Text style={styles.welcomeText}>
          ¡Bienvenido a <Text style={styles.boldText}>Inmero</Text>!
        </Text>

        {/* Selector de idioma */}
        <TouchableOpacity style={styles.languageSelector}>
          <Ionicons name="language-outline" size={16} color="#555" />
          <Text style={styles.languageText}>Español</Text>
          <Ionicons name="chevron-down" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Contenedor de botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "space-between", // aún separa topContent y botones
  },
  topContent: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 4, // reduce el espacio entre logo e imagen
  },
  logo: {
    width: 150,
    height: 140,
  },
  image: {
    width: 280,
    height: 240,
    marginTop: 0,
    marginBottom: 8, // control sobre separación con texto
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  boldText: {
    color: "#003366",
    fontWeight: "bold",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    gap: 10,
  },
  languageText: {
    fontSize: 14,
    color: "#333",
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#3686F7",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    gap: 10,
    width: 290,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    gap: 10,
    width: 290,
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
    marginTop: 10,
    marginBottom: 85,
    alignItems: "center", // ✅ esto centra horizontalmente
  },
});
