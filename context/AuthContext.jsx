"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async (email, password) => {},
  register: async (authData) => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check localStorage cache first (10 minutes cache)
        const cachedData = localStorage.getItem("kdsm-user-cache");
        const cacheExpiry = localStorage.getItem("kdsm-user-cache-expiry");
        
        if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
          // Use cached data
          const userData = JSON.parse(cachedData);
          setUser(userData);
          setLoading(false);
          return;
        }

        // Fetch fresh data if cache is expired or doesn't exist
        const response = await fetch("/api/auth/user", {
          cache: "no-store", // Ensure fresh data from server
        });
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          // Cache the user data for 10 minutes (600000ms)
          localStorage.setItem("kdsm-user-cache", JSON.stringify(data.user));
          localStorage.setItem("kdsm-user-cache-expiry", (Date.now() + 600000).toString());
        } else {
          // Clear invalid cache
          localStorage.removeItem("kdsm-user-cache");
          localStorage.removeItem("kdsm-user-cache-expiry");
        }
      } catch (err) {
        console.error("Session check failed:", err);
        // Clear cache on error
        localStorage.removeItem("kdsm-user-cache");
        localStorage.removeItem("kdsm-user-cache-expiry");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store", // Don't cache POST requests
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Fetch user data after successful login
      const userResponse = await fetch("/api/auth/user", {
        cache: "no-store",
      });
      const userData = await userResponse.json();

      if (userData.success && userData.user) {
        setUser(userData.user);
        // Update cache with fresh data
        localStorage.setItem("kdsm-user-cache", JSON.stringify(userData.user));
        localStorage.setItem("kdsm-user-cache-expiry", (Date.now() + 600000).toString());
      }

      return data.session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (authData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
        cache: "no-store", // Don't cache POST requests
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login after registration
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
        cache: "no-store", // Don't cache DELETE requests
      });

      const data = await response.json();

      if (!data.success) {
        console.warn("Logout API failed:", data.error);
      }

      // Always clear user state regardless of API response
      setUser(null);

      // Clear user cache
      localStorage.removeItem("kdsm-user-cache");
      localStorage.removeItem("kdsm-user-cache-expiry");

      // Optional: Redirect to login page
      // window.location.href = '/auth/login';
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
      // Still clear user state and cache on error
      setUser(null);
      localStorage.removeItem("kdsm-user-cache");
      localStorage.removeItem("kdsm-user-cache-expiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
