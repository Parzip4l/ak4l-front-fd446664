import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Authentication context for managing user sessions and JWT tokens
 * Supports admin and regular user roles with persistent login state
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ak4l_token');
    const savedUser = localStorage.getItem('ak4l_user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ak4l_token');
        localStorage.removeItem('ak4l_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Login function with dummy authentication
   * In production, this would make API calls to validate credentials
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy authentication logic
      let userData: User;
      let mockToken: string;

      if (email === 'admin@ak4l.com' && password === 'admin123') {
        userData = {
          id: 'admin_001',
          name: 'Administrator AK4L',
          email: 'admin@ak4l.com',
          role: 'admin'
        };
        mockToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.token';
      } else if (email === 'user@ak4l.com' && password === 'user123') {
        userData = {
          id: 'user_001',
          name: 'User AK4L',
          email: 'user@ak4l.com',
          role: 'user'
        };
        mockToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user.token';
      } else {
        setIsLoading(false);
        return false;
      }

      // Save to localStorage for persistence
      localStorage.setItem('ak4l_token', mockToken);
      localStorage.setItem('ak4l_user', JSON.stringify(userData));
      
      setToken(mockToken);
      setUser(userData);
      setIsLoading(false);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Logout function to clear all authentication data
   */
  const logout = () => {
    localStorage.removeItem('ak4l_token');
    localStorage.removeItem('ak4l_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for making authenticated API calls with bearer token
 */
export function useAuthenticatedApi() {
  const { token } = useAuth();
  
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  return { apiCall, token };
}