
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";
import { Progress } from "@/components/ui/progress";

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (questionId: string, optionId: string) => void;
  showTimer?: boolean;
  isHostView?: boolean;
  disableOptions?: boolean;
  markingType?: string;
  negativeValue?: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  onAnswer,
  showTimer = true,
  isHostView = false,
  disableOptions = false,
  markingType,
  negativeValue
}) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Timer effect
  useEffect(() => {
    if (!showTimer || isAnswered) return;
    
    if (timeLeft <= 0) {
      setIsAnswered(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, showTimer]);
  
  // Reset state when question changes
  useEffect(() => {
    setTimeLeft(question.timeLimit);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [question.id, question.timeLimit]);
  
  const handleSelectOption = (optionId: string) => {
    if (isAnswered || disableOptions) return;
    
    setSelectedOption(optionId);
    setIsAnswered(true);
    onAnswer(question.id, optionId);
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
                    : "bg-white text-quiz-dark border border-gray-200 hover:bg-quiz-light"
                }`}
                onClick={() => handleSelectOption(option.id)}
                disabled={isAnswered || disableOptions || isHostView}
              >
                <div className="mr-3 bg-gray-100 text-quiz-dark rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {option.id.toUpperCase()}
                </div>
                <span>{option.text}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {markingType && (
            <span className="text-xs font-medium mr-2">
              {markingType === "negative" ? 
                `Negative marking (-${negativeValue}%)` : 
                "Simple marking"}
            </span>
          )}
          Points: {question.points} {isAnswered && "• Question submitted"}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
