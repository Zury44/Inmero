import "dotenv/config";

export default {
  expo: {
    name: "FrontendMovil",
    slug: "FrontendMovil",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      permissions: ["CAMERA"],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-barcode-scanner",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_URL: process.env.API_URL,
      API_KEY: process.env.API_KEY,
      API_URL_LOGIN: process.env.API_URL_LOGIN,
      API_URL_SELECTION: process.env.API_URL_SELECTION,
      API_CAMARA_URL: process.env.API_CAMARA_URL,
      MQTT_BROKER_URL: process.env.MQTT_BROKER_URL,
      MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID,
      MQTT_USERNAME: process.env.MQTT_USERNAME,
      MQTT_PASSWORD: process.env.MQTT_PASSWORD,
      MQTT_TOPIC: process.env.MQTT_TOPIC,
      MQTT_RECONNECT_PERIOD: process.env.MQTT_RECONNECT_PERIOD,
      MQTT_CONNECT_TIMEOUT: process.env.MQTT_CONNECT_TIMEOUT,
      MQTT_CLEAN: process.env.MQTT_CLEAN,
      eas: {
        projectId: process.env.EXPO_PUBLIC_projectId, // 👈 clave para funcionar en web
      },
    },
  },
};
