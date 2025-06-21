import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/contexts/GameContext";

interface QuestionDisplayProps {
  question: Question;
  onAnswer?: (questionId: string, optionId: string) => void; // Made optional
  showTimer?: boolean;
  isHostView?: boolean;
  disableOptions?: boolean;
  markingType?: string;
  negativeValue?: number;
  onHostSelect?: (optionId: string) => void;
  showCorrectAnswer?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question, 
  onAnswer,
  showTimer = true,
  isHostView = false,
  disableOptions = false,
  markingType,
  negativeValue,
  onHostSelect,
  showCorrectAnswer
}) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const { questionStartTime, serverTimeOffset } = useGame(); // Get questionStartTime and serverTimeOffset from GameContext
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { activeGame, currentPlayer } = useGame();

  // Polling logic: count answers for each option for this question
  let pollCounts: Record<string, number> = {};
  let totalAnswers = 0;
  if (activeGame && question) {
    question.options.forEach(opt => { pollCounts[opt.id] = 0; });
    activeGame.players.forEach(player => {
      const ans = player.answers?.find(a => a.questionId === question.id);
      if (ans) {
        pollCounts[ans.selectedOption] = (pollCounts[ans.selectedOption] || 0) + 1;
        totalAnswers++;
      }
    });
  }

  // Timer effect
  useEffect(() => {
    if (!showTimer || isAnswered || disableOptions || !questionStartTime) return;

    // Always calculate remaining time from server-synced questionStartTime with serverTimeOffset
    const calculateTimeLeft = () => {
      const now = Date.now() + serverTimeOffset;
      const elapsed = Math.floor((now - questionStartTime) / 1000);
      return Math.max(0, question.timeLimit - elapsed);
    };

    setTimeLeft(calculateTimeLeft());

    if (calculateTimeLeft() <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, isAnswered, disableOptions, questionStartTime, question.timeLimit, serverTimeOffset]);
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    // Do not reset timeLeft here; let timer effect handle it from questionStartTime
  }, [question.id, question.timeLimit, questionStartTime]);

  // Synchronize isAnswered with showCorrectAnswer from GameContext
  useEffect(() => {
    if (showCorrectAnswer) {
      setIsAnswered(true);
    }
  }, [showCorrectAnswer]);
  
  const handleSelectOption = (optionId: string) => {
    if (isAnswered || disableOptions) return;
    
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    if (isHostView && onHostSelect) {
      onHostSelect(optionId);
    } else if (onAnswer) {
      onAnswer(question.id, optionId);
    }
  };
  
  const getProgressColor = () => {
    const percentLeft = (timeLeft / question.timeLimit) * 100;
    if (percentLeft > 66) return "bg-green-500";
    if (percentLeft > 33) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className={`quiz-card ${isHostView ? "host-view" : ""}`}>
      <CardContent className="pt-6 space-y-6">
        {showTimer && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Time remaining</span>
              <span className="font-medium">{timeLeft}s</span>
            </div>
            <Progress 
              value={(timeLeft / question.timeLimit) * 100} 
              className={`h-2 ${getProgressColor()}`}
            />
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">{question.text}</h3>
          
          {question.imageUrl && (
            <div className="flex justify-center">
              <img 
                src={question.imageUrl} 
                alt="Question" 
                className="max-h-48 object-contain rounded-md"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map(option => (
              <Button
                key={option.id}
                className={`p-4 h-auto text-left flex justify-start items-center transition-all ${
                  selectedOption === option.id
                    ? "bg-quiz-primary text-white"
                    : showCorrectAnswer && option.id === question.correctOption
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-white border border-gray-600 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectOption(option.id)}
                disabled={isAnswered || disableOptions || (isHostView && !onHostSelect)}
              >
                <div className={`mr-3 ${showCorrectAnswer && option.id === question.correctOption ? 'bg-green-200' : 'bg-gray-100'} text-quiz-dark rounded-full w-6 h-6 flex items-center justify-center font-medium`}>
                  {option.id.toUpperCase()}
                </div>
                <span>{option.text}</span>
              </Button>
            ))}
          </div>
          {/* Polling bar: only show after time ends or host submits answer */}
          {showCorrectAnswer && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-white mb-2">Answer Polling</h4>
              <div className="space-y-2">
                {question.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-8 font-bold text-white">{opt.id.toUpperCase()}</span>
                    <Progress value={totalAnswers ? (pollCounts[opt.id] / totalAnswers) * 100 : 0} className="flex-1 h-3 bg-gray-700" />
                    <span className="w-8 text-right text-white">{pollCounts[opt.id]}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-300 mt-1">Total answers: {totalAnswers}</div>
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {markingType && (
            <span className="text-xs font-medium mr-2">
              {markingType === "negative" ? 
                `Negative marking (-${negativeValue}%)` : 
                "Simple marking"}
            </span>
          )}
          {showCorrectAnswer && (
            <div className="mt-4 text-lg font-semibold">
              Correct Answer: {question.options.find(opt => opt.id === question.correctOption)?.text}
            </div>
          )}
          Marks: {question.Marks} {isAnswered && "• Question submitted"}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
