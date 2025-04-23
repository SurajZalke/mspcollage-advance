
import React, { useEffect } from "react";
import HomePage from "./HomePage";
import BackgroundContainer from "@/components/BackgroundContainer";

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
    
    // Initial setup
    applyTheme(mediaQuery.matches);
    
    // Listen for changes
    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return (
    <BackgroundContainer>
      <HomePage />
    </BackgroundContainer>
  );
};

export default Index;
