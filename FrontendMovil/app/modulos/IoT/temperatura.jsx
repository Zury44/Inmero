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
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { useMQTT } from "../../../hooks/useMQTT";

const screenWidth = Dimensions.get("window").width;
const maxPoints = 10;

export default function Temperatura() {
  const { temperature, humidity, lastUpdateTime } = useMQTT();
  const router = useRouter();

  const [temperatures, setTemperatures] = useState([]);
  const [labels, setLabels] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Diario");

  useEffect(() => {
    if (temperature === null || isNaN(temperature)) return;

    const now = new Date();
    const timeLabel = now
      .toLocaleTimeString("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace("a. m.", "am")
      .replace("p. m.", "pm");

    setTemperatures((prev) => {
      const updated = [...prev, parseFloat(temperature)];
      if (updated.length > maxPoints) updated.shift();
      return updated;
    });

    setLabels((prev) => {
      const updated = [...prev, timeLabel];
      if (updated.length > maxPoints) updated.shift();
      return updated;
    });

    setCurrentTime(timeLabel);
  }, [temperature]);

  const isValidData =
    temperatures.length >= 2 && temperatures.every((n) => isFinite(n));

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
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

      {/* Selector de intervalo de tiempo */}
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

      {/* Grafica */}
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
              decimalPlaces: 1,
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

      {/* Cards de temperatura y humedad */}
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
          Última actualización: {lastUpdateTime.toLocaleTimeString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  menuButton: {
    marginLeft: "auto",
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  periodContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a90e2",
  },
  periodButtonActive: {
    backgroundColor: "#4a90e2",
  },
  periodText: {
    color: "#4a90e2",
    fontWeight: "600",
  },
  periodTextActive: {
    color: "#fff",
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  dataContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  dataCard: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f0f4f8",
    width: "40%",
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  dataValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: "#666",
  },
  lastUpdate: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 12,
    color: "#999",
  },
});
