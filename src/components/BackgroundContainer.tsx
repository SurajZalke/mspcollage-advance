
import React, { useState, useEffect } from "react";

interface BackgroundContainerProps {
  children: React.ReactNode;
  className?: string;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children, className = "" }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // More vibrant and bold background colors
  const backgrounds = [
    "bg-gradient-to-br from-red-700 via-red-500 to-orange-400", // Red to orange
    "bg-gradient-to-br from-emerald-700 via-green-500 to-lime-300", // Green gradient 
    "bg-gradient-to-br from-indigo-900 via-blue-600 to-cyan-400", // Blue gradient
    "bg-gradient-to-br from-black via-gray-800 to-gray-700", // Black gradient
  ];
  
  // Change background color every 8 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
    }, 8000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgrounds[currentBgIndex]} dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#7efaf8] ${className}`}>
      {children}
    </div>
  );
};

export default BackgroundContainer;
