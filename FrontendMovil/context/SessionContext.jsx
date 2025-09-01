import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios";

const { API_URL } = Constants.expoConfig.extra;

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [rolesByCompany, setRolesByCompany] = useState([]);
  const [token, setTokenState] = useState(null);
  const [username, setUsernameState] = useState(null);

  //  Guardar token en AsyncStorage y en estado
  const setToken = async (newToken) => {
    try {
      await AsyncStorage.setItem("token", newToken);
      setTokenState(newToken);
    } catch (error) {
      console.error("Error guardando el token:", error);
    }
  };

  const setUsername = async (newUsername) => {
    try {
      await AsyncStorage.setItem("username", newUsername);
      setUsernameState(newUsername);
    } catch (error) {
      console.error("Error guardando el username:", error);
    }
  };

  const guardarSesionCompleta = async ({
    token,
    empresaId,
    rolId,
    empresaNombre,
    rolNombre,
    rolesByCompany,
  }) => {
    try {
      // Validar datos requeridos
      if (!token) {
        throw new Error("Token es requerido");
      }
      if (!empresaId || !rolId) {
        throw new Error("empresaId y rolId son requeridos");
      }

      // Guardar token
      await AsyncStorage.setItem("token", token);
      setTokenState(token);

      // Guardar contexto actual
      const contexto = {
        empresaId,
        rolId,
        empresaNombre: empresaNombre || "Sin nombre",
        rolNombre: rolNombre || "Sin rol",
      };
      await AsyncStorage.setItem(
        "empresaSeleccionada",
        JSON.stringify(contexto)
      );
      setEmpresaSeleccionada(contexto);

      const rolesValidos = rolesByCompany || [];
      await AsyncStorage.setItem(
        "rolesByCompany",
        JSON.stringify(rolesValidos)
      );
      setRolesByCompany(rolesValidos);

      console.log(" Sesión guardada correctamente:", {
        empresaId,
        rolId,
        empresaNombre,
        rolNombre,
        rolesDisponibles: rolesValidos.length,
      });
    } catch (error) {
      console.error("Error guardando la sesión completa:", error);
      throw error;
    }
  };

  const cambiarContexto = async (
    empresaId,
    rolId,
    rememberAsDefault = true
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/switch-context`,
        {
          empresaId,
          rolId,
          rememberAsDefault,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { token: newToken } = response.data;

      // Buscar información completa de la empresa/rol
      const empresaInfo = rolesByCompany.find(
        (item) => item.empresaId === empresaId && item.rolId === rolId
      );

      await guardarSesionCompleta({
        token: newToken,
        empresaId,
        rolId,
        empresaNombre: empresaInfo?.empresaNombre,
        rolNombre: empresaInfo?.rolNombre,
        rolesByCompany,
      });

      return true;
    } catch (error) {
      console.error("Error cambiando contexto:", error);

      // Manejar errores según el changelog
      if (error.response?.status === 403) {
        throw new Error("No tienes acceso a ese rol/empresa.");
      }
      throw new Error("Error al cambiar contexto. Intenta nuevamente.");
    }
  };

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUsername = await AsyncStorage.getItem("username");
        const savedEmpresa = await AsyncStorage.getItem("empresaSeleccionada");
        const savedRoles = await AsyncStorage.getItem("rolesByCompany");

        if (savedToken) setTokenState(savedToken);
        if (savedUsername) setUsernameState(savedUsername);
        if (savedEmpresa) setEmpresaSeleccionada(JSON.parse(savedEmpresa));
        if (savedRoles) setRolesByCompany(JSON.parse(savedRoles));
      } catch (error) {
        console.error("Error cargando la sesión:", error);
      }
    };

    cargarSesion();
  }, []);

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token",
        "username",
        "empresaSeleccionada",
        "rolesByCompany",
      ]);
      setTokenState(null);
      setUsernameState(null);
      setEmpresaSeleccionada(null);
      setRolesByCompany([]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const tieneMultiplesOpciones = () => {
    return rolesByCompany && rolesByCompany.length > 1;
  };

  const decodificarToken = (tokenParam = null) => {
    const tokenADecodificar = tokenParam || token;
    if (!tokenADecodificar) return null;

    try {
      const payload = tokenADecodificar.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  };

  const tokenEsValido = () => {
    const claims = decodificarToken();
    if (!claims) return false;

    const ahora = Math.floor(Date.now() / 1000);
    return claims.exp > ahora;
  };

  //D
  const setEmpresasDisponibles = setRolesByCompany;
  const empresasDisponibles = rolesByCompany;
  const guardarSesionSeleccion = guardarSesionCompleta;

  return (
    <SessionContext.Provider
      value={{
        // Estado principal
        empresaSeleccionada,
        setEmpresaSeleccionada,
        rolesByCompany,
        setRolesByCompany,
        token,
        setToken,
        username,
        setUsername,

        // Funciones principales
        guardarSesionCompleta,
        cambiarContexto,
        cerrarSesion,

        // Helpers
        tieneMultiplesOpciones,
        decodificarToken,
        tokenEsValido,

        empresasDisponibles,
        setEmpresasDisponibles,
        guardarSesionSeleccion,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
