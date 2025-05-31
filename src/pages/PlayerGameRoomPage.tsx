
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Logo from "@/components/Logo";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";
import BackgroundContainer from "@/components/BackgroundContainer";
import { AlertCircle, Award, Clock, Wifi, RefreshCw, CheckCircle, UserRound, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import confetti from 'canvas-confetti';
import WaitingRoom from "@/components/WaitingRoom";
import CreatorAttribution from "@/components/CreatorAttribution";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

const PlayerGameRoomPage: React.FC = () => {
  const { activeGame, currentPlayer, currentQuestion, submitAnswer, refreshGameState, joinGame } = useGame();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [pollingActive, setPollingActive] = useState(true);

  // Effect to handle initial game state loading from URL params
  useEffect(() => {
    const gameIdFromUrl = searchParams.get("gameId");
    const playerIdFromUrl = searchParams.get("playerId");

    if (gameIdFromUrl && !activeGame) {
      // If there's a gameId in the URL but no active game in context,
      // attempt to re-join or refresh the game state.
      // Pass playerIdFromUrl to refreshGameState to help identify the player.
      refreshGameState(gameIdFromUrl, playerIdFromUrl);
    }
  }, [activeGame, searchParams, refreshGameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);
  
  const resetTilt = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  }, []);
  
  // Enhanced polling with error handling
  useEffect(() => {
    if (!pollingActive) return;
    
    const interval = setInterval(() => {
      try {
        refreshGameState();
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error refreshing game state:", error);
        setConnectionStatus("connecting");
      }
    }, 200); // More frequent for better real-time feeling
    
    // Simulate occasional network hiccups for UI feedback
    const connectionCheck = setInterval(() => {
      const simulateNetworkDelay = Math.random() > 0.95;
      if (simulateNetworkDelay) {
        setConnectionStatus("connecting");
        setTimeout(() => setConnectionStatus("connected"), 800);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, [refreshGameState, pollingActive]);
  
  const [gameStartedToastShown, setGameStartedToastShown] = useState(false);

  // Handle game status transitions
  useEffect(() => {
    if (activeGame?.status === "active" && currentQuestion && !gameStartedToastShown) {
      // Game just started
      toast({
        title: "Game started!",
        description: "The quiz has begun",
      });
      setGameStartedToastShown(true);
    }
  }, [activeGame?.status, currentQuestion, toast, gameStartedToastShown]);
  
  const handleAnswerSubmit = (questionId: string, optionId: string) => {

    submitAnswer(questionId, optionId);
    
    // Confetti effect on answer submission
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    
    toast({
      title: "Answer submitted!",
      description: "Your answer has been recorded.",
    });
  };
  
  const handleLeaveGame = () => {
    navigate("/");
    toast({
      title: "Left game",
      description: "You've successfully left the game",
    });
  };
  
  const handleManualRefresh = () => {
    setConnectionStatus("connecting");
    refreshGameState();
    setTimeout(() => {
      setConnectionStatus("connected");
      toast({
        title: "Refreshed",
        description: "Game state updated",
      });
    }, 600);
  };

  const hasAnsweredCurrentQuestion = () => {
    if (!currentPlayer || !currentQuestion) return false;
    const answers = Array.isArray(currentPlayer.answers) ? currentPlayer.answers : [];
    return answers.some(a => a.questionId === currentQuestion.id);
  };
  
  const renderContent = () => {
    const gameIdFromUrl = searchParams.get("gameId");

    if (!gameIdFromUrl) {
      navigate("/join");
      return null; // Redirecting, so nothing to render here
    }

    if (!activeGame) {
      return (
        <div className="text-center space-y-4">
          <p className="dark:text-gray-300">Loading game or game not found...</p>
          <div className="flex justify-center space-x-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      );
    }

    if (activeGame.status === "waiting") {
      return (
        <WaitingRoom
          nickname={currentPlayer?.nickname || "Player"}
          players={activeGame.players}
          onStartGame={() => {}}
          cardRef={cardRef}
          handleMouseMove={handleMouseMove}
          resetTilt={resetTilt}
          gameCode={activeGame.code}
          isHost={false}
          onRefreshPlayers={handleManualRefresh}
        />
      );
    }

    if (activeGame.status === "finished") {
      return (
        <Card className="quiz-card p-6 transform hover:scale-[1.02] transition-all duration-300">
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Award size={48} className="text-amber-500" />
              </div>
              <h2 className="text-xl font-bold mt-3 dark:text-white">Game Completed!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thanks for playing, {currentPlayer?.nickname || "Player"}!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Your Results</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {currentPlayer?.score || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Score</div>
                </div>

                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentPlayer?.answers.filter(a => a.correct).length || 0} / {currentPlayer?.answers.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleLeaveGame}
                className="quiz-btn-primary"
              >
                <ArrowLeft size={16} className="mr-2" />
                Leave Game
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentQuestion) {
      const disableOptions = hasAnsweredCurrentQuestion();

      return (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium dark:text-gray-300">
              Question {activeGame.currentQuestionIndex + 1} / {currentQuestion.timeLimit}s
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className={`inline-block w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}></span>
              <span className="dark:text-gray-300">{connectionStatus === "connected" ? "Connected" : "Connecting..."}</span>
            </div>
          </div>

          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="transition-all duration-300"
          >
            <QuestionDisplay
              question={currentQuestion}
              onAnswer={handleAnswerSubmit}
              disableOptions={disableOptions}
              showTimer={true}
            />
          </div>

          {hasAnsweredCurrentQuestion() && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Waiting for other players and the host to continue...
              </p>
              <div className="flex justify-center space-x-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {currentPlayer && (
            <div className="flex items-center justify-between bg-gray-800/50 dark:bg-gray-900/50 p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 border-2 border-indigo-400">
                  <AvatarImage src={currentPlayer?.avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentPlayer?.nickname}`} />
                  <AvatarFallback>{typeof currentPlayer?.nickname === 'string' && currentPlayer.nickname.length > 0 ? currentPlayer.nickname.charAt(0).toUpperCase() : ''}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg text-white">{currentPlayer?.nickname}</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-white text-lg">Score:</p>
                <p className="font-bold text-xl text-quiz-primary">{currentPlayer?.score}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <p className="dark:text-gray-300">Waiting for host to select the next question...</p>
        <div className="flex justify-center space-x-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      );
    };
  
  return (
    <BackgroundContainer>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <Logo />
            
            {activeGame && (
              <div className="flex items-center gap-4">
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
              </div>
            )}
          </div>
        </header>
        
        <main className="container mx-auto p-4 py-8 flex-1 flex justify-center">
          <div className="w-full max-w-2xl">
            {renderContent()}
          </div>
        </main>
        <CreatorAttribution />
      </div>
    </BackgroundContainer>
  );
};

export default PlayerGameRoomPage;

