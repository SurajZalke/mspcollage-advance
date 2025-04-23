
import React, { useEffect } from "react";
import HomePage from "./HomePage";

const Index = () => {
  // Monitor system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Apply theme based on system preference
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    
    // Initial setup - force dark mode for better color experience
    document.documentElement.classList.add("dark");
    
    // Listen for changes
    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return <HomePage />;
};

export default Index;
