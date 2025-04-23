
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GameCodeDisplayProps {
  code: string;
  playerCount: number;
}

const GameCodeDisplay: React.FC<GameCodeDisplayProps> = ({ code, playerCount }) => {
  return (
    <Card className="quiz-card text-center">
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-700">Game Code</h3>
          <div className="text-4xl font-bold tracking-wider mt-2 text-quiz-primary">
            {code}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
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
