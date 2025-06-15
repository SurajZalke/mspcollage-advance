
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import BackgroundContainer from "@/components/BackgroundContainer";
import CreatorAttribution from "@/components/CreatorAttribution";
import { useToast } from "@/components/ui/use-toast";
import GameHeader from "@/components/GameHeader";
import GameControls from "@/components/GameControls";
import PlayerStates from "@/components/PlayerStates";
import WaitingRoom from "@/components/WaitingRoom";
import QuestionDisplay from "@/components/QuestionDisplay";
import GameCodeDisplay from "@/components/GameCodeDisplay";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
import TrophyAnimation from "@/components/TrophyAnimation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebaseConfig";

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame, refreshGameState, setCorrectAnswer, submitAnswer } = useGame();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const { toast } = useToast();
  const cardRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (activeGame?.status === "ended") {
      console.log("Game has ended, navigating to leader animation page.");
      if (activeGame.players && activeGame.quiz) {
        navigate('/leader-animation', { state: { players: activeGame.players, activeQuiz: activeGame.quiz, currentQuestionIndex: activeGame.quiz.questions.length - 1, isHost: true } });
      } else {
        console.warn("Game ended but player or quiz data is missing for navigation.", activeGame);
      }
    }
  }, [activeGame, navigate]);

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

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
  
  const resetTilt = React.useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  }, []);

  const handleHostSelect = async (answerId: string) => {
    if (!currentQuestion || !activeGame) return;
    
    await setCorrectAnswer(answerId, currentQuestion.id);
    setHasSubmittedAnswer(true);
    
    // Submit the answer for the host
    if (activeGame?.hostId) {
      await submitAnswer(currentQuestion.id, answerId);
    }
    
    // Update game ref to ensure showScores is true
    const gameRef = ref(db, `games/${activeGame.id}`);
    await update(gameRef, { showScores: true });
    
    toast({
      title: "Answer Selected",
      description: "The correct answer has been recorded and revealed",
    });
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <CreatorAttribution />
        </div>
      </div>
    );
  }

  return (
    <BackgroundContainer>
      <div className="min-h-screen flex flex-col">
        <GameHeader 
          connectionStatus={connectionStatus}
          onRefresh={handleManualRefresh}
        />

        <main className="container mx-auto p-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {activeGame?.status === "waiting" ? (
                <WaitingRoom 
                  players={activeGame.players}
                  onStartGame={startGame}
                  gameCode={activeGame.code}
                  isHost={true}
                  onRefreshPlayers={handleManualRefresh}
                  cardRef={cardRef}
                  handleMouseMove={handleMouseMove}
                  resetTilt={resetTilt}
                />

              ) : activeGame?.status === "active" ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-quiz-dark dark:text-white">
                      Question {activeGame.currentQuestionIndex + 1} of {currentQuiz?.questions.length}
                    </h2>
                    <GameControls 
                        onEndGame={endGame}
                        onNextQuestion={() => {
                          nextQuestion();
                          setHasSubmittedAnswer(false);
                        }}
                        showNext={true} 
                        onStartGame={startGame}
                    />
                  </div>
                  
                  {activeGame?.status === "active" && currentQuestion && (
                    <div className="w-full max-w-4xl mx-auto">
                      <QuestionDisplay
                        question={{
                          ...currentQuestion,
                          correctOption: currentQuestion.correctOption
                        }}
                        isHostView={true}
                        onHostSelect={handleHostSelect}
                        disableOptions={activeGame.status !== 'active' || hasSubmittedAnswer || activeGame.showScores} // Disable options if correct answer is shown
                        showCorrectAnswer={activeGame.showScores}
                      />
                    </div>
                  )}
                  
                  {activeGame && activeGame.players && activeGame.players.length > 0 && (
                    <PlayerStates
                      players={activeGame.players}
                      currentQuestionId={currentQuestion?.id}
                      hasHostSubmitted={hasSubmittedAnswer}
                    />
                  )}
                  
                  {activeGame?.status === "active" && activeGame.players && activeGame.players.length > 0 && (
                    <LeaderboardDisplay
                    players={activeGame.players}
                    activeQuiz={activeGame.quiz}
                    showScores={true}
                    hasHostSubmitted={activeGame.hostSubmitted}
                  />
                  )}
                  
                  {currentQuestion && hasSubmittedAnswer && (
                    <Button
                      onClick={() => {
                        nextQuestion();
                        setHasSubmittedAnswer(false);
                      }}
                      className="quiz-btn-primary mt-4"
                    >
                      Next Question
                    </Button>
                  )}
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
                      <LeaderboardDisplay
                        players={activeGame.players}
                        activeQuiz={activeGame.quiz}
                        showScores={true}
                        hasHostSubmitted={true}
                      />
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
                  <div className="flex items-center gap-2">
                    <TrophyAnimation winners={[]} />
                    <span className="text-xl font-bold text-quiz-dark dark:text-white">
                      {activeGame.winner?.name}
                    </span>
                  </div>
                  <div className="transform hover:scale-[1.02] transition-all duration-300">
                    <div className="quiz-card p-6 text-center">
                      <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">
                        Quiz Status
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {activeGame.status === "waiting"
                          ? "Waiting for players to join"
                          : activeGame.status === "active"
                          ? "Quiz in progress"
                          : "Quiz ended"}
                      </p>
                    </div>
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
