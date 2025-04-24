
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface GameControlsProps {
  onStartGame: () => void;
  onEndGame: () => void;
  onNextQuestion: () => void;
  showStart?: boolean;
  showNext?: boolean;
  disabled?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onStartGame,
  onEndGame,
  onNextQuestion,
  showStart = false,
  showNext = false,
  disabled = false
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {showStart && (
        <Button 
          className="quiz-btn-primary"
          onClick={onStartGame}
          disabled={disabled}
        >
          <Clock className="h-4 w-4 mr-2" />
          Start Quiz
        </Button>
      )}
      
      {showNext && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onEndGame}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
          >
            End Quiz
          </Button>
          <Button 
            className="quiz-btn-primary animate-pulse-scale"
            onClick={onNextQuestion}
          >
            Next Question
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameControls;
