
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Logo from "@/components/Logo";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";
import BackgroundContainer from "@/components/BackgroundContainer";
import { AlertCircle, Award, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [hasAnswered, setHasAnswered] = useState(false);

  // More frequent refreshes for better real-time experience
  useEffect(() => {
    setConnectionStatus("connecting");
    const fetchInterval = setInterval(() => {
      refreshGameState();
      setLastUpdateTime(Date.now());
      setConnectionStatus("connected");
    }, 500); // Poll every 500ms for more real-time feeling
    
    // Simulate network status check
    const connectionCheck = setInterval(() => {
      // Random occasional "network hiccup" for visual feedback
      const simulateNetworkDelay = Math.random() > 0.9;
      if (simulateNetworkDelay) {
        setConnectionStatus("connecting");
        setTimeout(() => setConnectionStatus("connected"), 800);
      }
    }, 5000);
    
    return () => {
      clearInterval(fetchInterval);
      clearInterval(connectionCheck);
    };
  }, [refreshGameState]);

  // Redirect if not in an active game
  useEffect(() => {
    if (!activeGame || !currentPlayer || isHost) {
      navigate("/");
    }
  }, [activeGame, currentPlayer, isHost, navigate]);

  // Check if player has answered current question
  useEffect(() => {
    if (currentPlayer && currentQuestion) {
      const answered = currentPlayer.answers.some(a => a.questionId === currentQuestion.id);
      setHasAnswered(answered);
    } else {
      setHasAnswered(false);
    }
  }, [currentPlayer, currentQuestion]);

  const handleAnswer = (questionId: string, optionId: string) => {
    submitAnswer(questionId, optionId);
    setHasAnswered(true);
    
    toast({
      title: "Answer submitted!",
      description: "Wait for next question",
    });
  };

  const handleManualRefresh = () => {
    setConnectionStatus("connecting");
    refreshGameState();
    setTimeout(() => {
      setConnectionStatus("connected");
      setLastUpdateTime(Date.now());
      toast({
        title: "Refreshed",
        description: "Game state updated",
      });
    }, 600);
  };

  const handleLeaveGame = () => {
    toast({
      title: "Leaving game",
      description: "You've left the game session",
    });
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
            <div 
              className="flex items-center gap-1 cursor-pointer bg-black/20 px-2 py-1 rounded-md hover:bg-black/30 transition-colors" 
              onClick={handleManualRefresh}
            >
              {connectionStatus === "connected" ? (
                <Wifi size={16} className="text-green-400" />
              ) : (
                <RefreshCw size={16} className="text-amber-400 animate-spin" />
              )}
              <span className="text-xs text-white">
                {connectionStatus === "connected" ? "Live" : "Updating..."}
              </span>
            </div>
            <span className="text-sm text-white px-2 py-1 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-md">
              Game: <span className="font-bold text-quiz-primary animate-pulse">{activeGame.code}</span>
            </span>
            <span className="text-sm text-white px-2 py-1 bg-gray-800/30 rounded-md">
              <span className="font-medium">{currentPlayer.nickname}</span>
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        {activeGame.status === "waiting" ? (
          <div className="max-w-lg mx-auto quiz-card p-8 text-center glass-dark">
            <h2 className="text-2xl font-bold text-quiz-dark dark:text-white mb-4">
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
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 dark:bg-black/20 px-3 py-1.5 rounded-full">
                  <Award className="text-yellow-500" size={18} />
                  <span className="text-sm font-medium text-white">
                    Score: <span className="text-quiz-primary font-bold text-lg">{currentPlayer.score}</span>
                  </span>
                </div>
                
                {hasAnswered && currentQuestion && (
                  <div className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle size={16} />
                    <span>Answer submitted</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLeaveGame} className="hover:bg-red-500/10 hover:text-red-500 transition-colors">
                Leave Game
              </Button>
            </div>
            
            {currentQuestion ? (
              <QuestionDisplay 
                question={currentQuestion}
                onAnswer={handleAnswer}
                disableOptions={hasAnswered}
              />
            ) : (
              <div className="quiz-card glass-dark p-6 text-center">
                <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">
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
            <h2 className="text-2xl font-bold text-quiz-dark dark:text-white mb-4">
              Quiz Ended
            </h2>
            
            <div className="py-6 mb-6">
              <p className="text-lg mb-2 dark:text-gray-200">Your final score</p>
              <div className="text-5xl font-bold text-quiz-primary animate-pulse-scale">
                {currentPlayer.score}
              </div>
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Thanks for playing! Join another game with a new code.
                </p>
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
