
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
import LeaderboardDisplay from "@/components/LeaderboardDisplay";

const PlayerGameRoomPage: React.FC = () => {
  const { activeGame, currentPlayer, currentQuestion, submitAnswer, refreshGameState, joinGame } = useGame();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();
  const [showLeaderboardAnimation, setShowLeaderboardAnimation] = useState(false);

  useEffect(() => {
    if (activeGame?.status === 'finished') {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Set a timeout to clear confetti after some time
      setTimeout(() => {
        confetti.clear();
      }, 5000);

      // Set showLeaderboardAnimation to true to display the leaderboard
      setShowLeaderboardAnimation(true);
    }
  }, [activeGame?.status, activeGame]);

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
      console.log("PlayerGameRoomPage: activeGame is null. Displaying loading state.");
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

    console.log("PlayerGameRoomPage: Current activeGame status:", activeGame.status);
    console.log("PlayerGameRoomPage: activeGame.players:", activeGame.players);
    console.log("PlayerGameRoomPage: activeGame.quiz:", activeGame.quiz);

    if (activeGame.status === "finished") {
      console.log("PlayerGameRoomPage: Game status is 'finished'. Attempting to render leaderboard.");
      return (
        <div className={`space-y-6 transition-opacity duration-1000 ${showLeaderboardAnimation ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-quiz-dark dark:text-white">
              Game Results
            </h2>
            <Button 
              onClick={() => navigate('/')} 
              className="quiz-btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
          {activeGame.players && activeGame.quiz ? (
            <LeaderboardDisplay 
              players={activeGame.players}
              activeQuiz={activeGame.quiz}
              showScores={true}
              hasHostSubmitted={true}
            />
          ) : (
            <div className="text-center text-red-500 py-8 text-lg">
              Error: Player data or quiz data missing for leaderboard.
            </div>
          )}
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
            <>
              <div className="flex items-center justify-between bg-gray-800/50 dark:bg-gray-900/50 p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 border-2 border-indigo-400">
                    <AvatarImage src={currentPlayer?.avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentPlayer?.nickname}`} />
                    <AvatarFallback>{typeof currentPlayer?.nickname === 'string' && currentPlayer.nickname.length > 0 ? currentPlayer.nickname.charAt(0).toUpperCase() : ''}</AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-lg text-white">{currentPlayer?.nickname}</p>
                </div>
              </div>
              
              <LeaderboardDisplay
                players={activeGame.players}
                activeQuiz={activeGame.quiz}
                showScores={true}
                hasHostSubmitted={activeGame.hostSubmitted}
              />
            </>
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
      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 space-y-8">
        <Logo />
        
        <div className="w-full max-w-4xl space-y-6">
          {renderContent()}
        </div>
      </div>
    </BackgroundContainer>
  );
};
export default PlayerGameRoomPage;

