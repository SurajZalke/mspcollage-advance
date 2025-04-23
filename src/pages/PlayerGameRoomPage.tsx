
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Logo from "@/components/Logo";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";

const PlayerGameRoomPage: React.FC = () => {
  const { 
    activeGame, 
    currentPlayer, 
    currentQuiz, 
    currentQuestion,
    submitAnswer,
    isHost
  } = useGame();
  const navigate = useNavigate();

  // Redirect if not in an active game
  useEffect(() => {
    if (!activeGame || !currentPlayer || isHost) {
      navigate("/");
    }
  }, [activeGame, currentPlayer, isHost, navigate]);

  const handleAnswer = (questionId: string, optionId: string) => {
    submitAnswer(questionId, optionId);
  };

  const handleLeaveGame = () => {
    navigate("/");
    window.location.reload();
  };

  if (!activeGame || !currentPlayer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Game Code: <span className="font-bold text-quiz-primary">{activeGame.code}</span>
            </span>
            <span className="text-sm text-gray-500">
              Player: <span className="font-medium">{currentPlayer.nickname}</span>
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        {activeGame.status === "waiting" ? (
          <div className="max-w-lg mx-auto quiz-card p-8 text-center">
            <h2 className="text-2xl font-bold text-quiz-dark mb-4">
              Waiting for host to start
            </h2>
            
            <div className="w-24 h-24 mx-auto mb-8 animate-pulse-scale quiz-gradient-bg rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {activeGame.players.length}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">
              The quiz will begin when the host starts the game. Get ready!
            </p>
            
            <Button variant="outline" onClick={handleLeaveGame}>
              Leave Game
            </Button>
          </div>
        ) : activeGame.status === "active" ? (
          <div className="max-w-2xl mx-auto">
            {currentQuestion ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Score: <span className="text-quiz-primary font-bold">{currentPlayer.score}</span>
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLeaveGame}>
                    Leave Game
                  </Button>
                </div>
                
                <QuestionDisplay 
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                />
              </>
            ) : (
              <div className="quiz-card p-6 text-center">
                <h2 className="text-xl font-bold text-quiz-dark mb-4">
                  Waiting for next question
                </h2>
                <div className="py-8">
                  <div className="w-16 h-16 mx-auto mb-6 animate-pulse quiz-gradient-bg rounded-full"></div>
                  <p className="text-gray-600">
                    The host is preparing the next question
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-lg mx-auto quiz-card p-8 text-center">
            <h2 className="text-2xl font-bold text-quiz-dark mb-4">
              Quiz Ended
            </h2>
            
            <div className="py-6 mb-6">
              <p className="text-lg mb-2">Your final score</p>
              <div className="text-4xl font-bold text-quiz-primary">
                {currentPlayer.score}
              </div>
            </div>
            
            <Button className="quiz-btn-primary" onClick={handleLeaveGame}>
              Back to Home
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlayerGameRoomPage;
