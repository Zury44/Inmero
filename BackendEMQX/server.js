import express from "express";
import bodyParser from "body-parser";
import mqtt from "mqtt";
import { Expo } from "expo-server-sdk";

const app = express();
const expo = new Expo();
app.use(bodyParser.json());

// Almacenamiento en memoria de tokens (userId: token)
const tokens = {};

// Endpoint para guardar el token de un usuario
app.post("/api/token", (req, res) => {
  console.log("📥 Body recibido:", req.body);

  const { userId, token } = req.body || {};

  if (!userId || !token) {
    console.log("❌ Body incompleto o malformado");
    return res.status(400).send("Faltan campos requeridos");
  }

  if (!Expo.isExpoPushToken(token)) {
    console.log("❌ Token inválido:", token);
    return res.status(400).send("Token inválido");
  }

  tokens[userId] = token;
  console.log(`✅ Token guardado para ${userId}: ${token}`);
  res.send("Token recibido");
});

// Conexión al broker EMQX
const mqttClient = mqtt.connect(
  "mqtts://castro:Castro.2025@t642eaaf.ala.us-east-1.emqxsl.com:8883",
  {
    rejectUnauthorized: false,
  }
);

mqttClient.on("connect", () => {
  console.log("✅ Conectado al broker EMQX");
  mqttClient.subscribe("sensor/temperatura");
});

mqttClient.on("message", async (topic, payload) => {
  const data = JSON.parse(payload.toString());
  const temp = data.temperatura;

  if (temp >= 36) {
    for (const userId in tokens) {
      const messages = [
        {
          to: tokens[userId],
          sound: "default",
          title: "🌡️ Alerta de Temperatura",
          body: `El sensor registró ${temp}°C`,
        },
      ];

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          const receipts = await expo.sendPushNotificationsAsync(chunk);
          console.log(`📤 Notificación enviada a ${userId}:`, receipts);
        } catch (error) {
          console.error("❌ Error enviando push:", error);
        }
      }
    }
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Backend escuchando en http://192.168.193.85:${PORT}`);
});
