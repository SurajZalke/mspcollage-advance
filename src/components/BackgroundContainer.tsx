
import React, { useState, useEffect } from "react";

interface BackgroundContainerProps {
  children: React.ReactNode;
  className?: string;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children, className = "" }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Enhanced vibrant background colors
  const backgrounds = [
    "bg-gradient-to-br from-red-600 to-pink-500", // Red to pink gradient
    "bg-gradient-to-br from-green-600 to-emerald-400", // Green gradient 
    "bg-gradient-to-br from-blue-700 to-cyan-500", // Blue gradient
    "bg-gradient-to-br from-purple-800 to-indigo-900", // Deep purple gradient
  ];
  
  // Change background color every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgrounds[currentBgIndex]} dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#7efaf8] ${className}`}>
      {children}
    </div>
  );
};

export default BackgroundContainer;
