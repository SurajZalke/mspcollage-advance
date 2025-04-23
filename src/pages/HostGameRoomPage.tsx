
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
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types";

const PlayerStates = () => {
  const { activeGame, currentQuestion } = useGame();
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();

  if (!activeGame) return null;

  // Calculate the number of players who have answered the current question
  const playersAnswered = activeGame.players.filter(p => 
    p.answers.some(a => a.questionId === currentQuestion?.id)
  ).length || 0;

  const toggleResults = () => {
    setShowResults(!showResults);
    toast.toast({
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

const WaitingRoom: React.FC<{
  players: Player[];
  onStartGame: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  resetTilt: () => void;
}> = ({ players, onStartGame, cardRef, handleMouseMove, resetTilt }) => {
  return (
    <div 
      ref={cardRef}
      className="quiz-card p-6 transition-all duration-300 transform hover:shadow-xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-quiz-dark dark:text-white">
            Waiting for Players
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Share the game code with your students to let them join
          </p>
        </div>
        <Button 
          className="quiz-btn-primary text-lg px-8 py-6 h-auto mt-4 md:mt-0 animate-pulse-scale"
          onClick={onStartGame}
          disabled={players.length === 0}
        >
          Start Quiz
        </Button>
      </div>
      
      {players.length > 0 ? (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm p-4 animate-fade-in">
          <div className="flex items-center mb-4">
            <Users className="text-quiz-primary mr-2" />
            <h3 className="text-lg font-medium text-quiz-dark dark:text-white">
              Joined Players ({players.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600 transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-quiz-light dark:bg-indigo-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-2 animate-float">
                  <UserRound size={16} className="text-quiz-primary" />
                </div>
                <span className="font-medium truncate dark:text-gray-200">{player.nickname}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center bg-gray-50 dark:bg-gray-800/30 p-8 rounded-lg border border-dashed dark:border-gray-700">
          <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-red-500 dark:text-red-400 font-medium">
            No players have joined yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share the game code so players can join
          </p>
        </div>
      )}
    </div>
  );
};

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame, refreshGameState } = useGame();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 3D tilt effect
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

  // More frequent polling for better real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
      setConnectionStatus("connected");
    }, 500);

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
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, [refreshGameState]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/host-login");
    } else if (!activeGame || !isHost) {
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
    setShowResults(false);
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

  if (!currentUser || !activeGame || !currentQuiz) return null;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <BackgroundContainer className="min-h-screen">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <Logo />
            
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
              
              <span className="font-medium text-white text-sm px-2 py-1 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-md">
                {currentQuiz.title}
              </span>
              
              <span className="text-sm text-white/80 bg-black/20 px-2 py-1 rounded-md">
                Host: {currentUser.name}
              </span>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {activeGame.status === "waiting" ? (
                <WaitingRoom 
                  players={activeGame.players}
                  onStartGame={handleStartGame}
                  cardRef={cardRef}
                  handleMouseMove={handleMouseMove}
                  resetTilt={resetTilt}
                />
              ) : activeGame.status === "active" ? (
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
                        isHostView
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
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    The quiz session has been completed
                  </p>
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
              <div className="transform hover:scale-[1.02] transition-all duration-300">
                <GameCodeDisplay
                  code={activeGame.code}
                  playerCount={activeGame.players.length}
                />
              </div>
              
              <div className="transform hover:scale-[1.02] transition-all duration-300">
                <LeaderboardDisplay players={activeGame.players} />
              </div>
            </div>
          </div>
        </main>
      </BackgroundContainer>
    </div>
  );
};

export default HostGameRoomPage;
