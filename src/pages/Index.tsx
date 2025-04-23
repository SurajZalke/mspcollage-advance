
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
    
    // Initial setup
    applyTheme(mediaQuery.matches);
    
    // Listen for changes
    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return (
    <div className="min-h-screen gradient-animated-bg dark:bg-none dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#7efaf8]">
      <HomePage />
    </div>
  );
};

export default Index;
