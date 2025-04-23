
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import HostLoginForm from "@/components/HostLoginForm";

const HostLoginPage: React.FC = () => {
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
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 ${backgrounds[currentBgIndex]} dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#7efaf8]`}>
      <header className="container mx-auto p-4">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md transform hover:scale-[1.01] transition-all duration-500">
          <HostLoginForm />
        </div>
      </div>
      <footer className="container mx-auto p-4 text-center text-white text-sm">
        <p>&copy; {new Date().getFullYear()} Science Stream Quiz Arena</p>
      </footer>
    </div>
  );
};

export default HostLoginPage;
