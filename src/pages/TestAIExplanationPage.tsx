import React, { useState, useEffect } from 'react';
import { Question, PlayerAnswer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { calculateCorrectAnswerRate, generateAIExplanation } from '@/services/aiExplanationService';

const TestAIExplanationPage: React.FC = () => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Sample question for testing
  const sampleQuestion: Question = {
    id: 'q1',
    text: 'What is the formula for calculating the area of a circle?',
    options: [
      {
        id: 'a', text: 'A = πr²',
        correct: undefined
      },
      {
        id: 'b', text: 'A = 2πr',
        correct: undefined
      },
      {
        id: 'c', text: 'A = πd',
        correct: undefined
      },
      {
        id: 'd', text: 'A = r²',
        correct: undefined
      },
    ],
    correctOption: 'a',
    timeLimit: 30,
    Marks: 10,
    imageUrl: '',
    questionText: undefined,
    correctAnswer: '',
    playerAnswerId: undefined
  };

  // Sample player answers with low correct rate
  const sampleAnswers: PlayerAnswer[] = [
    { questionId: 'q1', selectedOption: 'b', correct: false, timeToAnswer: 10 },
    { questionId: 'q2', selectedOption: 'c', correct: false, timeToAnswer: 15 },
    { questionId: 'q3', selectedOption: 'a', correct: true, timeToAnswer: 8 },
    { questionId: 'q4', selectedOption: 'd', correct: false, timeToAnswer: 20 },
    { questionId: 'q5', selectedOption: 'b', correct: false, timeToAnswer: 12 },
  ];

  const handleAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswer(optionId);
    // Wait a moment before showing the correct answer
    setTimeout(() => {
      setShowCorrectAnswer(true);
    }, 1000);
  };

  const resetTest = () => {
    setShowCorrectAnswer(false);
    setSelectedAnswer(null);
  };

  // Calculate the correct answer rate
  const correctRate = calculateCorrectAnswerRate(sampleAnswers);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Test AI Explanation Feature</h1>
      
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Player Stats</h2>
        <p>Correct Answer Rate: <span className="font-bold">{correctRate.toFixed(1)}%</span></p>
        <p className="text-sm text-gray-500 mt-1">Since this is below 60%, the AI explanation will appear after answering</p>
      </div>
      
      <div className="mb-6">
        <QuestionDisplay 
          question={sampleQuestion}
          onAnswer={handleAnswer}
          showCorrectAnswer={showCorrectAnswer}
          selectedAnswer={selectedAnswer || undefined}
          timeLeft={15}
        />
      </div>
      
      <div className="flex justify-center">
        <Button onClick={resetTest} className="mt-4">
          Reset Test
        </Button>
      </div>
    </div>
  );
};

export default TestAIExplanationPage;