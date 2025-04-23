
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
        <div className="quiz-gradient-bg rounded-lg p-2">
          <span className={`font-bold text-white ${sizeClasses[size]}`}>Q</span>
        </div>
        <div className="font-bold">
          <span className="text-quiz-primary">Quiz</span>
          <span className="text-quiz-dark">Game</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
