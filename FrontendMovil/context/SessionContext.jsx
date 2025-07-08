import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [token, setTokenState] = useState(null);
  const [username, setUsernameState] = useState(null);

  // ✅ Guardar token en AsyncStorage y en estado
  const setToken = async (newToken) => {
    try {
      await AsyncStorage.setItem("token", newToken);
      setTokenState(newToken);
    } catch (error) {
      console.error("Error guardando el token:", error);
    }
  };

  // ✅ Guardar username también en AsyncStorage
  const setUsername = async (newUsername) => {
    try {
      await AsyncStorage.setItem("username", newUsername);
      setUsernameState(newUsername);
    } catch (error) {
      console.error("Error guardando el username:", error);
    }
  };

  // ✅ Cargar token y username al iniciar
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUsername = await AsyncStorage.getItem("username");
        if (savedToken) setTokenState(savedToken);
        if (savedUsername) setUsernameState(savedUsername);
      } catch (error) {
        console.error("Error cargando la sesión:", error);
      }
    };

    cargarSesion();
  }, []);

  // ✅ Cerrar sesión y limpiar todo
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "username"]);
      setTokenState(null);
      setUsernameState(null);
      setEmpresaSeleccionada(null);
      setEmpresasDisponibles([]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        empresaSeleccionada,
        setEmpresaSeleccionada,
        empresasDisponibles,
        setEmpresasDisponibles,
        token,
        setToken,
        username,
        setUsername,
        cerrarSesion,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
