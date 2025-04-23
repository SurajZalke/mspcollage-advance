
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  return (
    <Card className="quiz-card transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="mb-4">
          <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-quiz-light text-quiz-dark">
            Grade {quiz.grade} • {quiz.subject}
          </span>
        </div>
        <h3 className="text-lg font-bold text-quiz-dark mb-2">{quiz.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{quiz.questions.length} Questions</span>
          <span>Topic: {quiz.topic}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-6 pb-6">
        <div className="flex justify-between items-center w-full">
          <div>
            {quiz.hasNegativeMarking && (
              <span className="text-xs text-red-500">
                Negative marking: {quiz.negativeMarkingValue}%
              </span>
            )}
          </div>
          <Button 
            className="quiz-btn-primary"
            onClick={() => onStart(quiz.id)}
          >
            Start Quiz
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
