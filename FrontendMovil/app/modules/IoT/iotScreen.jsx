import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMQTT } from "../../../hooks/useMQTT";
import CustomHeader from "../../../components/CustomHeader";
import { useSession } from "../../../context/SessionContext";

export default function iotScreen() {
  const {
    connected,
    temperature,
    humidity,
    toggleDevice,
    connect,
    isConnecting,
    lastMessage,
  } = useMQTT();

  const [lightState, setLightState] = useState(false);
  const [fanState, setFanState] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const [nivel, setNivel] = useState(0);
  const [animacionNivel] = useState(new Animated.Value(0));

  const { username } = useSession(); // ✅ usamos username del contexto

  // Animación del nivel del tanque
  useEffect(() => {
    if (lastMessage?.topic === "tanque/nivel") {
      const valor = parseFloat(lastMessage.message);
      if (!isNaN(valor)) {
        setNivel(valor);
        Animated.timing(animacionNivel, {
          toValue: valor,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [lastMessage]);

  const heightInterpolada = animacionNivel.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // ✅ Enviar el token push al backend con el userId correcto
  useEffect(() => {
    const registerPushToken = async () => {
      if (!Device.isDevice || !username) {
        console.warn("⚠️ Dispositivo no válido o username no disponible");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);

      try {
        await fetch("http://192.168.193.85:3000/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: username,
            token,
          }),
        });
      } catch (error) {
        console.error("❌ Error enviando token al backend:", error);
      }
    };

    registerPushToken();
  }, [username]); // ✅ Se ejecuta cuando username está disponible

  const handleToggle = async (type) => {
    if (type === "bombillo") {
      const newState = !lightState;
      setLightState(newState);
      await toggleDevice("sensor/bombillo", newState ? "on" : "off");
    } else if (type === "ventilador") {
      const newState = !fanState;
      setFanState(newState);
      await toggleDevice("sensor/ventilador", newState ? "on" : "off");
    }
  };

  const handleReconnect = async () => {
    if (!connected && !isConnecting) {
      await connect();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Panel IoT" backRoute="(tabs)/home" />

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: connected ? "#27ae60" : "#e74c3c" },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnecting
              ? "Conectando..."
              : connected
              ? "Conectado"
              : "Desconectado"}
          </Text>
          {isConnecting && <ActivityIndicator size="small" color="#e67e22" />}
          {!connected && !isConnecting && (
            <TouchableOpacity
              onPress={handleReconnect}
              style={styles.reconnectBtn}
            >
              <Text style={styles.reconnectText}>Reconectar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌡️ Temperatura y Humedad</Text>
          <View style={styles.sensorRow}>
            <View style={styles.sensorBlock}>
              <Text style={styles.label}>Temperatura</Text>
              <Text style={styles.value}>
                {temperature !== null ? `${temperature}°C` : "--"}
              </Text>
            </View>
            <View style={styles.sensorBlock}>
              <Text style={styles.label}>Humedad</Text>
              <Text style={styles.value}>
                {humidity !== null ? `${humidity}%` : "--"}
              </Text>
            </View>
          </View>
          {lastUpdateTime && (
            <Text style={styles.lastUpdate}>
              Última actualización: {lastUpdateTime.toLocaleTimeString()}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Control de Bombillo</Text>
          <View style={styles.lightControlRow}>
            <Text style={styles.label}>Estado:</Text>
            <Switch
              value={lightState}
              onValueChange={() => handleToggle("bombillo")}
              disabled={!connected}
            />
            <Text>{lightState ? "Encendido" : "Apagado"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌀 Control de Ventilador</Text>
          <View style={styles.lightControlRow}>
            <Text style={styles.label}>Estado:</Text>
            <Switch
              value={fanState}
              onValueChange={() => handleToggle("ventilador")}
              disabled={!connected}
            />
            <Text>{fanState ? "Encendido" : "Apagado"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚰 Nivel del Tanque</Text>
          <View style={styles.tankContainer}>
            <View style={styles.tank}>
              {[25, 50, 75].map((pct) => (
                <View
                  key={pct}
                  style={[styles.levelMark, { bottom: `${pct}%` }]}
                />
              ))}
              <Animated.View
                style={[styles.fill, { height: heightInterpolada }]}
              />
              <View style={styles.tankOverlay}>
                <Text style={styles.tankText}>{nivel.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  reconnectBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reconnectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 12,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sensorBlock: {
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#34495e",
  },
  lastUpdate: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
  lightControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tankContainer: {
    height: 200,
    width: 60,
    borderWidth: 2,
    borderColor: "#2c3e50",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ccc",
    alignSelf: "center",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  tank: {
    flex: 1,
    justifyContent: "flex-end",
    position: "relative",
  },
  fill: {
    backgroundColor: "#4da6ff",
    width: "100%",
    position: "absolute",
    bottom: 0,
    zIndex: 0,
  },
  levelMark: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#ffffff80",
    zIndex: 1,
  },
  tankOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  tankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
