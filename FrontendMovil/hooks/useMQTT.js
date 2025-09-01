import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { Buffer } from "buffer";
import process from "process";
import EventEmitter from "events";
import Constants from "expo-constants";

// Polyfills necesarios para React Native
global.Buffer = global.Buffer || Buffer;
global.process = global.process || process;
global.EventEmitter = global.EventEmitter || EventEmitter;

// Extraer variables del archivo .env vía app.config.js
const {
  MQTT_BROKER_URL,
  MQTT_CLIENT_ID,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_RECONNECT_PERIOD,
  MQTT_CONNECT_TIMEOUT,
  MQTT_CLEAN,
  MQTT_TOPIC,
} = Constants.expoConfig.extra || {};

console.log("MQTT CONFIG", {
  MQTT_BROKER_URL,
  MQTT_CLIENT_ID,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_RECONNECT_PERIOD,
  MQTT_CONNECT_TIMEOUT,
  MQTT_CLEAN,
  MQTT_TOPIC,
});

export const useMQTT = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [lastMessage, setLastMessage] = useState(null);

  const clientRef = useRef(null);

  // Lista de tópicos a suscribirse
  const topics = [
    MQTT_TOPIC, // Tu tópico principal (temperatura/humedad)
    "tanque/nivel",
    "sensor/agua/ultrasonico",
    "sensor/bombillo",
    "sensor/ventilador",
  ];

  useEffect(() => {
    if (clientRef.current) return;

    const client = mqtt.connect(MQTT_BROKER_URL, {
      clientId:
        MQTT_CLIENT_ID || `client_${Math.random().toString(16).slice(2, 10)}`,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: Number(MQTT_RECONNECT_PERIOD || 5000),
      connectTimeout: Number(MQTT_CONNECT_TIMEOUT || 4000),
      clean: MQTT_CLEAN === "true",
    });

    clientRef.current = client;

    client.removeAllListeners();

    client.on("connect", () => {
      console.log("Conectado al broker MQTT");
      setConnected(true);
      setIsConnecting(false);

      // Suscribirse a múltiples tópicos
      topics.forEach((topic) => {
        if (topic) {
          // Verificar que el tópico no sea undefined
          client.subscribe(topic, { qos: 0 }, (err) => {
            if (err) {
              console.error(`Error al suscribirse a ${topic}:`, err);
            } else {
              console.log(`Suscrito a: ${topic}`);
            }
          });
        }
      });
    });

    client.on("reconnect", () => {
      console.log("Reintentando conexión...");
      setIsConnecting(true);
    });

    client.on("close", () => {
      console.log("Desconectado");
      setConnected(false);
      setIsConnecting(false);
    });

    client.on("message", (topic, message) => {
      const payload = message.toString();
      console.log(`Mensaje recibido [${topic}]: ${payload}`);
      setLastMessage({ topic, message: payload });

      // Manejar diferentes tipos de mensajes según el tópico
      if (topic === MQTT_TOPIC) {
        try {
          const data = JSON.parse(payload);
          if (typeof data.temperatura === "number") {
            setTemperature(data.temperatura);
          }
          if (typeof data.humedad === "number") {
            setHumidity(data.humedad);
          }
        } catch (error) {
          console.error("Error al parsear JSON:", error);
        }
      }
      // Los demás tópicos se manejan directamente en los componentes usando lastMessage
    });

    client.on("error", (err) => {
      console.error("Error MQTT:", err);
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, []);

  const connect = () => {
    if (clientRef.current && !connected) {
      clientRef.current.reconnect();
    }
  };

  const toggleDevice = (topic, estado) => {
    if (!clientRef.current || !connected) {
      console.warn("🔌 Cliente no conectado. No se puede publicar.");
      return;
    }

    const payload = JSON.stringify({ estado: estado.toUpperCase() });
    console.log(`Publicando a ${topic}: ${payload}`);

    clientRef.current.publish(topic, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error("Error al publicar:", err);
      } else {
        console.log(`Mensaje publicado exitosamente a ${topic}`);
      }
    });
  };

  return {
    connected,
    isConnecting,
    temperature,
    humidity,
    lastMessage,
    toggleDevice,
    connect,
  };
};
