import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/contexts/GameContext";
import { Howl } from 'howler';
import { toast } from 'sonner';
import { calculateCorrectAnswerRate, generateAIExplanation } from "@/services/aiExplanationService";

interface QuestionDisplayProps {
  question: Question;
  onAnswer?: (questionId: string, optionId: string) => void;
  showTimer?: boolean;
  isHostView?: boolean;
  disableOptions?: boolean;
  markingType?: string;
  negativeValue?: number;
  onHostSelect?: (optionId: string) => void;
  showCorrectAnswer: boolean;
  isWarningSoundEnabled?: boolean;
  warningSoundVolume?: number;
  selectedAnswer?: string;
  timeLeft?: number; // Add timeLeft prop
  showAIExplanation?: boolean; // Add showAIExplanation prop
}

const warningSound = new Howl({
  src: ['/sounds/warning.mp3'],
  volume: 0.8,
});

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question, 
  onAnswer,
  showTimer = true,
  isHostView = false,
  disableOptions = false,
  markingType,
  negativeValue,
  onHostSelect,
  showCorrectAnswer,
  selectedAnswer, // Add selectedAnswer to props
  timeLeft // Add timeLeft to props
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedAnswer || null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { activeGame, currentPlayer } = useGame();
  const [warningSoundPlayed, setWarningSoundPlayed] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

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

  // Effect to play sound when 10 seconds remain
  useEffect(() => {
    if (timeLeft === 10 && !warningSoundPlayed) {
      warningSound.play();
      setWarningSoundPlayed(true);
    }
    if (timeLeft && (timeLeft > 10 || timeLeft === question.timeLimit)) {
      setWarningSoundPlayed(false);
    }
  }, [timeLeft, question.id, question.timeLimit, warningSoundPlayed]);
  
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setWarningSoundPlayed(false);
    setShowExplanation(false); // Reset explanation state when question changes
    setAiExplanation(""); // Clear any previous explanation
  }, [question.id, question.timeLimit, selectedAnswer]);

  useEffect(() => {
    if (showCorrectAnswer) {
      setIsAnswered(true);
      
      // Check if we need to show AI explanation (when player's correct answer rate is below 60%)
      if (currentPlayer?.answers && selectedOption) {
        const correctAnswerRate = calculateCorrectAnswerRate(currentPlayer.answers);
        
        if ((isHostView || correctAnswerRate < 80) && !aiExplanation) {
          // Generate AI explanation only if it hasn't been generated yet
          generateAIExplanation(question, selectedOption)
            .then(explanation => {
              setAiExplanation(explanation);
              setShowExplanation(true);
            })
            .catch(error => {
              console.error("Error generating AI explanation:", error);
            });
        }
      }
    }
  }, [showCorrectAnswer, currentPlayer, question, selectedOption, isHostView]);
  
  const handleSelectOption = (optionId: string) => {
    if (isAnswered || disableOptions) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
    setHasAnswered(true);
    if (isHostView && onHostSelect) {
      onHostSelect(optionId);
    } else if (onAnswer) {
      onAnswer(question.id, optionId);
    }
  };
  
  const getProgressColor = () => {
    if (!timeLeft || !question.timeLimit) return "bg-gray-300"; // Handle cases where timeLeft or timeLimit might be undefined
    const percentLeft = (timeLeft / question.timeLimit) * 100;
    if (percentLeft > 66) return "bg-green-500";
    if (percentLeft > 33) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // --- DEBUG: Log option image URLs to verify data ---
  useEffect(() => {
    if (question?.options) {
      question.options.forEach((option, idx) => {
        // eslint-disable-next-line no-console
        console.log(`Option ${String.fromCharCode(65 + idx)} imageUrl:`, option.imageUrl);
      });
    }
  }, [question]);

  return (
    <Card className={`quiz-card ${isHostView ? "host-view" : ""}`}>
      <CardContent className="pt-6 space-y-6">
        {showTimer && timeLeft !== undefined && question.timeLimit !== undefined && (
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
          <h3 className="text-2xl font-bold text-center whitespace-pre-line">{question.text}</h3>
          
          {question.imageUrl && (
            <div className="flex justify-center my-4">
              <div className="max-w-3xl w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 p-2">
                <img 
                  src={question.imageUrl.includes('cloudinary.com') ? 
                    question.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_600,c_limit/') : 
                    question.imageUrl} 
                  alt="Question" 
                  className="max-h-96 w-auto mx-auto object-contain rounded-md"
                  loading="lazy"
                  crossOrigin="anonymous"
                  style={{ display: 'block' }}
                  referrerPolicy="no-referrer"
                  onError={e => {
                    const imgElement = e.currentTarget as HTMLImageElement;
                    const originalSrc = question.imageUrl;
                    let newSrc = originalSrc;
                    if (originalSrc && originalSrc.includes('cloudinary.com') && !originalSrc.includes('/upload/f_auto')) {
                      newSrc = originalSrc.replace('/upload/', '/upload/f_auto,q_auto,w_600,c_limit/');
                    }
                    if (originalSrc && !originalSrc.includes('?v=')) {
                      newSrc = `${newSrc}?v=${new Date().getTime()}`;
                      imgElement.src = newSrc;
                    }
                  }}
                />
                {/* Answer Polling section */}
                {isHostView && activeGame && question && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Answer Polling</h4>
                    {question.options.map((option, idx) => {
                      const optionLabel = String.fromCharCode(65 + idx);
                      const count = pollCounts[option.id] || 0;
                      const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
                      return (
                        <div key={option.id} className="flex items-center mb-2">
                          <span className="w-8 font-medium">{optionLabel}:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-4 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage.toFixed(0)}%
                            </div>
                          </div>
                          <span className="ml-2 text-sm">({count})</span>
                        </div>
                      );
                    })}
                    <p className="text-sm text-gray-500 mt-2">Total answers: {totalAnswers}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              const selected = selectedOption === option.id;
              const disabled = isAnswered || disableOptions;
              const isCorrect = showCorrectAnswer && option.id === question.correctOption;

              // --- FIX: Always render an image if imageUrl is present, fallback to placeholder if not ---
              let imgSrc = "";
              if (typeof option.imageUrl === "string" && option.imageUrl.trim() !== "") {
                imgSrc = option.imageUrl.includes('cloudinary.com')
                  ? option.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_300,c_limit/')
                  : option.imageUrl;
              }

              // Determine if the option should be disabled
              const shouldDisable = disableOptions || (showCorrectAnswer && !isCorrect && selectedOption === option.id);

              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-3 cursor-pointer transition-all
                    ${isCorrect
                      ? "bg-green-600/80 border-2 border-green-500 text-white"
                      : selected
                        ? "bg-purple-400/30 border border-purple-400"
                        : "bg-gray-800/60"}
                    ${disabled ? "opacity-60 pointer-events-none" : ""}
                  `}
                  style={{ minHeight: "48px" }}
                  onClick={() => !disabled && handleSelectOption(option.id)}
                >
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold mr-2
                    ${isCorrect ? "bg-green-500 text-white" : "bg-gray-700 text-white"}
                  `}>
                    {optionLabel}
                  </span>
                  <div className="flex-1 text-left break-words">
                    <span className="whitespace-pre-line text-xl font-medium">
                      {option.text}
                    </span>
                    {imgSrc && (
                      <div className="mt-2 overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900 p-1">
                        <img 
                          src={imgSrc}
                          alt={`Option ${optionLabel}`} 
                          className="max-h-32 w-auto mx-auto object-contain rounded-md"
                          loading="lazy"
                          crossOrigin="anonymous"
                          style={{ display: 'block' }}
                          referrerPolicy="no-referrer"
                          onError={e => {
                            const imgElement = e.currentTarget as HTMLImageElement;
                            let newSrc = option.imageUrl;
                            if (newSrc && newSrc.includes('cloudinary.com') && !newSrc.includes('/upload/f_auto')) {
                              newSrc = newSrc.replace('/upload/', '/upload/f_auto,q_auto,w_300,c_limit/');
                            }
                            if (newSrc && !newSrc.includes('?v=')) {
                              newSrc = `${newSrc}?v=${new Date().getTime()}`;
                              imgElement.src = newSrc;
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {isCorrect && (
                    <span className="ml-2 text-green-200 text-xl font-bold">&#10003;</span>
                  )}
                </div>
              );
            })}
          </div>
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
              
              {/* AI Explanation Section */}
              {showExplanation && showExplanation && aiExplanation && (

                <div className="mt-4" dangerouslySetInnerHTML={{ __html: aiExplanation }} />
              )}
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
              <div>Correct Answer: <span className="whitespace-pre-line">{question.options.find(opt => opt.id === question.correctOption)?.text}</span></div>
              {(() => {
                const correctOption = question.options.find(opt => opt.id === question.correctOption);
                return correctOption && typeof correctOption.imageUrl === "string" && correctOption.imageUrl.trim() !== "" ? (
                  <div className="mt-2 flex justify-center">
                    <div className="overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900 p-1 max-w-xs">
                      <img 
                        src={correctOption.imageUrl.includes('cloudinary.com') ? 
                          correctOption.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_300,c_limit/') : 
                          correctOption.imageUrl} 
                        alt="Correct Answer" 
                        className="max-h-32 w-auto mx-auto object-contain rounded-md"
                        loading="lazy"
                        crossOrigin="anonymous"
                        style={{ display: 'block' }}
                        referrerPolicy="no-referrer"
                        onError={e => {
                          const imgElement = e.currentTarget as HTMLImageElement;
                          let newSrc = correctOption.imageUrl;
                          if (newSrc && newSrc.includes('cloudinary.com') && !newSrc.includes('/upload/f_auto')) {
                            newSrc = newSrc.replace('/upload/', '/upload/f_auto,q_auto,w_300,c_limit/');
                          }
                          if (newSrc && !newSrc.includes('?v=')) {
                            newSrc = `${newSrc}?v=${new Date().getTime()}`;
                            imgElement.src = newSrc;
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
          Marks: {question.Marks} {isAnswered && "• Question submitted"}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
