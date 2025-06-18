// hooks/useMQTT.js
import { Buffer } from "buffer";
import mqtt from "mqtt";
import { useEffect, useRef, useState } from "react";

global.Buffer = global.Buffer || Buffer;

export const useMQTT = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [lastMessage, setLastMessage] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    const host = "wss://t642eaaf.ala.us-east-1.emqxsl.com:8084/mqtt";
    const username = "castro";
    const password = "Castro.2025";

    const client = mqtt.connect(host, {
      username,
      password,
      protocol: "wss",
      reconnectPeriod: 5000,
      connectTimeout: 4000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("🟢 Conectado a EMQX");
      setConnected(true);
      setIsConnecting(false);
      client.subscribe("sensor/temperatura", { qos: 0 });
    });

    client.on("reconnect", () => {
      setIsConnecting(true);
    });

    client.on("close", () => {
      setConnected(false);
      setIsConnecting(false);
    });

    client.on("message", (topic, message) => {
      setLastMessage({ topic, message: message.toString() });
      if (topic === "sensor/temperatura") {
        try {
          const data = JSON.parse(message.toString());
          setTemperature(data.temperatura);
          setHumidity(data.humedad);
        } catch (e) {
          console.error("❌ Error parseando mensaje:", e);
        }
      }
    });

    client.on("error", (err) => {
      console.error("❌ Error MQTT:", err);
    });

    return () => {
      client.end();
    };
  }, []);

  const connect = () => {
    if (clientRef.current) clientRef.current.reconnect();
  };

  const toggleDevice = (topic, estado) => {
    if (clientRef.current) {
      const payload = JSON.stringify({ estado: estado.toUpperCase() });
      clientRef.current.publish(topic, payload);
    }
  };

  return {
    connected,
    temperature,
    humidity,
    toggleDevice,
    connect,
    isConnecting,
    lastMessage,
  };
};
