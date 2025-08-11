import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoInmero from "../../components/LogoInmero";

export default function CorreoEnviado() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.logoContainer, { marginTop: insets.top + 0 }]}>
        <LogoInmero width={150} height={140} />
      </View>

      <Image
        source={require("../../assets/images/emailsent.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>¡Revisa tu correo!</Text>
      <Text style={styles.description}>
        Te hemos enviado un enlace para restablecer tu contraseña. Por favor,
        revisa tu bandeja de entrada.
      </Text>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.linkText}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: 240,
    height: 240,
    marginTop: 120,
    marginBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  footer: {
    marginTop: 60,
  },
  linkText: {
    fontSize: 15,
    color: "#3686F7",
    fontWeight: "600",
  },
});
