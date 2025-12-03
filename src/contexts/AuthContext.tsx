import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const isAdmin = !!user?.roles?.includes("admin");

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const jwt = data.token;

      localStorage.setItem("token", jwt);
      setToken(jwt);

      await fetchMe(jwt); // langsung fetch user setelah login
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const fetchMe = async (overrideToken?: string) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return;

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch me failed:", errorText);
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      setUser({
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      });
    } catch (error) {
      console.error("Fetch me error:", error);
      logout();
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, login, logout, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
