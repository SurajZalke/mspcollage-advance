
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Logo from "@/components/Logo";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";
import BackgroundContainer from "@/components/BackgroundContainer";
import { AlertCircle, Award, Clock } from "lucide-react";

const PlayerGameRoomPage: React.FC = () => {
  const { 
    activeGame, 
    currentPlayer, 
    currentQuiz, 
    currentQuestion,
    submitAnswer,
    isHost,
    refreshGameState
  } = useGame();
  const navigate = useNavigate();

  // More frequent refreshes for better real-time experience
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [refreshGameState]);

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
    <BackgroundContainer>
      <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white">
              Game Code: <span className="font-bold text-quiz-primary animate-pulse">{activeGame.code}</span>
            </span>
            <span className="text-sm text-white">
              Player: <span className="font-medium">{currentPlayer.nickname}</span>
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        {activeGame.status === "waiting" ? (
          <div className="max-w-lg mx-auto quiz-card p-8 text-center glass-dark">
            <h2 className="text-2xl font-bold text-quiz-dark mb-4">
              Waiting for host to start
            </h2>
            
            <div className="relative w-24 h-24 mx-auto mb-8 animate-pulse-scale quiz-gradient-bg rounded-full flex items-center justify-center attractive-glow">
              <span className="text-white text-3xl font-bold">
                {activeGame.players.length}
              </span>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-green-900 text-sm font-bold">+1</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The quiz will begin when the host starts the game. Get ready!
            </p>
            
            <Button variant="outline" onClick={handleLeaveGame} className="hover:bg-red-500/10 hover:text-red-500 transition-colors">
              Leave Game
            </Button>
          </div>
        ) : activeGame.status === "active" ? (
          <div className="max-w-2xl mx-auto">
            {currentQuestion ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="text-yellow-500" size={20} />
                    <span className="text-sm font-medium text-white">
                      Score: <span className="text-quiz-primary font-bold text-lg">{currentPlayer.score}</span>
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLeaveGame} className="hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    Leave Game
                  </Button>
                </div>
                
                <QuestionDisplay 
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                />
              </>
            ) : (
              <div className="quiz-card glass-dark p-6 text-center">
                <h2 className="text-xl font-bold text-quiz-dark mb-4">
                  Waiting for next question
                </h2>
                <div className="py-8">
                  <div className="w-16 h-16 mx-auto mb-6 animate-pulse quiz-gradient-bg rounded-full flex items-center justify-center attractive-glow">
                    <Clock size={24} className="text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    The host is preparing the next question
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-lg mx-auto quiz-card glass-dark p-8 text-center">
            <h2 className="text-2xl font-bold text-quiz-dark mb-4">
              Quiz Ended
            </h2>
            
            <div className="py-6 mb-6">
              <p className="text-lg mb-2">Your final score</p>
              <div className="text-4xl font-bold text-quiz-primary animate-pulse-scale">
                {currentPlayer.score}
              </div>
            </div>
            
            <Button className="quiz-btn-primary" onClick={handleLeaveGame}>
              Back to Home
            </Button>
          </div>
        )}
      </main>
    </BackgroundContainer>
  );
};

export default PlayerGameRoomPage;
