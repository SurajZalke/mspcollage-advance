
import React, { useEffect, useState } from "react";
import HomePage from "./HomePage";

const Index = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Define background colors
  const backgrounds = [
    "bg-red-600", // Red
    "bg-green-600", // Green
    "bg-blue-600", // Blue
    "bg-black", // Black
  ];
  
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
  
  // Change background color every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgrounds[currentBgIndex]} dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#7efaf8]`}>
      <HomePage />
    </div>
  );
};

export default Index;
