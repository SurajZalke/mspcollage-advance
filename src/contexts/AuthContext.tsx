
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Simulate login functionality
  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would validate against a backend API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, accept any credentials
        if (email && password) {
          const user: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: email.split('@')[0]
          };
          
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  };

  // Simulate signup functionality
  const signup = async (name: string, email: string, password: string): Promise<User> => {
    // In a real app, this would create a user in a backend API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const user: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name
          };
          
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid information"));
        }
      }, 1000);
    });
  };

  // Logout functionality
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
