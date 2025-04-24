import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRound, Users, Wifi, RefreshCw } from "lucide-react";
import Logo from "@/components/Logo";
import GameCodeDisplay from "@/components/GameCodeDisplay";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import BackgroundContainer from "@/components/BackgroundContainer";
import CreatorAttribution from "@/components/CreatorAttribution";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types";
import TrophyAnimation from "@/components/TrophyAnimation";
import { Progress } from "@/components/ui/progress";

const PlayerStates = () => {
  const { activeGame, currentQuestion } = useGame();
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  if (!activeGame) return null;

  const playersAnswered = activeGame.players.filter(p => 
    p.answers.some(a => a.questionId === currentQuestion?.id)
  ).length || 0;

  const toggleResults = () => {
    setShowResults(!showResults);
    toast({
      title: showResults ? "Results hidden" : "Results shown",
      description: showResults ? "Player answers are now hidden" : "Player answers are now visible",
    });
  };

  return (
    <div className="quiz-card p-4 transform hover:scale-[1.01] transition-all duration-300">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Player Responses</h3>
      <div className="flex items-center justify-between mb-4">
        <span>
          <span className="font-bold text-quiz-primary">
            {playersAnswered}
          </span>
          <span className="text-gray-600 dark:text-gray-300">
            /{activeGame.players.length} answered
          </span>
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleResults}
          className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          {showResults ? "Hide Results" : "Show Results"}
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Correct</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeGame.players.map((player, idx) => {
              const answer = player.answers.find(
                (a) => a.questionId === currentQuestion?.id
              );
              return (
                <TableRow 
                  key={player.id}
                  className="transform hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <TableCell className="font-medium">{player.nickname}</TableCell>
                  <TableCell>
                    {answer ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Answered
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        Waiting
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {answer ? `${answer.timeToAnswer}s` : "-"}
                  </TableCell>
                  <TableCell>
                    {showResults ? (
                      answer ? (
                        answer.correct ? (
                          <span className="text-green-600 dark:text-green-400 font-bold animate-pulse-scale">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-bold animate-pulse-scale">✗</span>
                        )
                      ) : (
                        "-"
                      )
                    ) : (
                      <span className="text-gray-400">Hidden</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame, refreshGameState, createGame } = useGame();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };
  
  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
      setConnectionStatus("connected");
    }, 300);

    const connectionCheck = setInterval(() => {
      const simulateNetworkDelay = Math.random() > 0.9;
      if (simulateNetworkDelay) {
        setConnectionStatus("connecting");
        setTimeout(() => setConnectionStatus("connected"), 500);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, [refreshGameState]);

  useEffect(() => {
    console.log("HostGameRoomPage rendered with currentUser:", currentUser);
    console.log("HostGameRoomPage rendered with activeGame:", activeGame);
    console.log("HostGameRoomPage rendered with isHost:", isHost);
    
    if (!activeGame && currentUser && isHost === false) {
      console.log("No active game found but user is logged in, redirecting to dashboard");
      toast({
        title: "No active game found",
        description: "Redirecting to dashboard",
        variant: "destructive"
      });
      setTimeout(() => navigate("/host-dashboard"), 1500);
    }
  }, [currentUser, activeGame, isHost, navigate, toast]);

  useEffect(() => {
    return () => {
      console.log("HostGameRoomPage unmounting");
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      console.log("No user found, redirecting to login");
      navigate("/host-login");
      return;
    }
    
    if (currentUser && !activeGame && isHost === false) {
      console.log("User logged in but no active game and not hosting, redirecting to dashboard");
      navigate("/host-dashboard");
    }
  }, [currentUser, activeGame, isHost, navigate]);

  const handleStartGame = () => {
    startGame();
    toast({
      title: "Game started!",
      description: "The quiz has begun",
    });
  };

  const handleNextQuestion = () => {
    nextQuestion();
    
    toast({
      title: "Next question",
      description: "Moving to the next question",
    });
  };

  const handleEndGame = () => {
    endGame();
    toast({
      title: "Game ended",
      description: "The quiz has ended",
    });
    navigate("/host-dashboard");
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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Loading...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!activeGame && !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-500">No Active Game</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            There's no active game session. Please create a new game from the dashboard.
          </p>
          <Button 
            onClick={() => navigate("/host-dashboard")}
            className="quiz-btn-primary"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!currentQuiz && activeGame?.quizId) {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        setLoadingProgress(progress);
      }, 300);

      import('@/utils/gameUtils').then(({ sampleQuizzes }) => {
        const foundQuiz = sampleQuizzes.find(q => q.id === activeGame.quizId);
        if (foundQuiz) {
          clearInterval(progressInterval);
          setLoadingProgress(100);
        }
      });

      return () => clearInterval(progressInterval);
    }
  }, [activeGame, currentQuiz]);

  if (!currentQuiz) {
    return (
      <BackgroundContainer className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-black/20 backdrop-blur-md rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6">Loading quiz information...</h2>
          <Progress value={loadingProgress} className="w-full h-3 mb-8" />
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="text-white/80 mt-6">
            Please wait while we prepare your quiz experience...
          </p>
          <CreatorAttribution />
        </div>
      </BackgroundContainer>
    );
  }

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

        <main className="container mx-auto p-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {activeGame?.status === "waiting" ? (
                <WaitingRoom 
                  players={activeGame.players}
                  onStartGame={handleStartGame}
                  cardRef={cardRef}
                  handleMouseMove={handleMouseMove}
                  resetTilt={resetTilt}
                />
              ) : activeGame?.status === "active" ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-quiz-dark dark:text-white">
                      Question {activeGame.currentQuestionIndex + 1} of {currentQuiz.questions.length}
                    </h2>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={handleEndGame}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                      >
                        End Quiz
                      </Button>
                      <Button 
                        className="quiz-btn-primary animate-pulse-scale"
                        onClick={handleNextQuestion}
                      >
                        Next Question
                      </Button>
                    </div>
                  </div>
                  
                  {currentQuestion && (
                    <div
                      ref={cardRef}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={resetTilt}
                      className="transition-all duration-300"
                    >
                      <QuestionDisplay 
                        question={currentQuestion} 
                        onAnswer={() => {}} 
                        showTimer={false}
                        isHostView={true}
                        markingType={currentQuiz.hasNegativeMarking ? "negative" : "simple"}
                        negativeValue={currentQuiz.negativeMarkingValue || 0}
                      />
                    </div>
                  )}
                  
                  <PlayerStates />
                </div>
              ) : (
                <div className="quiz-card p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
                  <h2 className="text-2xl font-bold text-quiz-dark dark:text-white mb-4">
                    Quiz Ended
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The quiz session has been completed
                  </p>
                  {activeGame && (
                    <div className="mb-6">
                      <TrophyAnimation winners={activeGame.players
                        .sort((a,b)=>b.score-a.score).slice(0,3)} />
                    </div>
                  )}
                  <Button 
                    className="quiz-btn-primary animate-pulse-scale"
                    onClick={() => navigate("/host-dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {activeGame && (
                <>
                  <div className="transform hover:scale-[1.02] transition-all duration-300">
                    <GameCodeDisplay
                      code={activeGame.code}
                      playerCount={activeGame.players.length}
                    />
                  </div>
                  <div className="transform hover:scale-[1.02] transition-all duration-300">
                    <LeaderboardDisplay 
                      players={activeGame.players} 
                      activeQuiz={currentQuiz} 
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        <CreatorAttribution />
      </div>
    </BackgroundContainer>
  );
};

export default HostGameRoomPage;
