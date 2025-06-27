import React, { useState, useEffect, useRef } from "react";
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
import { ref, update, onValue, off } from "firebase/database";
import { db } from "@/lib/firebaseConfig";

const warningSound = new Audio('/sounds/warning.mp3');

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame, refreshGameState, setCorrectAnswer, submitAnswer } = useGame();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const { toast } = useToast();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [emojis, setEmojis] = useState<{ id: string; emoji: string; playerId: string; timestamp: number }[]>([]);
  const [animatedEmojis, setAnimatedEmojis] = useState([]);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      console.log("No user found, redirecting to login");
      navigate("/host-login");
      return;
    }
    
    if (currentUser && !activeGame) {
      const storedGameId = localStorage.getItem('activeGameId');
      const storedIsHost = localStorage.getItem('isHost') === 'true';

      if (storedGameId && storedIsHost) {
        console.log("User logged in, no active game in context, but found stored host game. Attempting to refresh.");
        setIsLoading(true); // Set loading to true before refresh
        refreshGameState(storedGameId, currentUser.uid).finally(() => {
          setIsLoading(false); // Set loading to false after refresh completes
        });
      } else {
        console.log("User logged in but no active game and not hosting, redirecting to dashboard");
        setIsLoading(false); // No game to load, so set loading to false
        navigate("/host-dashboard");
      }
    } else if (activeGame) {
      setIsLoading(false); // Active game is already loaded, so set loading to false
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

  useEffect(() => {
    if (!activeGame?.id) return;

    const emojisRef = ref(db, `games/${activeGame.id}/emojis`);

    const unsubscribe = onValue(emojisRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedEmojis = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setEmojis(loadedEmojis);
      } else {
        setEmojis([]);
      }
    });

    return () => {
      off(emojisRef, 'value', unsubscribe);
    };
  }, [activeGame?.id]);

  useEffect(() => {
    if (!activeGame?.id) return;
    const chatRef = ref(db, `games/${activeGame.id}/emojiChat`);
    let lastId = null;
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arr = Object.entries(data).map(([id, msg]) => (typeof msg === 'object' && msg !== null ? { ...msg, id } : { id }));
      if (arr.length > 0) {
        const last = arr[arr.length - 1];
        // Type guard to ensure last has emoji, player, and avatar properties
        if (
          last &&
          typeof last === "object" &&
          "emoji" in last &&
          "player" in last &&
          "avatar" in last &&
          lastId !== last.id
        ) {
          setAnimatedEmojis((prev) => [
            ...prev,
            { emoji: (last as any).emoji, player: (last as any).player, avatar: (last as any).avatar, id: last.id }
          ]);
          setTimeout(() => {
            setAnimatedEmojis((prev) => prev.filter(e => e.id !== last.id));
          }, 5000); // match your animation duration
          lastId = last.id;
        }
      }
    });
    return () => unsubscribe();
  }, [activeGame?.id]);

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

  // Add a state for timeLeft
  const [timeLeft, setTimeLeft] = useState<number>(30); // Default to 30 seconds or appropriate value

  useEffect(() => {
    if (timeLeft <= 10 && !playedRef.current) {
      warningSound.play();
      playedRef.current = true;
    }
    if (timeLeft > 10) {
      playedRef.current = false;
    }
  }, [timeLeft]);

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Loading Game...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!activeGame) {
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
          name={currentUser?.user_metadata?.name}
          avatarUrl={currentUser?.user_metadata?.avatar_url} isWarningSoundEnabled={false} setIsWarningSoundEnabled={function (enabled: boolean): void {
            throw new Error("Function not implemented.");
          } }        />

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
                  nickname={currentUser?.user_metadata?.name}
                  avatarUrl={currentUser?.user_metadata?.avatar_url}
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
      {/* Emoji Fall Animation CSS */}
      <style>{`
.emoji-fall-cool {
  position: fixed;
  top: -40px;
  font-size: 1.25rem;
  z-index: 9999;
  pointer-events: none;
  text-align: center;
  width: 48px;
  margin-left: -24px;
  filter: drop-shadow(0 2px 8px #0008);
  animation: emojiCoolFall 5s cubic-bezier(.4,1.5,.5,1) forwards; /* Slower */
  opacity: 0.95;
}
        }
        .emoji-fall-cool {
          position: fixed;
          top: -60px;
          font-size: 2.8rem;
          z-index: 9999;
          pointer-events: none;
          text-align: center;
          width: 120px;
          margin-left: -60px;
          filter: drop-shadow(0 4px 16px #0008);
          animation: emojiCoolFall 2.8s cubic-bezier(.4,1.5,.5,1) forwards;
          opacity: 0.95;
        }
        .emoji-bounce-spin {
          display: inline-block;
          animation: emojiBounceSpin 1.2s cubic-bezier(.68,-0.55,.27,1.55) 1;
          filter: drop-shadow(0 0 12px #fff8) drop-shadow(0 0 24px #a5b4fc);
        }
        .emoji-sender {
          font-size: 1.1rem;
          color: #fff;
          text-shadow: 0 2px 8px #000a, 0 0 2px #a5b4fc;
          font-weight: bold;
          letter-spacing: 0.5px;
          margin-top: 0.2em;
          animation: emojiSenderFade 2.2s ease;
        }
        @keyframes emojiCoolFall {
          0% {
            transform: translateY(-60px) scale(1.3) rotate(-20deg);
            opacity: 0.7;
            filter: blur(2px) drop-shadow(0 0 16px #a5b4fc);
          }
          20% {
            opacity: 1;
            filter: blur(0px) drop-shadow(0 0 24px #a5b4fc);
          }
          60% {
            transform: translateY(60vh) scale(1.7) rotate(12deg);
            opacity: 1;
            filter: blur(0px) drop-shadow(0 0 32px #a5b4fc);
          }
          90% {
            filter: blur(1px) drop-shadow(0 0 8px #a5b4fc);
          }
          100% {
            transform: translateY(85vh) scale(2.1) rotate(24deg);
            opacity: 0;
            filter: blur(4px) drop-shadow(0 0 0px #a5b4fc);
          }
        }
        @keyframes emojiBounceSpin {
          0% { transform: scale(0.7) rotate(-40deg);}
          40% { transform: scale(1.3) rotate(20deg);}
          70% { transform: scale(1.1) rotate(-10deg);}
          100% { transform: scale(1) rotate(0);}
        }
        @keyframes emojiSenderFade {
          0% { opacity: 0; transform: translateY(-10px);}
          20% { opacity: 1; transform: translateY(0);}
          90% { opacity: 1;}
          100% { opacity: 0; transform: translateY(10px);}
        }
      `}</style>
      {animatedEmojis.map((item) => (
        <div
          key={item.id}
          className="emoji-fall-cool"
          style={{
            left: `${30 + Math.random() * 40}%`,
            animationDuration: "5s",
          }}
        >
          <div className="emoji-bounce-spin" style={{ fontSize: "1.25rem" }}>{item.emoji}</div>
          <div className="emoji-sender flex items-center justify-center gap-2">
            {item.avatar && (
              <img
                src={item.avatar}
                alt={item.player}
                className="w-5 h-5 rounded-full border border-white shadow"
              />
            )}
            <span style={{ fontSize: "0.95rem" }}>{item.player}</span>
          </div>
        </div>
      ))}
    </BackgroundContainer>
  );
};

export default HostGameRoomPage;