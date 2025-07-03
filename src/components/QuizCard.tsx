import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types";
import { Trash2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  onDelete?: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (quizId: string) => {
    navigate("/create-quiz", { state: { quizId } });
  };

  return (
    <Card className="quiz-card transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6 relative">
        <div className="mb-4">
          <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-purple-200 text-purple-800">
            Grade {quiz.grade} • {quiz.subject}
          </span>
        </div>
        <h3 className="text-lg font-bold text-quiz-dark mb-2">{quiz.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{quiz.questions.length} Questions</span>
          <span>Topic: {quiz.topic}</span>
        </div>
        <Button
          variant="outline"
          className="absolute top-2 right-2 flex items-center gap-2"
          onClick={() => handleEdit(quiz.id)}
        >
          Edit
        </Button>
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
          <div className="flex gap-2">
            {onDelete && (
              <Button
                variant="destructive"
                className="dark:bg-red-600 dark:hover:bg-red-700 flex items-center gap-2"
                onClick={() => onDelete(quiz.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              className="quiz-btn-primary flex items-center gap-2"
              onClick={() => onStart(quiz.id)}
            >
              <Play className="h-4 w-4" />
              Start Quiz
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
