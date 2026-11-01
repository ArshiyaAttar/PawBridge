import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (updatedUser) => {
    localStorage.setItem(
      "pawbridge_user",
      JSON.stringify(updatedUser)
    );
    setUser(updatedUser);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("pawbridge_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get("/auth/me");
        updateUser(data.user);
      } catch {
        localStorage.removeItem("pawbridge_token");
        localStorage.removeItem("pawbridge_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await API.post("/auth/login", credentials);

    localStorage.setItem("pawbridge_token", data.token);
    updateUser(data.user);

    return data;
  };

  const register = async (details) => {
    const { data } = await API.post("/auth/register", details);

    localStorage.setItem("pawbridge_token", data.token);
    updateUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("pawbridge_token");
    localStorage.removeItem("pawbridge_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);