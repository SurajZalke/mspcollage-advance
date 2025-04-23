
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock user database (in a real app, this would be in your backend)
const mockUserDB: { [email: string]: { name: string; password: string; id: string } } = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    // Load mock users from localStorage
    const storedMockUsers = localStorage.getItem("mockUserDB");
    if (storedMockUsers) {
      Object.assign(mockUserDB, JSON.parse(storedMockUsers));
    }
    
    setLoading(false);
  }, []);

  const isLoggedIn = () => {
    return currentUser !== null;
  };

  // Login functionality with actual validation
  const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user exists and password matches
        const lowerEmail = email.toLowerCase();
        const user = mockUserDB[lowerEmail];
        
        if (user && user.password === password) {
          const loggedInUser: User = {
            id: user.id,
            email: lowerEmail,
            name: user.name
          };
          
          setCurrentUser(loggedInUser);
          localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
          resolve(loggedInUser);
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user.name}!`,
            variant: "default"
          });
        } else {
          reject(new Error("Invalid email or password"));
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
          });
        }
      }, 800);
    });
  };

  // Signup functionality that stores user data
  const signup = async (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const lowerEmail = email.toLowerCase();
          
          // Check if user already exists
          if (mockUserDB[lowerEmail]) {
            reject(new Error("An account with this email already exists"));
            toast({
              title: "Signup failed",
              description: "An account with this email already exists",
              variant: "destructive"
            });
            return;
          }
          
          const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
          
          // Create new user
          mockUserDB[lowerEmail] = {
            name,
            password,
            id: userId
          };
          
          // Save updated mock user database to localStorage
          localStorage.setItem("mockUserDB", JSON.stringify(mockUserDB));
          
          const user: User = {
            id: userId,
            email: lowerEmail,
            name
          };
          
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
          
          toast({
            title: "Account created",
            description: "Your account has been created successfully!",
            variant: "default"
          });
          
          resolve(user);
        } else {
          reject(new Error("All fields are required"));
          toast({
            title: "Signup failed",
            description: "All fields are required",
            variant: "destructive"
          });
        }
      }, 800);
    });
  };

  // Logout functionality
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "default"
    });
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    isLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
