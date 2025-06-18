import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMQTT } from "../../hooks/useMQTT";
import CustomHeader from "../../components/CustomHeader";

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

  useEffect(() => {
    if (lastMessage?.topic === "sensor/temperatura") {
      setLastUpdateTime(new Date());
    }
  }, [lastMessage]);

  useEffect(() => {
    const registerPushToken = async () => {
      if (!Device.isDevice) return;

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
            userId: "usuario123",
            token,
          }),
        });
      } catch (error) {
        console.error("❌ Error enviando token al backend:", error);
      }
    };

    registerPushToken();
  }, []);

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
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
});
