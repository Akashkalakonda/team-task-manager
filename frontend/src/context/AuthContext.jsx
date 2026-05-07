import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "team-task-manager-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.me(token);
        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (authData) => {
    localStorage.setItem(TOKEN_KEY, authData.token);
    setToken(authData.token);
    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, isAdmin: user?.role === "ADMIN", login, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
