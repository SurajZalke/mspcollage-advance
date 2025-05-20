
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const JoinGameForm = () => {
  const [gameCode, setGameCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { joinGame, validateGameCode } = useGame();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const demoCodes = ["TEST12", "DEMO01", "PLAY22", "QUIZ99", "FUN123"];
  const randomDemoCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];

  // Enhanced validation with debounce
  useEffect(() => {
    if (gameCode.length > 0) {
      setIsValidCode(null);
      setErrorMessage(null);
    }
    
    if (gameCode.length === 6) {
      setIsValidating(true);
      
      const timeoutId = setTimeout(async () => {
        const validationResult = await validateGameCode(gameCode);
        setIsValidCode(validationResult.valid);
        if (!validationResult.valid) {
          setErrorMessage(validationResult.message || "Invalid game code");
        } else {
          setErrorMessage(null);
          // Auto focus to nickname field when code is valid
          const nicknameInput = document.getElementById('nickname-input');
          if (nicknameInput) {
            nicknameInput.focus();
          }
        }
        setIsValidating(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else if (gameCode.length > 0) {
      setIsValidCode(false);
    } else {
      setIsValidCode(null);
    }
  }, [gameCode, validateGameCode]);

  // Add animation effect when form loads
  useEffect(() => {
    if (formRef.current) {
      formRef.current.classList.add('animate-fade-in');
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMessage(null);

    if (!gameCode) {
      setErrorMessage("Please enter a game code");
      setIsJoining(false);
      return;
    }

    if (!nickname) {
      setErrorMessage("Please enter a nickname");
      setIsJoining(false);
      return;
    }

    try {      
      const result = await joinGame(gameCode.toUpperCase(), nickname.trim());
      
      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: "Successfully joined!",
          description: `Welcome to the game, ${nickname}!`,
        });
      } else {
        throw new Error(result.message || "Failed to join game");
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        variant: "destructive",
        title: "Error joining game",
        description: error.message,
      });
      setIsJoining(false);
    }
  };

  const handleDemoCode = () => {
    setGameCode(randomDemoCode);
    toast({
      title: "Demo code applied!",
      description: `Using code: ${randomDemoCode}`,
      variant: "default"
    });
  };

  return (
    <div ref={formRef} className="transition-all duration-500 ease-in-out">
      <Card className="quiz-card shadow-lg w-full max-w-md mx-auto transition-all duration-300 hover:shadow-xl glass-dark border-2 border-indigo-300/30">
        <CardContent className="pt-6">
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-quiz-dark dark:text-white">Join a Quiz Game</h2>
              <p className="text-gray-500 dark:text-gray-300 text-sm">Enter the game code and your nickname to join</p>
              <button 
                type="button" 
                onClick={handleDemoCode}
                className="text-amber-500 text-sm animate-pulse hover:text-amber-600 focus:outline-none underline flex items-center gap-1"
              >
                <Clock size={14} />
                <span>Try demo code: {randomDemoCode}</span>
              </button>
            </div>
            
            {errorMessage && (
              <div className="bg-destructive/15 border border-destructive/30 text-destructive dark:text-red-300 rounded-md px-3 py-2 flex items-center gap-2 animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  id="game-code-input"
                  placeholder="GAME CODE"
                  className={`quiz-input text-center text-2xl font-bold tracking-widest uppercase ${
                    isValidCode === true ? 'border-green-500 focus:ring-green-500' : 
                    isValidCode === false ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={gameCode}
                  onChange={(e) => {
                    // Allow only alphanumeric characters and limit to 6 chars
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 6);
                    setGameCode(value.toUpperCase());
                  }}
                  maxLength={6}
                  autoFocus
                />
                {isValidating ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500">
                    <RefreshCw size={20} className="animate-spin" />
                  </div>
                ) : isValidCode === true ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <CheckCircle size={20} />
                  </div>
                ) : null}
              </div>
              
              <div className="transform transition-all duration-300 hover:scale-105">
                <Input
                  id="nickname-input"
                  type="text"
                  placeholder="Your nickname"
                  className="quiz-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="quiz-btn-primary w-full transform transition-all duration-300 hover:scale-105 animate-pulse-scale flex items-center gap-2"
              disabled={isJoining || isValidating}
            >
              {isJoining ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Join Game
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const PlayerGameRoomPage: React.FC = () => {
  const { activeGame, currentPlayer, currentQuestion, submitAnswer, refreshGameState } = useGame();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [pollingActive, setPollingActive] = useState(true);
  
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
  
  // Handle game status transitions
  useEffect(() => {
    if (activeGame?.status === "active" && currentQuestion) {
      // Game just started
      toast({
        title: "Game started!",
        description: "The quiz has begun",
      });
    }
  }, [activeGame?.status, currentQuestion, toast]);
  
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
    return currentPlayer.answers.some(a => a.questionId === currentQuestion.id);
  };
  
  const renderContent = () => {
    if (!activeGame) {
      return <JoinGameForm />;
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
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-indigo-500" />
                <span className="font-medium dark:text-white">{currentPlayer.nickname}</span>
              </div>
              
              <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Score: {currentPlayer.score}</span>
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
