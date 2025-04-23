
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { use3DTilt } from "@/utils/animationUtils";

interface GameCodeDisplayProps {
  code: string;
  playerCount: number;
}

const GameCodeDisplay: React.FC<GameCodeDisplayProps> = ({ code, playerCount }) => {
  const { cardRef, handleMouseMove, resetTilt } = use3DTilt(25); // Increase tilt effect
  
  return (
    <Card 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={resetTilt}
      className="quiz-card text-center transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]"
    >
      <CardContent className="pt-6 space-y-4">
        <div className="transform transition-all duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-700">Game Code</h3>
          <div className="text-4xl font-bold tracking-wider mt-2 text-quiz-primary animate-pulse-scale">
            {code}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 transform transition-all duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-700">Players Joined</h3>
          <div className="text-3xl font-bold mt-2 text-quiz-secondary">
            {playerCount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCodeDisplay;
