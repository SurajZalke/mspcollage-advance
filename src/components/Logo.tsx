
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className="flex flex-col">
      <div className="text-sm font-bold text-white mb-1">MSP COLLAGE</div>
      <div className="flex items-center gap-2">
        <img src="/msplogo.jpg" alt="MSP Collage Logo" className="h-12 w-12 object-contain" />
      </div>
    </div>
  );
};

export default Logo;
