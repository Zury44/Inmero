import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
// import { useMQTT } from "../../../hooks/useMQTT"; // Comentado para simulación

const screenWidth = Dimensions.get("window").width;
const maxPoints = 10;

export default function Temperatura() {
  // Simulando datos MQTT
  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [lastUpdateTime] = useState(new Date());

  const [temperatures, setTemperatures] = useState([
    22, 23, 25, 28, 32, 29, 26, 24, 23, 24,
  ]);
  const [labels, setLabels] = useState([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ]);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Diario");

  // Simular actualizaciones de datos cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Generar temperatura aleatoria entre 20-35°C
      const newTemp = Math.round((Math.random() * 15 + 20) * 10) / 10;
      // Generar humedad aleatoria entre 40-80%
      const newHumidity = Math.round(Math.random() * 40 + 40);

      setTemperature(newTemp);
      setHumidity(newHumidity);

      const now = new Date();
      const timeLabel = now
        .toLocaleTimeString("es-CO", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace("a. m.", "am")
        .replace("p. m.", "pm");

      setCurrentTime(timeLabel);

      setTemperatures((prev) => {
        const updated = [...prev, newTemp];
        if (updated.length > maxPoints) updated.shift();
        return updated;
      });

      setLabels((prev) => {
        const updated = [...prev, timeLabel];
        if (updated.length > maxPoints) updated.shift();
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isValidData = temperatures.length >= 2;

  const spacedLabels = labels.map((label, index) => {
    const lastIndex = labels.length - 1;
    if (
      index === 0 ||
      index === Math.floor(lastIndex / 2) ||
      index === lastIndex
    ) {
      return label;
    }
    return "";
  });

  const periods = ["Diario", "Semanal", "Mensual"];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Temperatura</Text>
          <Text style={styles.subtitle}>
            Datos de temperatura en tiempo real
          </Text>
          <Text style={styles.date}></Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {isValidData ? (
          <LineChart
            data={{
              labels: spacedLabels,
              datasets: [
                {
                  data: temperatures,
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 32}
            height={280}
            yAxisSuffix="°C"
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "#f8f9fa",
              backgroundGradientTo: "#f8f9fa",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
              style: {
                borderRadius: 0,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#4a90e2",
                fill: "#4a90e2",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#e0e0e0",
                strokeWidth: 1,
              },
              fillShadowGradient: "#4a90e2",
              fillShadowGradientOpacity: 0.1,
            }}
            bezier
            style={styles.chart}
            withShadow={false}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Esperando datos...</Text>
          </View>
        )}
      </View>

      {/* Temperature and Humidity Cards */}
      <View style={styles.dataContainer}>
        <View style={styles.dataCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🌡️</Text>
          </View>
          <Text style={styles.dataValue}>
            {temperature !== null ? `${temperature}°C` : "--"}
          </Text>
          <Text style={styles.dataLabel}>Temperatura</Text>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💧</Text>
          </View>
          <Text style={styles.dataValue}>
            {humidity !== null ? `${humidity}%` : "--"}
          </Text>
          <Text style={styles.dataLabel}>Humedad</Text>
        </View>
      </View>

      {lastUpdateTime && (
        <Text style={styles.lastUpdate}>
          Última actualización: {new Date().toLocaleTimeString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 24,
    color: "#333",
    transform: [{ rotate: "90deg" }],
  },
  periodContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: "#4a90e2",
  },
  periodText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  periodTextActive: {
    color: "white",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  chart: {
    borderRadius: 0,
  },
  loadingContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
  },
  dataContainer: {
    flexDirection: "row",
    paddingHorizontal: 40,
    justifyContent: "space-around",
    marginBottom: 30,
  },
  dataCard: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8f4fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  dataValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: "#666",
  },
  lastUpdate: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
});
