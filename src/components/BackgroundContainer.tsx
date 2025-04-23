
import React, { useState, useEffect } from "react";

interface BackgroundContainerProps {
  children: React.ReactNode;
  className?: string;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children, className = "" }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Define background colors
  const backgrounds = [
    "bg-red-600", // Red
    "bg-green-600", // Green 
    "bg-blue-600", // Blue
    "bg-black", // Black
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
