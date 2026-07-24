import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/users/profile");
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          // User is not authenticated
          setUser(null);
        } else {
          // Server error, network error, etc.
          console.error("Failed to check authentication:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/users/register", {
        name,
        email,
        password,
      });

      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/users/profile", data);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (data) => {
    try {
      const response = await api.put("/users/change-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};