
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { use3DTilt } from "@/utils/animationUtils";
import { Sparkles, Star } from "lucide-react";

interface GameCodeDisplayProps {
  code: string;
  playerCount: number;
}

const GameCodeDisplay: React.FC<GameCodeDisplayProps> = ({ code, playerCount }) => {
  const { cardRef, handleMouseMove, resetTilt } = use3DTilt(25);

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="quiz-card text-center transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] glow-border glass-dark attractive-glow gradient-animated-bg"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div className="absolute left-4 top-4 glowing-dot animate-float" />
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Star size={36} strokeWidth={2.2} color="#b09cff" className="animate-pulse-scale drop-shadow-lg" />
          <h3 className="text-lg font-medium gradient-heading">Game Code</h3>
          <Sparkles size={28} color="#F97316" className="animate-fade-in" />
        </div>
        <div className="text-4xl font-bold tracking-wider mt-2 text-quiz-primary animate-pulse-scale select-all cursor-pointer">
          {code}
        </div>
        <div className="border-t border-gray-300 dark:border-glow-purple/30 pt-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-purple-200">Players Joined</h3>
          <div className="text-3xl font-bold mt-2 text-quiz-secondary animate-float flex justify-center items-center gap-2">
            {playerCount}
            <span className="glowing-dot" />
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <span className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 text-xs text-white shadow animate-pulse-scale">
            Share this code with friends!
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCodeDisplay;
